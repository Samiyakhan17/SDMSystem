const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { listMyAuditLogs } = require('../controllers/auditController');

const router = express.Router();
router.use(protect);
router.get('/', listMyAuditLogs);

module.exports = router;