const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const reportTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String },
  definition: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = getConnection('cluster4').model('ReportTemplate', reportTemplateSchema);