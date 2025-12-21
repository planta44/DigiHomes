const db = require('../config/database');

// Get all reels (public)
const getAllReels = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM digi_reels 
       WHERE is_active = true 
       ORDER BY display_order ASC, created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get reels error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single reel by ID
const getReelById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM digi_reels WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reel not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get reel error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create reel (admin only)
const createReel = async (req, res) => {
  try {
    const { title, description, media_url, media_type, thumbnail_url, display_order } = req.body;
    
    if (!title || !media_url) {
      return res.status(400).json({ error: 'Title and media URL are required' });
    }
    
    const result = await db.query(
      `INSERT INTO digi_reels (title, description, media_url, media_type, thumbnail_url, display_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description || '', media_url, media_type || 'image', thumbnail_url || null, display_order || 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create reel error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

// Update reel (admin only)
const updateReel = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, media_url, media_type, thumbnail_url, is_active, display_order } = req.body;
    
    const existingReel = await db.query('SELECT * FROM digi_reels WHERE id = $1', [id]);
    if (existingReel.rows.length === 0) {
      return res.status(404).json({ error: 'Reel not found' });
    }
    
    const result = await db.query(
      `UPDATE digi_reels 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           media_url = COALESCE($3, media_url),
           media_type = COALESCE($4, media_type),
           thumbnail_url = $5,
           is_active = COALESCE($6, is_active),
           display_order = COALESCE($7, display_order),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [title, description, media_url, media_type, thumbnail_url, is_active, display_order, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update reel error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

// Delete reel (admin only)
const deleteReel = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingReel = await db.query('SELECT * FROM digi_reels WHERE id = $1', [id]);
    if (existingReel.rows.length === 0) {
      return res.status(404).json({ error: 'Reel not found' });
    }
    
    await db.query('DELETE FROM digi_reels WHERE id = $1', [id]);
    res.json({ message: 'Reel deleted successfully' });
  } catch (error) {
    console.error('Delete reel error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reorder reels (admin only)
const reorderReels = async (req, res) => {
  try {
    const { reelOrders } = req.body; // Array of { id, display_order }
    
    if (!Array.isArray(reelOrders)) {
      return res.status(400).json({ error: 'Invalid reorder data' });
    }
    
    for (const item of reelOrders) {
      await db.query(
        'UPDATE digi_reels SET display_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [item.display_order, item.id]
      );
    }
    
    res.json({ message: 'Reels reordered successfully' });
  } catch (error) {
    console.error('Reorder reels error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllReels,
  getReelById,
  createReel,
  updateReel,
  deleteReel,
  reorderReels
};
