const multer = require('multer');

// memory storage for direct upload to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ 
    storage, 
    limits: { fileSize: 10 * 1024 * 1024 } 
});

module.exports = upload;
