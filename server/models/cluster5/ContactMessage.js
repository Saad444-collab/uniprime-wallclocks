const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  subject: { type: String, trim: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = getConnection('cluster5').model('ContactMessage', contactMessageSchema);