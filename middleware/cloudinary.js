// middleware/cloudinary.js
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'staplab-admin-images',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 1200, height: 630, crop: 'fill' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    };
  },
});

// Create multer upload middleware
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware to handle single image upload
const uploadSingle = upload.single('image');

// Middleware wrapper to handle errors and add image URL to req.body
const handleImageUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
      }
      return res.status(400).json({ error: err.message });
    }
    
    // If file was uploaded, add the Cloudinary URL to req.body
    if (req.file) {
      req.body.image = req.file.path;
      req.body.imagePublicId = req.file.public_id;
    }
    
    next();
  });
};

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    if (publicId) {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Helper function to extract public ID from Cloudinary URL
const extractPublicId = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  
  // Extract public ID from Cloudinary URL
  const matches = imageUrl.match(/\/v\d+\/(.+)\./);
  return matches ? matches[1] : null;
};

module.exports = {
  handleImageUpload,
  deleteImage,
  extractPublicId,
  cloudinary
};