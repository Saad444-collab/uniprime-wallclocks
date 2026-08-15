const ContactMessage = require('../models/ContactMessage');
const { sendEmail } = require('../services/emailService');

const escapeHtml = (str) => String(str)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    }
    if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'A valid email is required' });
    }

    await ContactMessage.create({
      name: String(name).slice(0, 100),
      email: String(email).toLowerCase().slice(0, 200),
      subject: String(subject || '').slice(0, 200),
      message: String(message).slice(0, 5000)
    });

    try {
      await sendEmail({
        to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
        subject: `Contact form: ${subject || 'New message'} from ${name}`,
        html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Subject:</strong> ${escapeHtml(subject || 'N/A')}</p><p><strong>Message:</strong></p><p>${escapeHtml(message)}</p>`
      });
    } catch (emailErr) {
      console.error('Contact email failed:', emailErr.message);
    }

    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getContactMessages = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status === 'read') query.isRead = true;
    if (status === 'unread') query.isRead = false;

    const total = await ContactMessage.countDocuments(query);
    const messages = await ContactMessage.find(query).sort({ createdAt: -1 }).limit(500);
    const unreadCount = await ContactMessage.countDocuments({ isRead: false });

    res.json({ success: true, data: { messages, total, unreadCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUnreadContactCount = async (req, res) => {
  try {
    const count = await ContactMessage.countDocuments({ isRead: false });
    res.json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markContactRead = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    message.isRead = true;
    await message.save();
    res.json({ success: true, message: 'Message marked as read', data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendContactMessage, getContactMessages, getUnreadContactCount, markContactRead, deleteContactMessage };