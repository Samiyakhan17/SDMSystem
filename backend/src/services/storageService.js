const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');

function bufferToStream(buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

// Uploads a file buffer (from Multer's memory storage) straight to Cloudinary
// without ever writing it to disk on our own server.
function uploadBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'sdms', // keeps all project files grouped in one Cloudinary folder
        resource_type: 'auto', // lets Cloudinary store images, PDFs, docs, zips correctly
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

module.exports = { uploadBuffer };