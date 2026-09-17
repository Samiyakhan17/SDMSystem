const Folder = require('../models/Folder');
const Document = require('../models/Document');

// POST /api/folders
async function createFolder(req, res, next) {
  try {
    const { name, parentFolderId } = req.body;
    if (!name) {
      res.status(400);
      throw new Error('Folder name is required');
    }

    // If a parent is given, confirm it exists and belongs to this user
    if (parentFolderId) {
      const parent = await Folder.findById(parentFolderId);
      if (!parent || parent.ownerId.toString() !== req.user.id.toString()) {
        res.status(404);
        throw new Error('Parent folder not found');
      }
    }

    const folder = await Folder.create({
      ownerId: req.user.id,
      parentFolderId: parentFolderId || null,
      name,
    });

    res.status(201).json({ success: true, folder });
  } catch (err) {
    next(err);
  }
}

// GET /api/folders?parentFolderId=<id>  (omit query param for top-level folders)
async function listFolders(req, res, next) {
  try {
    const { parentFolderId } = req.query;

    const filter = {
      ownerId: req.user.id,
      parentFolderId: parentFolderId || null,
    };

    const folders = await Folder.find(filter).sort({ name: 1 });
    res.status(200).json({ success: true, count: folders.length, folders });
  } catch (err) {
    next(err);
  }
}

// PUT /api/folders/:id  (rename)
async function renameFolder(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400);
      throw new Error('New name is required');
    }

    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      res.status(404);
      throw new Error('Folder not found');
    }
    if (folder.ownerId.toString() !== req.user.id.toString()) {
      res.status(403);
      throw new Error('You do not have access to this folder');
    }

    folder.name = name;
    await folder.save();

    res.status(200).json({ success: true, folder });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/folders/:id
async function deleteFolder(req, res, next) {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      res.status(404);
      throw new Error('Folder not found');
    }
    if (folder.ownerId.toString() !== req.user.id.toString()) {
      res.status(403);
      throw new Error('You do not have access to this folder');
    }

    // Safety check: don't allow deleting a folder that still has documents or subfolders.
    // This prevents silently "orphaning" files - the user has to move or delete them first.
    const docCount = await Document.countDocuments({ folderId: folder._id, isDeleted: false });
    const subfolderCount = await Folder.countDocuments({ parentFolderId: folder._id });

    if (docCount > 0 || subfolderCount > 0) {
      res.status(400);
      throw new Error('Folder is not empty. Move or delete its contents first.');
    }

    await folder.deleteOne();
    res.status(200).json({ success: true, message: 'Folder deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createFolder, listFolders, renameFolder, deleteFolder };