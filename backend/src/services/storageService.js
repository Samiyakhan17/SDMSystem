const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');

function bufferToStream(buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

// Uploads a file buffer straight to Cloudinary
function uploadBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'sdms',
        resource_type: 'auto',
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    bufferToStream(buffer).pipe(uploadStream);
  });
}

// Permanently deletes a file from Cloudinary
async function deleteFile(storageUrl) {
  if (!storageUrl) return;

  const url = new URL(storageUrl);

  const pathParts = url.pathname.split('/');

  const uploadIndex = pathParts.indexOf('upload');

  if (uploadIndex === -1) {
    throw new Error('Invalid Cloudinary URL');
  }

  // Everything after /upload/ belongs to the uploaded asset
  let publicIdParts = pathParts.slice(uploadIndex + 1);

  // Remove version such as v123456789
  if (
    publicIdParts[0] &&
    /^v\d+$/.test(publicIdParts[0])
  ) {
    publicIdParts.shift();
  }

  let publicId = publicIdParts.join('/');

  // Remove file extension
  publicId = publicId.replace(/\.[^/.]+$/, '');

  // Detect Cloudinary resource type from URL
  let resourceType = 'image';

  if (pathParts.includes('raw')) {
    resourceType = 'raw';
  } else if (pathParts.includes('video')) {
    resourceType = 'video';
  }

  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
}

module.exports = {
  uploadBuffer,
  deleteFile,
};