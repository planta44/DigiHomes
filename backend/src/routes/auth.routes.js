const express = require('express');
const router = express.Router();
const { checkAdminEmail, login, getMe, changePassword } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Check if email is admin (for newsletter-based login)
router.post('/check-admin', checkAdminEmail);

// Admin login
router.post('/login', login);

// Get current user (protected)
router.get('/me', authMiddleware, getMe);

// Change password (protected)
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
