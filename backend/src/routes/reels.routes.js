const express = require('express');
const router = express.Router();
const reelsController = require('../controllers/reels.controller');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', reelsController.getAllReels);
router.get('/:id', reelsController.getReelById);

// Admin routes (protected)
router.post('/', authenticateToken, reelsController.createReel);
router.put('/:id', authenticateToken, reelsController.updateReel);
router.delete('/:id', authenticateToken, reelsController.deleteReel);
router.put('/reorder/all', authenticateToken, reelsController.reorderReels);

module.exports = router;
