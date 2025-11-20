const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: process.env.CLD_NAME,
    api_key: process.env.CLD_KEY,
    api_secret: process.env.CLD_SECRET
});

function uploadBuffer(buffer, folder = 'vehicles') {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
            if (error) {
                return reject(error);
            }
            
            resolve(result);
        });
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
}

async function remove(public_id) {
    return cloudinary.uploader.destroy(public_id);
}

module.exports = { uploadBuffer, remove };
