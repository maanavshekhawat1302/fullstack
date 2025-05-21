import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { Vonage } from '@vonage/server-sdk';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false, // for local dev
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, username, phone, dateOfBirth } = req.body;
    if (!email || !password || !username || !phone || !dateOfBirth) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      username,
      phone,
      dateOfBirth,
    });
    await user.save();
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not defined');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
      },
    });
  } catch (err: any) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(409).json({ message: 'Email already in use.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not defined');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

export const logout = async (req: Request, res: Response) => {
  // Since we're using JWT, we don't need to do anything on the server side
  // The client should remove the token
  res.json({ message: 'Logged out successfully' });
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with that email.' });
    }
    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}reset-password?token=${token}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset.</p><p>Click <a href="${resetUrl}">here</a> to reset your password. This link will expire in 1 hour.</p>`,
    });
    res.json({ message: 'Password reset email sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

export const requestOtp = async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required.' });
  }
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'No user found with that phone number.' });
    }
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP via SMS using Vonage (Nexmo)
    const vonage = new Vonage({
      apiKey: process.env.VONAGE_API_KEY!,
      apiSecret: process.env.VONAGE_API_SECRET!,
    } as any);

    const from = process.env.VONAGE_BRAND_NAME || 'VonageOTP';
    let to = user.phone;
    if (!to.startsWith('+')) {
      // If it's a 10-digit number, assume it's an Indian number and prepend +91
      if (/^\d{10}$/.test(to)) {
        to = '+91' + to;
      } else {
        to = '+' + to;
      }
    }
    const text = `Your OTP code is ${otp}. It will expire in 10 minutes.`;

    try {
      const response = await vonage.sms.send({ to, from, text });
      if (response.messages[0].status !== '0') {
        throw new Error(response.messages[0]['errorText']);
      }
    } catch (err) {
      return res.status(500).json({ message: 'Failed to send OTP SMS.' });
    }

    res.json({ message: 'OTP sent to your phone number.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone number and OTP are required.' });
  }
  try {
    const user = await User.findOne({ phone, otp, otpExpires: { $gt: new Date() } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    // Clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    // Generate JWT and set cookie
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not defined');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
}; 