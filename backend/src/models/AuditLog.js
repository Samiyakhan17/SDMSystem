const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: {
      type: String,
      enum: [
        'upload', 'download', 'share', 'unshare',
        'delete', 'restore', 'permission_change',
        'login', 'login_failed', 'register',
      ],
      required: true,
    },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }, // free-form extra detail
    ipAddress: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);