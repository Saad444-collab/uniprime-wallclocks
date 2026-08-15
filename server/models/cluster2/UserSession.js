const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const userSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String },
  ip: { type: String },
  userAgent: { type: String },
  expiresAt: { type: Date },
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = getConnection('cluster2').model('UserSession', userSessionSchema);