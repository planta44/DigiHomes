const express = require('express');
const router = express.Router();
const reelsController = require('../controllers/reels.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Public routes
router.get('/', reelsController.getAllReels);
router.get('/:id', reelsController.getReelById);

// Admin routes (protected)
router.post('/', authMiddleware, reelsController.createReel);
router.put('/:id', authMiddleware, reelsController.updateReel);
router.delete('/:id', authMiddleware, reelsController.deleteReel);
router.put('/reorder/all', authMiddleware, reelsController.reorderReels);

module.exports = router;
