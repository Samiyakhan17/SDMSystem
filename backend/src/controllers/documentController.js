const { logAction } = require('../services/auditService');
const { checkDocumentAccess } = require('../utils/checkAccess');
const Document = require('../models/Document');
const { uploadBuffer } = require('../services/storageService');
const Version = require('../models/Version');

// POST /api/documents  (multipart/form-data, field name: "file")
async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded (expected field name "file")');
    }

    const result = await uploadBuffer(req.file.buffer, {
      public_id: `${Date.now()}-${req.file.originalname.split('.')[0]}`,
    });

    const document = await Document.create({
      ownerId: req.user.id,
      folderId: req.body.folderId || null,
      name: req.body.name || req.file.originalname,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      storageKey: result.secure_url, // Cloudinary's URL for this file
    });
    // Record this initial upload as version 1
    await Version.create({
      documentId: document._id,
      versionNumber: 1,
      storageKey: document.storageKey,
      size: document.size,
      uploadedBy: req.user.id,
    });
    await logAction({ userId: req.user.id, action: 'upload', documentId: document._id });
    res.status(201).json({ success: true, document });
  } catch (err) {
    next(err);
  }
}

// GET /api/documents?search=&mimeType=&folderId=&sort=&page=&limit=
async function listDocuments(req, res, next) {
  try {
    const { search, mimeType, folderId, sort = '-createdAt', page = 1, limit = 20 } = req.query;

    const filter = { ownerId: req.user.id, isDeleted: false };

    if (search) {
      filter.name = { $regex: search, $options: 'i' }; // case-insensitive partial match
    }
    if (mimeType) {
      filter.mimeType = mimeType;
    }
    if (folderId !== undefined) {
      filter.folderId = folderId === 'null' ? null : folderId;
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [documents, total] = await Promise.all([
      Document.find(filter).sort(sort).skip(skip).limit(limitNum),
      Document.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: documents.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      documents,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/documents/:id
async function getDocument(req, res, next) {
  try {
    const document = await Document.findById(req.params.id);

    if (!document || document.isDeleted) {
      res.status(404);
      throw new Error('Document not found');
    }
    // THE core security check from your plan: ownership before anything else
   const access = await checkDocumentAccess(document, req.user.id);
    if (!access.allowed) {
    res.status(403);
    throw new Error('You do not have access to this document');
    }

    res.status(200).json({ success: true, document });
  } catch (err) {
    next(err);
  }
}

// PUT /api/documents/:id  (rename and/or move to a folder)
async function renameDocument(req, res, next) {
  try {
    const { name, folderId } = req.body;
    if (!name && folderId === undefined) {
      res.status(400);
      throw new Error('Provide a new name and/or a folderId to update');
    }

    const document = await Document.findById(req.params.id);
    if (!document || document.isDeleted) {
      res.status(404);
      throw new Error('Document not found');
    }
    if (document.ownerId.toString() !== req.user.id.toString()) {
      res.status(403);
      throw new Error('You do not have access to this document');
    }

    if (name) {
      document.name = name;
    }

    // folderId can be a real folder's id, or null to move back to "root"
    if (folderId !== undefined) {
      if (folderId !== null) {
        const Folder = require('../models/Folder');
        const folder = await Folder.findById(folderId);
        if (!folder || folder.ownerId.toString() !== req.user.id.toString()) {
          res.status(404);
          throw new Error('Target folder not found');
        }
      }
      document.folderId = folderId;
    }

    await document.save();

    res.status(200).json({ success: true, document });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/documents/:id  (soft delete - moves to trash)
async function deleteDocument(req, res, next) {
  try {
    const document = await Document.findById(req.params.id);
    if (!document || document.isDeleted) {
      res.status(404);
      throw new Error('Document not found');
    }
    if (document.ownerId.toString() !== req.user.id.toString()) {
      res.status(403);
      throw new Error('You do not have access to this document');
    }

    document.isDeleted = true;
    await document.save();
    await logAction({ userId: req.user.id, action: 'delete', documentId: document._id });
    res.status(200).json({ success: true, message: 'Document moved to trash' });
  } catch (err) {
    next(err);
  }
}

// GET /api/documents/:id/download
async function downloadDocument(req, res, next) {
  try {
    const document = await Document.findById(req.params.id);
    if (!document || document.isDeleted) {
      res.status(404);
      throw new Error('Document not found');
    }
    const access = await checkDocumentAccess(document, req.user.id, 'download');
    if (!access.allowed) {
      res.status(403);
      throw new Error('You do not have permission to download this document');
    }
      await logAction({ userId: req.user.id, action: 'download', documentId: document._id });
    res.status(200).json({ success: true, downloadUrl: document.storageKey });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadDocument,
  listDocuments,
  getDocument,
  renameDocument,
  deleteDocument,
  downloadDocument,
};