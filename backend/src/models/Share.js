const mongoose = require('mongoose');

const shareSchema = new mongoose.Schema(
  {
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWithUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    permission: { type: String, enum: ['view', 'download', 'edit'], required: true },
    expiresAt: { type: Date, default: null }, // null = never expires
  },
  { timestamps: true }
);

// Prevent duplicate shares of the same doc to the same user
shareSchema.index({ documentId: 1, sharedWithUserId: 1 }, { unique: true });

module.exports = mongoose.model('Share', shareSchema);