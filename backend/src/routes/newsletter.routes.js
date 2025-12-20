const express = require('express');
const router = express.Router();
const { subscribe, checkEmail, getAllSubscribers, deleteSubscriber, verifyEmail, broadcastEmail } = require('../controllers/newsletter.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

// Public routes
router.post('/subscribe', subscribe);
router.post('/check-email', checkEmail);
router.get('/verify', verifyEmail);

// Admin routes (protected)
router.get('/subscribers', authMiddleware, adminMiddleware, getAllSubscribers);
router.delete('/subscribers/:id', authMiddleware, adminMiddleware, deleteSubscriber);
router.post('/broadcast', authMiddleware, adminMiddleware, broadcastEmail);

module.exports = router;
