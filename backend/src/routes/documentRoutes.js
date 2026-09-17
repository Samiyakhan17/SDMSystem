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

const router = express.Router();

// Every route below this line requires a valid JWT
router.use(protect);

router.post('/', upload.single('file'), uploadDocument);
router.get('/', listDocuments);
router.get('/:id', getDocument);
router.put('/:id', renameDocument);
router.delete('/:id', deleteDocument);
router.get('/:id/download', downloadDocument);

module.exports = router;