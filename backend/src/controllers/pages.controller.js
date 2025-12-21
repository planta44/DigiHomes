const db = require('../config/database');

// Get all pages (public)
const getAllPages = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM pages WHERE is_active = true ORDER BY title');
    res.json(result.rows);
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get page by slug (public)
const getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await db.query('SELECT * FROM pages WHERE slug = $1', [slug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update page (admin only)
const updatePage = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content, is_active } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (content !== undefined) {
      updates.push(`content = $${paramCount++}`);
      values.push(JSON.stringify(content));
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(slug);

    const result = await db.query(
      `UPDATE pages SET ${updates.join(', ')} WHERE slug = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create page (admin only)
const createPage = async (req, res) => {
  try {
    const { slug, title, content } = req.body;

    if (!slug || !title) {
      return res.status(400).json({ error: 'Slug and title are required' });
    }

    const result = await db.query(
      'INSERT INTO pages (slug, title, content) VALUES ($1, $2, $3) RETURNING *',
      [slug, title, JSON.stringify(content || {})]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Page with this slug already exists' });
    }
    console.error('Create page error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete page (admin only)
const deletePage = async (req, res) => {
  try {
    const { slug } = req.params;
    await db.query('DELETE FROM pages WHERE slug = $1', [slug]);
    res.json({ message: 'Page deleted' });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllPages,
  getPageBySlug,
  updatePage,
  createPage,
  deletePage
};
