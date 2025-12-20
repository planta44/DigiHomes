const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSetting,
  getLocations,
  addLocation,
  deleteLocation,
  getHouseTypes,
  addHouseType,
  deleteHouseType
} = require('../controllers/settings.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getSettings);
router.get('/locations', getLocations);
router.get('/house-types', getHouseTypes);

// Admin routes
router.put('/:key', authMiddleware, adminMiddleware, updateSetting);
router.post('/locations', authMiddleware, adminMiddleware, addLocation);
router.delete('/locations/:id', authMiddleware, adminMiddleware, deleteLocation);
router.post('/house-types', authMiddleware, adminMiddleware, addHouseType);
router.delete('/house-types/:id', authMiddleware, adminMiddleware, deleteHouseType);

module.exports = router;
