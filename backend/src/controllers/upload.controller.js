const db = require('../config/database');
const path = require('path');
const fs = require('fs');

// Upload images for a house
const uploadImages = async (req, res) => {
  try {
    const { houseId } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    // Check if house exists
    const houseCheck = await db.query('SELECT id FROM houses WHERE id = $1', [houseId]);
    if (houseCheck.rows.length === 0) {
      // Delete uploaded files
      files.forEach(file => {
        fs.unlinkSync(file.path);
      });
      return res.status(404).json({ error: 'House not found' });
    }

    // Check if this house already has images
    const existingImages = await db.query('SELECT id FROM house_images WHERE house_id = $1', [houseId]);
    const isFirstUpload = existingImages.rows.length === 0;

    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageUrl = `/uploads/${file.filename}`;
      const isPrimary = isFirstUpload && i === 0;

      const result = await db.query(
        'INSERT INTO house_images (house_id, image_url, is_primary) VALUES ($1, $2, $3) RETURNING *',
        [houseId, imageUrl, isPrimary]
      );

      uploadedImages.push(result.rows[0]);
    }

    res.status(201).json({
      message: 'Images uploaded successfully',
      images: uploadedImages
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete an image
const deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const result = await db.query(
      'DELETE FROM house_images WHERE id = $1 RETURNING *',
      [imageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete file from disk
    const imagePath = path.join(__dirname, '../../', result.rows[0].image_url);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Set primary image
const setPrimaryImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    // Get the image to find its house_id
    const imageResult = await db.query('SELECT * FROM house_images WHERE id = $1', [imageId]);
    
    if (imageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const houseId = imageResult.rows[0].house_id;

    // Remove primary from all images of this house
    await db.query('UPDATE house_images SET is_primary = false WHERE house_id = $1', [houseId]);

    // Set this image as primary
    await db.query('UPDATE house_images SET is_primary = true WHERE id = $1', [imageId]);

    res.json({ message: 'Primary image updated successfully' });
  } catch (error) {
    console.error('Set primary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  uploadImages,
  deleteImage,
  setPrimaryImage
};
