const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { uploadImages, deleteImage, setPrimaryImage } = require('../controllers/upload.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

// Check if Cloudinary is configured
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

let upload;
let uploadToCloudinary;

if (useCloudinary) {
  // Use Cloudinary storage
  const cloudinaryConfig = require('../config/cloudinary');
  uploadToCloudinary = cloudinaryConfig.uploadToCloudinary;
  upload = uploadToCloudinary;
} else {
  // Fallback to local storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP and SVG are allowed.'), false);
    }
  };

  upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
  });
}

// General single image upload (admin only) - for logos, backgrounds, etc.
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    // Cloudinary returns path in req.file.path, local storage needs /uploads/ prefix
    const imageUrl = useCloudinary ? req.file.path : `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl, filename: req.file.filename || req.file.public_id });
  }
);

// Upload images for a house (admin only)
router.post(
  '/house/:houseId',
  authMiddleware,
  adminMiddleware,
  upload.array('images', 10),
  uploadImages
);

// Delete an image (admin only)
router.delete('/image/:imageId', authMiddleware, adminMiddleware, deleteImage);

// Set primary image (admin only)
router.put('/image/:imageId/primary', authMiddleware, adminMiddleware, setPrimaryImage);

module.exports = router;
