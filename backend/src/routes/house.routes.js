const express = require('express');
const router = express.Router();
const {
  getAllHouses,
  getHouseById,
  createHouse,
  updateHouse,
  deleteHouse,
  getHouseTypes,
  getDashboardStats
} = require('../controllers/house.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getAllHouses);
router.get('/types', getHouseTypes);
router.get('/:id', getHouseById);

// Admin routes (protected)
router.post('/', authMiddleware, adminMiddleware, createHouse);
router.put('/:id', authMiddleware, adminMiddleware, updateHouse);
router.delete('/:id', authMiddleware, adminMiddleware, deleteHouse);

// Dashboard stats (admin only)
router.get('/admin/stats', authMiddleware, adminMiddleware, getDashboardStats);

module.exports = router;
