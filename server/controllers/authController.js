const { user: userRepo } = require('../repositories/userRepository');
const generateToken = require('../utils/generateToken');
const getCookieOptions = require('../utils/cookieOptions');
const crypto = require('crypto');
const { sendEmail } = require('../services/emailService');
const { logEmail } = require('../services/notificationService');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_LENGTH = 6;
const CLIENT_URL = () => process.env.CLIENT_URL || 'http://localhost:5173';

const generateOTP = () => {
  const digits = crypto.randomInt(0, 1000000).toString().padStart(OTP_LENGTH, '0');
  return digits;
};

const hashOTP = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const baseEmailLayout = (content) => `
  <div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px;background:#1a1a1a;color:#fff;border-radius:12px;">
    <div style="text-align:center;padding:20px;">
      <div style="width:60px;height:60px;border-radius:50%;border:3px solid #D4A843;margin:0 auto 15px;display:flex;align-items:center;justify-content:center;">
        <div style="width:8px;height:16px;background:#D4A843;border-radius:4px;transform:rotate(12deg);"></div>
      </div>
      <h1 style="color:#D4A843;font-family:Georgia,serif;">UniPrime Wall Clocks</h1>
    </div>
    ${content}
    <hr style="border-color:#333;margin:20px 0;">
    <p style="color:#666;font-size:12px;text-align:center;">UniPrime Wall Clocks &bull; Time, Reimagined.</p>
  </div>`;

const otpBox = (otp) => `
  <div style="text-align:center;margin:25px 0;">
    <div style="background:#252525;border:1px dashed #D4A843;border-radius:10px;padding:16px;display:inline-block;letter-spacing:8px;font-size:28px;font-weight:bold;color:#D4A843;">${otp}</div>
    <p style="color:#999;font-size:13px;margin-top:10px;">This code expires in 10 minutes.</p>
  </div>`;

