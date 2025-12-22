const db = require('../config/database');

// Get all settings (public)
const getSettings = async (req, res) => {
  try {
    const result = await db.query('SELECT setting_key, setting_value FROM site_settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a setting (admin only)
const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key and value are required' });
    }

    const result = await db.query(
      `INSERT INTO site_settings (setting_key, setting_value, updated_at) 
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (setting_key) 
       DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [key, JSON.stringify(value)]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all locations
const getLocations = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM locations WHERE is_active = true ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add location (admin)
const addLocation = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Location name is required' });
    }

    const result = await db.query(
      'INSERT INTO locations (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add location error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete location (admin)
const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE locations SET is_active = false WHERE id = $1', [id]);
    res.json({ message: 'Location removed' });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all house types
const getHouseTypes = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM house_types WHERE is_active = true ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get house types error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add house type (admin)
const addHouseType = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'House type name is required' });
    }

    const result = await db.query(
      'INSERT INTO house_types (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add house type error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete house type (admin)
const deleteHouseType = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE house_types SET is_active = false WHERE id = $1', [id]);
    res.json({ message: 'House type removed' });
  } catch (error) {
    console.error('Delete house type error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get animation settings (public)
const getAnimationSettings = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT setting_value FROM site_settings WHERE setting_key = 'animation_settings'"
    );
    
    // Default animation settings
    const defaultSettings = {
      baseDelay: 100,
      cardStaggerMultiplier: 1,
      heroStaggerMultiplier: 1.5,
      sectionStaggerMultiplier: 1.2,
      heroTextDelay: 300,
      statsCountDuration: 2000
    };
    
    if (result.rows.length > 0 && result.rows[0].setting_value) {
      const stored = typeof result.rows[0].setting_value === 'string' 
        ? JSON.parse(result.rows[0].setting_value) 
        : result.rows[0].setting_value;
      res.json({ ...defaultSettings, ...stored });
    } else {
      res.json(defaultSettings);
    }
  } catch (error) {
    console.error('Get animation settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update animation settings (admin only)
const updateAnimationSettings = async (req, res) => {
  try {
    const { baseDelay, cardStaggerMultiplier, heroStaggerMultiplier, sectionStaggerMultiplier, heroTextDelay, statsCountDuration } = req.body;
    
    const settings = {
      baseDelay: Math.max(50, Math.min(500, parseInt(baseDelay) || 100)),
      cardStaggerMultiplier: Math.max(0.5, Math.min(5, parseFloat(cardStaggerMultiplier) || 1)),
      heroStaggerMultiplier: Math.max(0.5, Math.min(5, parseFloat(heroStaggerMultiplier) || 1.5)),
      sectionStaggerMultiplier: Math.max(0.5, Math.min(5, parseFloat(sectionStaggerMultiplier) || 1.2)),
      heroTextDelay: Math.max(100, Math.min(2000, parseInt(heroTextDelay) || 300)),
      statsCountDuration: Math.max(500, Math.min(5000, parseInt(statsCountDuration) || 2000))
    };

    await db.query(
      `INSERT INTO site_settings (setting_key, setting_value, updated_at) 
       VALUES ('animation_settings', $1, CURRENT_TIMESTAMP)
       ON CONFLICT (setting_key) 
       DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(settings)]
    );

    res.json(settings);
  } catch (error) {
    console.error('Update animation settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getSettings,
  updateSetting,
  getLocations,
  addLocation,
  deleteLocation,
  getHouseTypes,
  addHouseType,
  deleteHouseType,
  getAnimationSettings,
  updateAnimationSettings
};
