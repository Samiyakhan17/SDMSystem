const AuditLog = require('../models/AuditLog');

// GET /api/audit-logs  (your own activity history)
async function listMyAuditLogs(req, res, next) {
  try {
    const logs = await AuditLog.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (err) {
    next(err);
  }
}

module.exports = { listMyAuditLogs };