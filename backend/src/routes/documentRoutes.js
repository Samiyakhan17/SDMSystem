const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  uploadDocument,
  listDocuments,
  getDocument,
  renameDocument,
  deleteDocument,
  downloadDocument,
} = require('../controllers/documentController');
const { shareDocument, listShares, revokeShare } = require('../controllers/shareController');
const { uploadVersion, listVersions } = require('../controllers/versionController');

const router = express.Router();

router.use(protect);

router.post('/', upload.single('file'), uploadDocument);
router.get('/', listDocuments);
router.get('/:id', getDocument);
router.put('/:id', renameDocument);
router.delete('/:id', deleteDocument);
router.get('/:id/download', downloadDocument);
router.post('/:id/share', shareDocument);
router.get('/:id/shares', listShares);
router.delete('/:id/shares/:userId', revokeShare);
router.post('/:id/versions', upload.single('file'), uploadVersion);
router.get('/:id/versions', listVersions);

module.exports = router;