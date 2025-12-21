const express = require('express');
const router = express.Router();
const { adminMiddleware } = require('../middleware/auth.middleware');
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

// Admin routes
router.post('/', adminMiddleware, createPage);
router.put('/:slug', adminMiddleware, updatePage);
router.delete('/:slug', adminMiddleware, deletePage);

module.exports = router;
