const db = require('../config/database');

// Get all settings (public)
const getSettings = async (req, res) => {
  try {
    const result = await db.query('SELECT setting_key, setting_value FROM site_settings');
    const settings = {};
    result.rows.forEach(row => {
      try {
        // Parse JSON string values back to objects/arrays
        settings[row.setting_key] = JSON.parse(row.setting_value);
      } catch (e) {
        // If parsing fails, return as-is
        settings[row.setting_key] = row.setting_value;
      }
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
    const value = req.body.value !== undefined ? req.body.value : req.body;

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

module.exports = {
  getSettings,
  updateSetting,
  getLocations,
  addLocation,
  deleteLocation,
  getHouseTypes,
  addHouseType,
  deleteHouseType,
  getAnimationSettings: async (req, res) => {
    try {
      const result = await db.query(
        "SELECT setting_value FROM site_settings WHERE setting_key = 'animation_settings'"
      );
      if (result.rows.length === 0) {
        return res.json({ enabled: true, heroStyle: 'slideUp', heroDuration: 800, statsCountDuration: 2000 });
      }
      res.json(result.rows[0].setting_value);
    } catch (error) {
      console.error('Get animation settings error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  updateAnimationSettings: async (req, res) => {
    try {
      const value = req.body;
      const result = await db.query(
        `INSERT INTO site_settings (setting_key, setting_value, updated_at) 
         VALUES ('animation_settings', $1, CURRENT_TIMESTAMP)
         ON CONFLICT (setting_key) 
         DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [JSON.stringify(value)]
      );
      res.json(result.rows[0].setting_value);
    } catch (error) {
      console.error('Update animation settings error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
};
