const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const fileMetadataSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  fileName: { type: String },
  mimeType: { type: String },
  size: { type: Number },
  path: { type: String },
  url: { type: String },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = getConnection('cluster4').model('FileMetadata', fileMetadataSchema);