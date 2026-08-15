const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['general', 'bug', 'suggestion'], default: 'general' },
  message: { type: String, required: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = getConnection('cluster5').model('Feedback', feedbackSchema);