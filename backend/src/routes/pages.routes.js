const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');
const {
  getAllPages,
  getPageBySlug,
  updatePage,
  createPage,
  deletePage
} = require('../controllers/pages.controller');

// Public routes
router.get('/', getAllPages);
router.get('/:slug', getPageBySlug);

// Admin routes (require both auth and admin middleware)
router.post('/', authMiddleware, adminMiddleware, createPage);
router.put('/:slug', authMiddleware, adminMiddleware, updatePage);
router.delete('/:slug', authMiddleware, adminMiddleware, deletePage);

module.exports = router;
