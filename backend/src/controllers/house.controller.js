const db = require('../config/database');

// Get all houses (public)
const getAllHouses = async (req, res) => {
  try {
    const { location, house_type, status, search, property_type, listing_type } = req.query;
    
    let query = `
      SELECT h.*, 
        COALESCE(
          json_agg(
            json_build_object('id', hi.id, 'image_url', hi.image_url, 'is_primary', hi.is_primary)
          ) FILTER (WHERE hi.id IS NOT NULL), 
          '[]'
        ) as images
      FROM houses h
      LEFT JOIN house_images hi ON h.id = hi.house_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (location) {
      paramCount++;
      query += ` AND h.location = $${paramCount}`;
      params.push(location);
    }

    if (house_type) {
      paramCount++;
      query += ` AND h.house_type = $${paramCount}`;
      params.push(house_type);
    }

    if (status) {
      paramCount++;
      query += ` AND h.vacancy_status = $${paramCount}`;
      params.push(status);
    }

    if (property_type) {
      paramCount++;
      query += ` AND h.property_type = $${paramCount}`;
      params.push(property_type);
    }

    if (listing_type) {
      paramCount++;
      query += ` AND h.listing_type = $${paramCount}`;
      params.push(listing_type);
    }

    if (search) {
      paramCount++;
      query += ` AND (h.title ILIKE $${paramCount} OR h.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY h.id ORDER BY h.featured DESC, h.created_at DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get houses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single house by ID
const getHouseById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT h.*, 
        COALESCE(
          json_agg(
            json_build_object('id', hi.id, 'image_url', hi.image_url, 'is_primary', hi.is_primary)
          ) FILTER (WHERE hi.id IS NOT NULL), 
          '[]'
        ) as images
      FROM houses h
      LEFT JOIN house_images hi ON h.id = hi.house_id
      WHERE h.id = $1
      GROUP BY h.id
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'House not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get house error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create house (admin only)
const createHouse = async (req, res) => {
  try {
    const { title, description, location, house_type, property_type, listing_type, bedrooms, bathrooms, size_acres, dimensions, rent_price, vacancy_status, featured } = req.body;

    if (!title || !location || !rent_price) {
      return res.status(400).json({ error: 'Title, location, and price are required' });
    }

    // Convert empty strings to null for numeric fields
    const cleanSizeAcres = size_acres === '' || size_acres === undefined ? null : parseFloat(size_acres) || null;
    const cleanBedrooms = bedrooms === '' || bedrooms === undefined ? 1 : parseInt(bedrooms) || 1;
    const cleanBathrooms = bathrooms === '' || bathrooms === undefined ? 1 : parseInt(bathrooms) || 1;
    const cleanRentPrice = parseFloat(rent_price) || 0;
    const cleanDimensions = dimensions === '' || dimensions === undefined ? null : dimensions;
    const cleanListingType = listing_type || 'rent';
    const cleanPropertyType = property_type || 'house';

    const result = await db.query(
      `INSERT INTO houses (title, description, location, house_type, property_type, listing_type, bedrooms, bathrooms, size_acres, dimensions, rent_price, vacancy_status, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [title, description, location, house_type || '', cleanPropertyType, cleanListingType, cleanBedrooms, cleanBathrooms, cleanSizeAcres, cleanDimensions, cleanRentPrice, vacancy_status || 'available', featured || false]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create house error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

// Update house (admin only)
const updateHouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, house_type, property_type, listing_type, bedrooms, bathrooms, size_acres, dimensions, rent_price, vacancy_status, featured } = req.body;

    const existingHouse = await db.query('SELECT * FROM houses WHERE id = $1', [id]);
    if (existingHouse.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Convert empty strings to null for numeric fields
    const cleanSizeAcres = size_acres === '' || size_acres === undefined ? null : size_acres;
    const cleanBedrooms = bedrooms === '' || bedrooms === undefined ? null : parseInt(bedrooms) || null;
    const cleanBathrooms = bathrooms === '' || bathrooms === undefined ? null : parseInt(bathrooms) || null;
    const cleanRentPrice = rent_price === '' || rent_price === undefined ? null : parseFloat(rent_price) || null;
    const cleanDimensions = dimensions === '' || dimensions === undefined ? null : dimensions;
    const cleanListingType = listing_type || 'rent';
    const cleanPropertyType = property_type || 'house';

    const result = await db.query(
      `UPDATE houses 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           location = COALESCE($3, location),
           house_type = COALESCE($4, house_type),
           property_type = $5,
           listing_type = $6,
           bedrooms = $7,
           bathrooms = $8,
           size_acres = $9,
           dimensions = $10,
           rent_price = COALESCE($11, rent_price),
           vacancy_status = COALESCE($12, vacancy_status),
           featured = COALESCE($13, featured),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $14
       RETURNING *`,
      [title, description, location, house_type, cleanPropertyType, cleanListingType, cleanBedrooms, cleanBathrooms, cleanSizeAcres, cleanDimensions, cleanRentPrice, vacancy_status, featured, id]
    );
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Update house error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

// Delete house (admin only)
const deleteHouse = async (req, res) => {
  try {
    const { id } = req.params;

    const existingHouse = await db.query('SELECT * FROM houses WHERE id = $1', [id]);
    if (existingHouse.rows.length === 0) {
      return res.status(404).json({ error: 'House not found' });
    }

    await db.query('DELETE FROM houses WHERE id = $1', [id]);

    res.json({ message: 'House deleted successfully' });
  } catch (error) {
    console.error('Delete house error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get house types (for filters)
const getHouseTypes = async (req, res) => {
  try {
    const result = await db.query('SELECT DISTINCT house_type FROM houses ORDER BY house_type');
    res.json(result.rows.map(row => row.house_type));
  } catch (error) {
    console.error('Get house types error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get dashboard stats (admin)
const getDashboardStats = async (req, res) => {
  try {
    const totalHouses = await db.query('SELECT COUNT(*) FROM houses');
    const availableHouses = await db.query("SELECT COUNT(*) FROM houses WHERE vacancy_status = 'available'");
    const occupiedHouses = await db.query("SELECT COUNT(*) FROM houses WHERE vacancy_status = 'occupied'");
    const subscribers = await db.query('SELECT COUNT(*) FROM newsletter_subscribers');
    const nakuruHouses = await db.query("SELECT COUNT(*) FROM houses WHERE location = 'Nakuru'");
    const nyahururuHouses = await db.query("SELECT COUNT(*) FROM houses WHERE location = 'Nyahururu'");

    res.json({
      totalHouses: parseInt(totalHouses.rows[0].count),
      availableHouses: parseInt(availableHouses.rows[0].count),
      occupiedHouses: parseInt(occupiedHouses.rows[0].count),
      subscribers: parseInt(subscribers.rows[0].count),
      nakuruHouses: parseInt(nakuruHouses.rows[0].count),
      nyahururuHouses: parseInt(nyahururuHouses.rows[0].count)
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllHouses,
  getHouseById,
  createHouse,
  updateHouse,
  deleteHouse,
  getHouseTypes,
  getDashboardStats
};
