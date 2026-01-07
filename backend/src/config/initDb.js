const db = require('./database');

const initDatabase = async () => {
  try {
    // Create tables if they don't exist
    await db.query(`
      -- Users table (Admin)
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Properties table (houses and land)
      CREATE TABLE IF NOT EXISTS houses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(100) NOT NULL,
        town VARCHAR(100),
        house_type VARCHAR(100) NOT NULL,
        property_type VARCHAR(20) DEFAULT 'house',
        listing_type VARCHAR(20) DEFAULT 'rent',
        bedrooms INTEGER DEFAULT 1,
        bathrooms INTEGER DEFAULT 1,
        size_acres DECIMAL(10, 2),
        rent_price DECIMAL(10, 2) NOT NULL,
        vacancy_status VARCHAR(20) DEFAULT 'available',
        featured BOOLEAN DEFAULT false,
        internal_features JSONB DEFAULT '[]',
        external_features JSONB DEFAULT '[]',
        land_features JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- House Images table
      CREATE TABLE IF NOT EXISTS house_images (
        id SERIAL PRIMARY KEY,
        house_id INTEGER REFERENCES houses(id) ON DELETE CASCADE,
        image_url VARCHAR(500) NOT NULL,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Newsletter Subscribers table
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(100),
        verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Site Settings table
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Locations table
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- House Types table
      CREATE TABLE IF NOT EXISTS house_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Pages table for custom pages (Services, Buy, Rent)
      CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        content JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Digi Reels table for video/image posts
      CREATE TABLE IF NOT EXISTS digi_reels (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        media_url VARCHAR(500) NOT NULL,
        media_type VARCHAR(20) DEFAULT 'image',
        thumbnail_url VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes (basic ones that always exist)
      CREATE INDEX IF NOT EXISTS idx_houses_location ON houses(location);
      CREATE INDEX IF NOT EXISTS idx_houses_vacancy ON houses(vacancy_status);
      CREATE INDEX IF NOT EXISTS idx_houses_type ON houses(house_type);
      CREATE INDEX IF NOT EXISTS idx_house_images_house_id ON house_images(house_id);
      CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
    `);

    console.log('✅ Database tables initialized');

    // Add new columns if they don't exist (migration for existing databases)
    try {
      await db.query(`ALTER TABLE houses ADD COLUMN IF NOT EXISTS property_type VARCHAR(20) DEFAULT 'house'`);
      await db.query(`ALTER TABLE houses ADD COLUMN IF NOT EXISTS listing_type VARCHAR(20) DEFAULT 'rent'`);
      await db.query(`ALTER TABLE houses ADD COLUMN IF NOT EXISTS size_acres DECIMAL(10, 2)`);
      await db.query(`ALTER TABLE houses ADD COLUMN IF NOT EXISTS dimensions VARCHAR(50)`);
      await db.query(`ALTER TABLE houses ADD COLUMN IF NOT EXISTS lease_duration_type VARCHAR(20) DEFAULT 'months'`);
      await db.query(`ALTER TABLE houses ADD COLUMN IF NOT EXISTS lease_duration INTEGER`);
      await db.query(`ALTER TABLE houses ADD COLUMN IF NOT EXISTS town VARCHAR(100)`);
      await db.query(`ALTER TABLE houses ADD COLUMN IF NOT EXISTS internal_features JSONB DEFAULT '[]'`);
      await db.query(`ALTER TABLE houses ADD COLUMN IF NOT EXISTS external_features JSONB DEFAULT '[]'`);
      await db.query(`ALTER TABLE houses ADD COLUMN IF NOT EXISTS land_features JSONB DEFAULT '[]'`);
      console.log('✅ Property columns migration complete');
    } catch (err) {
      console.log('Migration note:', err.message);
    }

    // Create indexes for new columns (after migration)
    try {
      await db.query(`CREATE INDEX IF NOT EXISTS idx_houses_property_type ON houses(property_type)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_houses_listing_type ON houses(listing_type)`);
      console.log('✅ New column indexes created');
    } catch (err) {
      // Indexes may already exist
    }

    // Create default admin if not exists
    const bcrypt = require('bcryptjs');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@digihomes.co.ke';
    const adminCheck = await db.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        ['Admin', adminEmail, hashedPassword, 'admin']
      );
      console.log(`✅ Default admin user created with email: ${adminEmail}`);
    }

    // Create default locations if not exist
    const locationsCheck = await db.query('SELECT COUNT(*) FROM locations');
    if (parseInt(locationsCheck.rows[0].count) === 0) {
      await db.query("INSERT INTO locations (name) VALUES ('Nakuru'), ('Nyahururu') ON CONFLICT DO NOTHING");
      console.log('✅ Default locations created');
    }

    // Create default house types if not exist
    const typesCheck = await db.query('SELECT COUNT(*) FROM house_types');
    if (parseInt(typesCheck.rows[0].count) === 0) {
      await db.query("INSERT INTO house_types (name) VALUES ('Bedsitter'), ('1 Bedroom'), ('2 Bedroom'), ('3 Bedroom'), ('Studio'), ('Apartment') ON CONFLICT DO NOTHING");
      console.log('✅ Default house types created');
    }

    // Create default pages if not exist
    const pagesCheck = await db.query('SELECT COUNT(*) FROM pages');
    if (parseInt(pagesCheck.rows[0].count) === 0) {
      const defaultPages = [
        {
          slug: 'services',
          title: 'Our Services',
          content: {
            hero: { title: 'Our Services', subtitle: 'Professional property services tailored to your needs', backgroundImage: '' },
            sections: [
              { title: 'Property Management', description: 'Complete property management services for landlords', icon: 'Building', items: ['Tenant screening', 'Rent collection', 'Maintenance coordination'] },
              { title: 'Rental Services', description: 'Find your perfect rental home with our expert guidance', icon: 'Home', items: ['Property viewing', 'Lease negotiation', 'Move-in assistance'] },
              { title: 'Consultation', description: 'Expert advice on property investment and management', icon: 'Users', items: ['Market analysis', 'Investment advice', 'Legal guidance'] }
            ]
          }
        },
        {
          slug: 'buy',
          title: 'Buy Property',
          content: {
            hero: { title: 'Buy Your Dream Home', subtitle: 'Explore properties available for purchase', backgroundImage: '' },
            sections: [],
            properties: []
          }
        },
        {
          slug: 'rent',
          title: 'Rent Property',
          content: {
            hero: { title: 'Find Your Perfect Rental', subtitle: 'Quality rental properties in Nakuru & Nyahururu', backgroundImage: '' },
            sections: [],
            filterOptions: { locations: ['Nakuru', 'Nyahururu'], types: ['Bedsitter', '1 Bedroom', '2 Bedroom', '3 Bedroom'] }
          }
        }
      ];

      for (const page of defaultPages) {
        await db.query(
          'INSERT INTO pages (slug, title, content) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING',
          [page.slug, page.title, JSON.stringify(page.content)]
        );
      }
      console.log('✅ Default pages created');
    }

    // Create default site settings if not exist
    const settingsCheck = await db.query('SELECT COUNT(*) FROM site_settings');
    if (parseInt(settingsCheck.rows[0].count) === 0) {
      const defaultSettings = [
        { key: 'brand_settings', value: { name: 'DIGIHOMES', splitPosition: 4, primaryColor: '#2563eb', secondaryColor: '#dc2626', logo: '', themeColor: '#2563eb' } },
        { key: 'animation_settings', value: { duration: 700, staggerDelay: 100 } },
        { key: 'hero_stats', value: [{ value: '100+', label: 'Happy Tenants' }, { value: '50+', label: 'Properties' }, { value: '2', label: 'Locations' }, { value: '5+', label: 'Years Experience' }] },
        { key: 'features', value: [
          { icon: 'Building', title: 'Quality Homes', description: 'Carefully selected properties that meet our high standards.' },
          { icon: 'MapPin', title: 'Prime Locations', description: 'Properties in Nakuru and Nyahururu with easy access to amenities.' },
          { icon: 'Shield', title: 'Trusted Agency', description: 'Years of experience helping families find their perfect homes.' },
          { icon: 'Clock', title: 'Quick Process', description: 'Streamlined rental process to get you into your new home faster.' }
        ]},
        { key: 'company_info', value: { name: 'DIGIHOMES AGENCIES', tagline: 'WE CARE ALWAYS', phone: '+254 700 000 000', phone2: '', email: 'info@digihomes.co.ke', whatsapp: '', facebook: '', instagram: '', twitter: '', logo: '' } },
        { key: 'hero_content', value: { 
          title: 'Find Your Perfect Home in', 
          highlight: 'Nakuru & Nyahururu', 
          description: 'DIGI Homes Agencies is your trusted partner in finding quality rental properties.',
          backgroundImage: '',
          backgroundImageMobile: '',
          overlayColor: '#000000',
          overlayColorMobile: '#000000',
          overlayOpacity: 0.5,
          overlayOpacityMobile: 0.6
        }},
        { key: 'features_section', value: { title: 'Why Choose DIGIHOMES?', subtitle: "We're committed to making your house-hunting experience smooth and successful." } },
        { key: 'houses_section', value: { title: 'Available Houses', subtitle: 'Explore our selection of quality rental properties' } },
        { key: 'locations_section', value: { title: 'Our Locations', subtitle: "We operate in two beautiful towns in Kenya's Rift Valley region", locations: [] } },
        { key: 'footer_content', value: { tagline: 'Your trusted partner in finding the perfect home.', description: '', quickLinks: [], contactLocations: [], contactPhones: [], contactEmail: '', backgroundColor: '#111827', textColor: '#9ca3af' } },
        { key: 'contact_page', value: { title: 'Get in Touch', subtitle: "Have questions? We'd love to hear from you.", workingHours: [], offices: [], faqs: [] } },
        { key: 'digi_posts', value: { title: 'Digi Posts', subtitle: 'Stay updated with our latest news and announcements', posts: [] } }
      ];

      for (const setting of defaultSettings) {
        await db.query(
          'INSERT INTO site_settings (setting_key, setting_value) VALUES ($1, $2) ON CONFLICT (setting_key) DO NOTHING',
          [setting.key, JSON.stringify(setting.value)]
        );
      }
      console.log('✅ Default site settings created');
    }

  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
  }
};

module.exports = initDatabase;
