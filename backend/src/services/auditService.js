const AuditLog = require('../models/AuditLog');

// Wrapped in try/catch so a logging failure never breaks the actual request
async function logAction({ userId, action, documentId = null, targetUserId = null, metadata = {} }) {
  try {
    await AuditLog.create({ userId, action, documentId, targetUserId, metadata });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
}

module.exports = { logAction };