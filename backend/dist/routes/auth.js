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
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const passport_1 = __importDefault(require("../config/passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
router.post('/signup', (req, res) => (0, authController_1.signup)(req, res));
router.post('/login', (req, res) => (0, authController_1.login)(req, res));
router.post('/request-reset', (req, res) => (0, authController_1.requestPasswordReset)(req, res));
router.post('/reset-password', (req, res) => (0, authController_1.resetPassword)(req, res));
router.post('/request-otp', (req, res) => (0, authController_1.requestOtp)(req, res));
router.post('/verify-otp', (req, res) => (0, authController_1.verifyOtp)(req, res));
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: false, // for local dev
        sameSite: 'lax',
        path: '/',
    });
    res.status(200).json({ message: 'Logged out' });
});
// Google OAuth routes with debug logs
router.get('/google', (req, res, next) => {
    next();
}, passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', (req, res, next) => {
    next();
}, passport_1.default.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=Bad%20Request`
}), (req, res) => {
    const user = req.user;
    if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=Authentication%20failed`);
    }
    // Issue JWT and set cookie
    const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
    res.cookie('token', token, {
        httpOnly: true,
        secure: false, // for local dev
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173/dashboard');
});
router.get('/me', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token;
    if (!token)
        return res.status(401).json({ message: 'Not authenticated' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const user = yield User_1.default.findById(decoded.id).select('-password');
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    }
    catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
}));
exports.default = router;
