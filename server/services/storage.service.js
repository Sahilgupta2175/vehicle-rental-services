const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: process.env.CLD_NAME,
    api_key: process.env.CLD_KEY,
    api_secret: process.env.CLD_SECRET
});

// Upload single file from buffer
function uploadBuffer(buffer, folder = 'vehicles') {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { 
                folder: `vehicle-rental/${folder}`,
                transformation: [
                    { width: 1200, height: 800, crop: 'limit' },
                    { quality: 'auto' },
                    { fetch_format: 'auto' }
                ]
            }, 
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
}

// Upload multiple files
async function uploadMultiple(buffers, folder = 'vehicles') {
    try {
        const uploadPromises = buffers.map(buffer => uploadBuffer(buffer, folder));
        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        console.error('[Cloudinary] Multiple upload error:', error);
        throw error;
    }
}

// Delete file from Cloudinary
async function remove(public_id) {
    try {
        const result = await cloudinary.uploader.destroy(public_id);
        return result;
    } catch (error) {
        console.error('[Cloudinary] Delete error:', error);
        throw error;
    }
}

// Delete multiple files
async function removeMultiple(publicIds) {
    try {
        const deletePromises = publicIds.map(id => cloudinary.uploader.destroy(id));
        const results = await Promise.all(deletePromises);
        return results;
    } catch (error) {
        console.error('[Cloudinary] Multiple delete error:', error);
        throw error;
    }
}

// Get image details/metadata
async function getImageDetails(publicId) {
    try {
        const result = await cloudinary.api.resource(publicId);
        return result;
    } catch (error) {
        console.error('[Cloudinary] Get details error:', error);
        throw error;
    }
}

// Generate thumbnail URL
function generateThumbnail(publicId, width = 200, height = 200) {
    return cloudinary.url(publicId, {
        transformation: [
            { width, height, crop: 'fill' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
        ]
    });
}

// Generate optimized URL with transformations
function getOptimizedUrl(publicId, options = {}) {
    const {
        width,
        height,
        quality = 'auto',
        format = 'auto',
        crop = 'limit'
    } = options;

    const transformation = [];
    
    if (width || height) {
        transformation.push({ width, height, crop });
    }
    
    transformation.push({ quality, fetch_format: format });

    return cloudinary.url(publicId, { transformation });
}

// Upload with advanced options
async function uploadWithOptions(buffer, options = {}) {
    return new Promise((resolve, reject) => {
        const {
            folder = 'vehicles',
            public_id,
            tags = [],
            context = {},
            width,
            height,
            crop = 'limit'
        } = options;

        const uploadOptions = {
            folder: `vehicle-rental/${folder}`,
            tags,
            context
        };

        if (public_id) uploadOptions.public_id = public_id;
        
        if (width || height) {
            uploadOptions.transformation = [
                { width, height, crop },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ];
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            }
        );
        
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
}

// Check if Cloudinary is configured
function isConfigured() {
    return !!(process.env.CLD_NAME && process.env.CLD_KEY && process.env.CLD_SECRET);
}

module.exports = { 
    uploadBuffer, 
    uploadMultiple,
    remove,
    removeMultiple,
    getImageDetails,
    generateThumbnail,
    getOptimizedUrl,
    uploadWithOptions,
    isConfigured
};