const linkButton = (url, label) => `
  <div style="text-align:center;margin:25px 0;">
    <a href="${url}" style="background:linear-gradient(135deg,#D4A843,#B8922E);color:#1a1a1a;padding:14px 40px;border-radius:50px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">${label}</a>
  </div>`;

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existingUser = await userRepo.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const otp = generateOTP();

    const user = await userRepo.create({
      name,
      email: normalizedEmail,
      password,
      phone,
      verificationToken: verificationTokenHash,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
      verificationOTP: hashOTP(otp),
      verificationOTPExpires: Date.now() + 10 * 60 * 1000
    });

    try {
      const verifyUrl = `${CLIENT_URL()}/verify-email?token=${verificationToken}`;
      const sent = await sendEmail({
        to: user.email,
        subject: 'Verify your UniPrime account',
        html: baseEmailLayout(`
          <p style="color:#ccc;font-size:15px;line-height:1.6;">Thank you for creating an account. Please verify your email address to activate your account.</p>
          ${otpBox(otp)}
          <p style="color:#999;font-size:13px;text-align:center;">Or click the button below:</p>
          ${linkButton(verifyUrl, 'Verify Email')}
          <p style="color:#999;font-size:13px;text-align:center;">Or copy this link into your browser:<br><span style="color:#D4A843;font-size:12px;word-break:break-all;">${verifyUrl}</span></p>
        `)
      });
      logEmail({ to: user.email, subject: 'Verify your UniPrime account', template: 'verify-email', status: sent ? 'sent' : 'failed' });
    } catch (emailErr) {
      console.error('Verification email failed:', emailErr.message);
      logEmail({ to: user.email, subject: 'Verify your UniPrime account', template: 'verify-email', status: 'failed', error: emailErr.message });
    }

    const token = generateToken(user._id, user.role);

    res.cookie('token', token, getCookieOptions({ maxAge: 7 * 24 * 60 * 60 * 1000 }));

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await userRepo.findByEmailWithPassword(String(email).toLowerCase().trim());
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in.',
        needsVerification: true,
        email: user.email
      });
    }

    const token = generateToken(user._id, user.role);

    res.cookie('token', token, getCookieOptions({ maxAge: 7 * 24 * 60 * 60 * 1000 }));

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  res.cookie('token', '', getCookieOptions({ expires: new Date(0) }));
  res.json({ success: true, message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  try {
    const user = await userRepo.findByIdPopulateCart(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token, otp } = req.body;
    if (!token && !otp) {
      return res.status(400).json({ success: false, message: 'Verification token or OTP is required' });
    }

    let user = null;

    if (token) {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      user = await userRepo.findOne({
        verificationToken: hashedToken,
        verificationTokenExpires: { $gt: Date.now() }
      });
    } else if (otp) {
      const hashedOTP = hashOTP(String(otp).trim());
      user = await userRepo.findOne({
        verificationOTP: hashedOTP,
        verificationOTPExpires: { $gt: Date.now() }
      });
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    user.verificationOTP = undefined;
    user.verificationOTPExpires = undefined;
    await userRepo.save(user);

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await userRepo.findByEmail(String(email).toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'This email is already verified' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const otp = generateOTP();

    user.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    user.verificationOTP = hashOTP(otp);
    user.verificationOTPExpires = Date.now() + 10 * 60 * 1000;
    await userRepo.save(user);

    try {
      const verifyUrl = `${CLIENT_URL()}/verify-email?token=${verificationToken}`;
      const sent = await sendEmail({
        to: user.email,
        subject: 'Verify your UniPrime account',
        html: baseEmailLayout(`
          <p style="color:#ccc;font-size:15px;line-height:1.6;">Here is your new verification code for your UniPrime account.</p>
          ${otpBox(otp)}
          <p style="color:#999;font-size:13px;text-align:center;">Or click the button below:</p>
          ${linkButton(verifyUrl, 'Verify Email')}
        `)
      });
      logEmail({ to: user.email, subject: 'Verify your UniPrime account', template: 'verify-email-resend', status: sent ? 'sent' : 'failed' });
      if (!sent) {
        return res.status(502).json({ success: false, message: 'Could not send verification email right now. Please try again.' });
      }
    } catch (emailErr) {
      console.error('Resend verification email failed:', emailErr.message);
      logEmail({ to: user.email, subject: 'Verify your UniPrime account', template: 'verify-email-resend', status: 'failed', error: emailErr.message });
      return res.status(502).json({ success: false, message: 'Could not send verification email right now. Please try again.' });
    }

    res.json({ success: true, message: 'A new verification email has been sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await userRepo.findByEmail(String(email).toLowerCase().trim());
    if (!user) {
      return res.status(200).json({ success: true, message: 'If the email exists, a reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const otp = generateOTP();
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
    user.resetPasswordOTP = hashOTP(otp);
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
    await userRepo.save(user);

    try {
      const resetUrl = `${CLIENT_URL()}/reset-password?token=${resetToken}`;
      const sent = await sendEmail({
        to: user.email,
        subject: 'Password Reset - UniPrime Wall Clocks',
        html: baseEmailLayout(`
          <p style="color:#ccc;font-size:15px;line-height:1.6;">We received a request to reset your password. Use the code below or click the button to reset it.</p>
          ${otpBox(otp)}
          <p style="color:#999;font-size:13px;text-align:center;">Or click the button below:</p>
          ${linkButton(resetUrl, 'Reset Password')}
          <p style="color:#999;font-size:13px;text-align:center;">Or copy this link into your browser:<br><span style="color:#D4A843;font-size:12px;word-break:break-all;">${resetUrl}</span></p>
        `)
      });
      logEmail({ to: user.email, subject: 'Password Reset - UniPrime Wall Clocks', template: 'reset-password', status: sent ? 'sent' : 'failed' });
    } catch (emailErr) {
      console.error('Password reset email failed:', emailErr.message);
      logEmail({ to: user.email, subject: 'Password Reset - UniPrime Wall Clocks', template: 'reset-password', status: 'failed', error: emailErr.message });
    }

    res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, otp, newPassword } = req.body;
    if ((!token && !otp) || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token/OTP and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    let user = null;

    if (token) {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      user = await userRepo.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });
    } else if (otp) {
      const hashedOTP = hashOTP(String(otp).trim());
      user = await userRepo.findOne({
        resetPasswordOTP: hashedOTP,
        resetPasswordOTPExpires: { $gt: Date.now() }
      });
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await userRepo.save(user);

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, logout, getMe, verifyEmail, resendVerification, forgotPassword, resetPassword };