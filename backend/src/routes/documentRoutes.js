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
   listTrash,
  restoreDocument,
  permanentlyDeleteDocument,
} = require('../controllers/documentController');
const {
  shareDocument,
  listShares,
  revokeShare,
  listSharedWithMe,
} = require('../controllers/shareController');
const { uploadVersion, listVersions } = require('../controllers/versionController');

const router = express.Router();

router.use(protect);

router.post('/', upload.single('file'), uploadDocument);

router.get('/', listDocuments);

// Trash
router.get('/trash', listTrash);

// Shared documents
router.get('/shared-with-me', listSharedWithMe);

// Restore
router.put('/:id/restore', restoreDocument);

// Permanently delete
router.delete('/:id/permanent', permanentlyDeleteDocument);

// Specific document actions
router.get('/:id/download', downloadDocument);
router.post('/:id/share', shareDocument);
router.get('/:id/shares', listShares);
router.delete('/:id/shares/:userId', revokeShare);

router.post('/:id/versions', upload.single('file'), uploadVersion);
router.get('/:id/versions', listVersions);

// General document routes — keep these AFTER the specific routes
router.get('/:id', getDocument);
router.put('/:id', renameDocument);
router.delete('/:id', deleteDocument);

module.exports = router;