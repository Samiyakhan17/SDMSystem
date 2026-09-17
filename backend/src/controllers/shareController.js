const { logAction } = require('../services/auditService');
const User = require('../models/User');
const Document = require('../models/Document');
const Share = require('../models/Share');

// POST /api/documents/:id/share
async function shareDocument(req, res, next) {
  try {
    const { email, permission, expiresAt } = req.body;

    if (!email || !permission) {
      res.status(400);
      throw new Error('email and permission are required');
    }
    if (!['view', 'download', 'edit'].includes(permission)) {
      res.status(400);
      throw new Error('permission must be one of: view, download, edit');
    }

    const document = await Document.findById(req.params.id);
    if (!document || document.isDeleted) {
      res.status(404);
      throw new Error('Document not found');
    }
    if (document.ownerId.toString() !== req.user.id.toString()) {
      res.status(403);
      throw new Error('Only the document owner can share it');
    }

    const targetUser = await User.findOne({ email: email.toLowerCase() });
    if (!targetUser) {
      res.status(404);
      throw new Error('No user found with that email');
    }
    if (targetUser._id.toString() === req.user.id.toString()) {
      res.status(400);
      throw new Error('You cannot share a document with yourself');
    }

    // Upsert - sharing again with the same person just updates their permission
    const share = await Share.findOneAndUpdate(
      { documentId: document._id, sharedWithUserId: targetUser._id },
      {
        documentId: document._id,
        ownerId: req.user.id,
        sharedWithUserId: targetUser._id,
        permission,
        expiresAt: expiresAt || null,
      },
      { new: true, upsert: true, runValidators: true }
    );
    await logAction({
      userId: req.user.id,
      action: 'share',
      documentId: document._id,
      targetUserId: targetUser._id,
      metadata: { permission },
    });
    res.status(201).json({ success: true, share });
  } catch (err) {
    next(err);
  }
}

// GET /api/documents/:id/shares
async function listShares(req, res, next) {
  try {
    const document = await Document.findById(req.params.id);
    if (!document || document.isDeleted) {
      res.status(404);
      throw new Error('Document not found');
    }
    if (document.ownerId.toString() !== req.user.id.toString()) {
      res.status(403);
      throw new Error('Only the document owner can view its shares');
    }

    const shares = await Share.find({ documentId: document._id }).populate(
      'sharedWithUserId',
      'name email'
    );

    res.status(200).json({ success: true, count: shares.length, shares });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/documents/:id/shares/:userId
async function revokeShare(req, res, next) {
  try {
    const document = await Document.findById(req.params.id);
    if (!document || document.isDeleted) {
      res.status(404);
      throw new Error('Document not found');
    }
    if (document.ownerId.toString() !== req.user.id.toString()) {
      res.status(403);
      throw new Error('Only the document owner can revoke access');
    }

    const result = await Share.findOneAndDelete({
      documentId: document._id,
      sharedWithUserId: req.params.userId,
    });

    if (!result) {
      res.status(404);
      throw new Error('Share not found');
    }
    await logAction({
      userId: req.user.id,
      action: 'unshare',
      documentId: document._id,
      targetUserId: req.params.userId,
    });
    res.status(200).json({ success: true, message: 'Access revoked' });
  } catch (err) {
    next(err);
  }
}

module.exports = { shareDocument, listShares, revokeShare };