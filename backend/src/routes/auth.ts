import express, { Request, Response, NextFunction } from 'express';
import { signup, login, requestPasswordReset, resetPassword, requestOtp, verifyOtp } from '../controllers/authController';
import passport from '../config/passport';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

router.post('/signup', (req: Request, res: Response) => signup(req, res));
router.post('/login', (req: Request, res: Response) => login(req, res));
router.post('/request-reset', (req: Request, res: Response) => requestPasswordReset(req, res));
router.post('/reset-password', (req: Request, res: Response) => resetPassword(req, res));
router.post('/request-otp', (req: Request, res: Response) => requestOtp(req, res));
router.post('/verify-otp', (req: Request, res: Response) => verifyOtp(req, res));
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false, // for local dev
    sameSite: 'lax',
    path: '/',
  });
  res.status(200).json({ message: 'Logged out' });
});

// Google OAuth routes with debug logs
router.get('/google', (req: Request, res: Response, next: NextFunction) => {
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', (req: Request, res: Response, next: NextFunction) => {
  next();
}, passport.authenticate('google', {
  session: false,
  failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=Bad%20Request`
}), (req: Request, res: Response) => {
  const user = req.user as import('../models/User').IUser;
  if (!user) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=Authentication%20failed`);
  }
  // Issue JWT and set cookie
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: false, // for local dev
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173/dashboard');
});

router.get('/me', async (req: Request, res: Response) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as { id: string };
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router; 