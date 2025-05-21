"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.requestOtp = exports.resetPassword = exports.requestPasswordReset = exports.logout = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
const server_sdk_1 = require("@vonage/server-sdk");
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false, // for local dev
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, username, phone, dateOfBirth } = req.body;
        if (!email || !password || !username || !phone || !dateOfBirth) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use.' });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = new User_1.default({
            email,
            password: hashedPassword,
            username,
            phone,
            dateOfBirth,
        });
        yield user.save();
        if (!process.env.JWT_SECRET)
            throw new Error('JWT_SECRET is not defined');
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
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
    }
    catch (err) {
        if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
            return res.status(409).json({ message: 'Email already in use.' });
        }
        res.status(500).json({ message: 'Server error.' });
    }
});
exports.signup = signup;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        if (!process.env.JWT_SECRET)
            throw new Error('JWT_SECRET is not defined');
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
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
    }
    catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Since we're using JWT, we don't need to do anything on the server side
    // The client should remove the token
    res.json({ message: 'Logged out successfully' });
});
exports.logout = logout;
const requestPasswordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }
    try {
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No user found with that email.' });
        }
        // Generate token
        const token = crypto_1.default.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        yield user.save();
        // Send email
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}reset-password?token=${token}`;
        yield transporter.sendMail({
            to: user.email,
            subject: 'Password Reset Request',
            html: `<p>You requested a password reset.</p><p>Click <a href="${resetUrl}">here</a> to reset your password. This link will expire in 1 hour.</p>`,
        });
        res.json({ message: 'Password reset email sent.' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, password } = req.body;
    if (!token || !password) {
        return res.status(400).json({ message: 'Token and new password are required.' });
    }
    try {
        const user = yield User_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }
        user.password = yield bcryptjs_1.default.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        yield user.save();
        res.json({ message: 'Password has been reset successfully.' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});
exports.resetPassword = resetPassword;
const requestOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ message: 'Phone number is required.' });
    }
    try {
        const user = yield User_1.default.findOne({ phone });
        if (!user) {
            return res.status(404).json({ message: 'No user found with that phone number.' });
        }
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        yield user.save();
        // Send OTP via SMS using Vonage (Nexmo)
        const vonage = new server_sdk_1.Vonage({
            apiKey: process.env.VONAGE_API_KEY,
            apiSecret: process.env.VONAGE_API_SECRET,
        });
        const from = process.env.VONAGE_BRAND_NAME || 'VonageOTP';
        let to = user.phone;
        if (!to.startsWith('+')) {
            // If it's a 10-digit number, assume it's an Indian number and prepend +91
            if (/^\d{10}$/.test(to)) {
                to = '+91' + to;
            }
            else {
                to = '+' + to;
            }
        }
        const text = `Your OTP code is ${otp}. It will expire in 10 minutes.`;
        try {
            const response = yield vonage.sms.send({ to, from, text });
            if (response.messages[0].status !== '0') {
                throw new Error(response.messages[0]['errorText']);
            }
        }
        catch (err) {
            return res.status(500).json({ message: 'Failed to send OTP SMS.' });
        }
        res.json({ message: 'OTP sent to your phone number.' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});
exports.requestOtp = requestOtp;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
        return res.status(400).json({ message: 'Phone number and OTP are required.' });
    }
    try {
        const user = yield User_1.default.findOne({ phone, otp, otpExpires: { $gt: new Date() } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }
        // Clear OTP fields
        user.otp = undefined;
        user.otpExpires = undefined;
        yield user.save();
        // Generate JWT and set cookie
        if (!process.env.JWT_SECRET)
            throw new Error('JWT_SECRET is not defined');
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
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
    }
    catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});
exports.verifyOtp = verifyOtp;
