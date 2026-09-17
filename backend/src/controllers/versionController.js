const Document = require('../models/Document');
const Version = require('../models/Version');
const { uploadBuffer } = require('../services/storageService');
const { checkDocumentAccess } = require('../utils/checkAccess');

// POST /api/documents/:id/versions  (multipart/form-data, field name: "file")
async function uploadVersion(req, res, next) {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded (expected field name "file")');
    }

    const document = await Document.findById(req.params.id);
    if (!document || document.isDeleted) {
      res.status(404);
      throw new Error('Document not found');
    }

    // Only the owner or someone with "edit" access can add a new version
    const access = await checkDocumentAccess(document, req.user.id, 'edit');
    if (!access.allowed) {
      res.status(403);
      throw new Error('You do not have permission to add a new version');
    }

    const result = await uploadBuffer(req.file.buffer, {
      public_id: `${Date.now()}-${req.file.originalname.split('.')[0]}`,
    });

    const newVersionNumber = document.currentVersion + 1;

    // Save this new file as a version record
    const version = await Version.create({
      documentId: document._id,
      versionNumber: newVersionNumber,
      storageKey: result.secure_url,
      size: req.file.size,
      uploadedBy: req.user.id,
    });

    // Point the document itself at the newest version
    document.storageKey = result.secure_url;
    document.mimeType = req.file.mimetype;
    document.size = req.file.size;
    document.currentVersion = newVersionNumber;
    await document.save();

    res.status(201).json({ success: true, version, document });
  } catch (err) {
    next(err);
  }
}

// GET /api/documents/:id/versions
async function listVersions(req, res, next) {
  try {
    const document = await Document.findById(req.params.id);
    if (!document || document.isDeleted) {
      res.status(404);
      throw new Error('Document not found');
    }

    const access = await checkDocumentAccess(document, req.user.id);
    if (!access.allowed) {
      res.status(403);
      throw new Error('You do not have access to this document');
    }

    const versions = await Version.find({ documentId: document._id })
      .sort({ versionNumber: -1 })
      .populate('uploadedBy', 'name email');

    res.status(200).json({ success: true, count: versions.length, versions });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadVersion, listVersions };