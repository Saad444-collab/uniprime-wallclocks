const nodemailer = require('nodemailer');

const PLACEHOLDER_PATTERNS = [/^your_/i, /^(user|pass|email|password|example)/, /^xxxx/i];

const isPlaceholder = (value) => {
  if (!value) return true;
  return PLACEHOLDER_PATTERNS.some((re) => re.test(value.trim()));
};

const isConfigured = () => {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  return host && user && pass && !isPlaceholder(user) && !isPlaceholder(pass);
};

let transport = null;

const getTransport = () => {
  if (transport) return transport;
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  return transport;
};

const sendEmail = async ({ to, subject, html }) => {
  if (!isConfigured()) {
    console.warn('Email skipped: SMTP not configured. Set SMTP_HOST, SMTP_USER (real Gmail address) and SMTP_PASS (Gmail app password) in server/.env');
    return false;
  }
  try {
    await getTransport().sendMail({
      from: `"${process.env.FROM_NAME || 'UniPrime'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Email send failed:', error.message);
    return false;
  }
};

module.exports = { sendEmail, isConfigured };