const Share = require('../models/Share');

// Central place for the permission logic from your plan:
// owner? -> active share? -> permission level high enough? -> not expired?
async function checkDocumentAccess(document, userId, requiredPermission = null) {
  const isOwner = document.ownerId.toString() === userId.toString();
  if (isOwner) {
    return { allowed: true, isOwner: true, permission: 'edit' };
  }

  const share = await Share.findOne({
    documentId: document._id,
    sharedWithUserId: userId,
  });

  if (!share) {
    return { allowed: false, isOwner: false, permission: null };
  }

  if (share.expiresAt && share.expiresAt < new Date()) {
    return { allowed: false, isOwner: false, permission: null }; // expired share
  }

  if (!requiredPermission) {
    return { allowed: true, isOwner: false, permission: share.permission };
  }

  // edit > download > view - higher permissions include the lower ones
  const rank = { view: 1, download: 2, edit: 3 };
  const hasEnough = rank[share.permission] >= rank[requiredPermission];

  return { allowed: hasEnough, isOwner: false, permission: share.permission };
}

module.exports = { checkDocumentAccess };