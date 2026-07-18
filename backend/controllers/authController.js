/**
 * authController.js
 * ─────────────────────────────────────────────────────────────
 * Handles all authentication logic:
 *   register → OTP email → verify OTP → login
 *   forgot password (3-step OTP flow)
 *   Google OAuth
 *   profile update
 * ─────────────────────────────────────────────────────────────
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTPEmail, sendForgotPasswordOTP } = require('../services/emailService');

// ── Validation helpers ────────────────────────────────────────

// Strong password: min 8 chars, upper, lower, number, special char
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Email validator (name@domain.com)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// International phone validator (allows all countries, optional +, spaces, dashes, parentheses)
const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;

// Generate a cryptographically random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Sign a JWT token that expires in 1 hour
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

// ─────────────────────────────────────────────────────────────
// @route  POST /api/auth/register
// @access Public
// Step 1 of registration: create user + send OTP
// ─────────────────────────────────────────────────────────────
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    // ── Validate required fields ──────────────────────────────
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address (e.g. name@example.com)' });
    }

    if (phone && phone.trim() && !phoneRegex.test(phone.trim())) {
      return res.status(400).json({ message: 'Please provide a valid phone number with country code' });
    }

    // ── Check for duplicates ──────────────────────────────────
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      // If account exists but unverified, resend OTP instead of rejecting
      if (!existingEmail.isEmailVerified) {
        const otp = generateOTP();
        existingEmail.otp = otp;
        existingEmail.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min
        existingEmail.otpType = 'register';
        await existingEmail.save();
        await sendOTPEmail(existingEmail.email, existingEmail.name, otp);
        return res.status(200).json({
          message: 'Account exists but is not verified. A new OTP has been sent to your email.',
          email: existingEmail.email,
        });
      }
      return res.status(400).json({ message: 'Email is already registered' });
    }

    if (await User.findOne({ name })) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // ── Hash password ─────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── Generate OTP ──────────────────────────────────────────
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // ── Create user (inactive until email verified) ───────────
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || null,
      isEmailVerified: false,
      otp,
      otpExpiry,
      otpType: 'register',
    });

    // ── Send OTP email ────────────────────────────────────────
    await sendOTPEmail(user.email, user.name, otp);

    res.status(201).json({
      message: 'Account created! Please check your email for a 6-digit verification code.',
      email: user.email,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route  POST /api/auth/verify-otp
// @access Public
// Verify 6-digit OTP after registration
// ─────────────────────────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified. Please log in.' });
    }

    // ── Check OTP type ────────────────────────────────────────
    if (user.otpType !== 'register') {
      return res.status(400).json({ message: 'Invalid OTP type. Please request a new code.' });
    }

    // ── Check OTP match ───────────────────────────────────────
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Incorrect verification code' });
    }

    // ── Check OTP expiry ──────────────────────────────────────
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    // ── Activate account ──────────────────────────────────────
    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpType = null;
    await user.save();

    // ── Issue JWT ─────────────────────────────────────────────
    const token = signToken(user._id);

    res.status(200).json({
      message: 'Email verified successfully! Welcome to AI InfoWave.',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route  POST /api/auth/resend-otp
// @access Public
// Resend OTP to the same email
// ─────────────────────────────────────────────────────────────
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'This email is already verified. Please log in.' });
    }

    // ── Generate fresh OTP ────────────────────────────────────
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    user.otpType = 'register';
    await user.save();

    await sendOTPEmail(user.email, user.name, otp);

    res.status(200).json({ message: 'A new verification code has been sent to your email.' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error while resending OTP' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route  POST /api/auth/login
// @access Public
// ─────────────────────────────────────────────────────────────
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // ── Block Google OAuth users from password login ───────────
    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({
        message: 'This account uses Google Sign-In. Please continue with Google.',
      });
    }

    // ── Verify password ───────────────────────────────────────
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // ── Block unverified accounts ─────────────────────────────
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        needsVerification: true,
        email: user.email,
      });
    }

    // ── Issue JWT ─────────────────────────────────────────────
    const token = signToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route  GET /api/auth/me
// @access Private (requires protect middleware)
// Returns the logged-in user's profile
// ─────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      isEmailVerified: req.user.isEmailVerified,
      authProvider: req.user.authProvider,
    },
  });
};

// ─────────────────────────────────────────────────────────────
// @route  PUT /api/auth/profile
// @access Private
// ─────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, phone } = req.body;

    if (name && name !== user.name) {
      if (await User.findOne({ name })) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.name = name;
    }

    if (phone !== undefined) user.phone = phone;

    await user.save();
    res.status(200).json({
      message: 'Profile updated',
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};



// ─────────────────────────────────────────────────────────────
// FORGOT PASSWORD — 3-step OTP flow
// ─────────────────────────────────────────────────────────────

// @route  POST /api/auth/forgot-password/request
// Step 1: User enters email → get OTP
exports.forgotPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Don't reveal whether account exists (security best practice)
    if (!user) {
      return res.status(200).json({
        message: 'If an account with that email exists, a reset code has been sent.',
      });
    }

    if (user.authProvider === 'google') {
      return res.status(400).json({
        message: 'This account uses Google Sign-In. Password reset is not available.',
      });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    user.otpType = 'forgot-password';
    await user.save();

    await sendForgotPasswordOTP(user.email, user.name, otp);

    res.status(200).json({
      message: 'A password reset code has been sent to your email.',
      email: user.email,
    });
  } catch (error) {
    console.error('Forgot password request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route  POST /api/auth/forgot-password/verify
// Step 2: User enters OTP → get a short-lived reset token
exports.verifyForgotPasswordOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    if (user.otpType !== 'forgot-password') {
      return res.status(400).json({ message: 'No password reset request found. Please start over.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Incorrect reset code' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'Reset code has expired. Please request a new one.' });
    }

    // ── OTP is valid — clear it and issue a short-lived reset token ──
    user.otp = null;
    user.otpExpiry = null;
    user.otpType = null;
    await user.save();

    // This token is only good for 10 minutes and is only for password reset
    const resetToken = jwt.sign(
      { id: user._id, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.status(200).json({
      message: 'OTP verified. You can now set a new password.',
      resetToken,
    });
  } catch (error) {
    console.error('Verify forgot password OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route  POST /api/auth/forgot-password/reset
// Step 3: User sets new password using resetToken
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmNewPassword } = req.body;

    if (!resetToken || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
      });
    }

    // ── Verify the reset token ────────────────────────────────
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: 'Reset token is invalid or expired. Please start over.' });
    }

    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully. Please log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

// ─────────────────────────────────────────────────────────────
// GOOGLE OAUTH CALLBACK
// Called by Passport after successful Google authentication
// ─────────────────────────────────────────────────────────────
exports.googleCallback = async (req, res) => {
  try {
    const user = req.user;
    const token = signToken(user._id);

    // Check if this Google account belongs to the admin
    const isAdmin = user.email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase();

    // Redirect to frontend with token + isAdmin flag
    res.redirect(
      `${process.env.CLIENT_URL}/auth/google/callback?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&isAdmin=${isAdmin}`
    );
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
  }
};
