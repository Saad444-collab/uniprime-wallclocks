const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String },
  fileMetadata: { type: mongoose.Schema.Types.ObjectId, ref: 'FileMetadata' },
  content: { type: mongoose.Schema.Types.Mixed },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = getConnection('cluster4').model('Document', documentSchema);