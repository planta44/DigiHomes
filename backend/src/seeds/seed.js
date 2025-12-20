require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Read and execute init.sql
    const initSQL = fs.readFileSync(
      path.join(__dirname, '../config/init.sql'),
      'utf8'
    );
    await db.query(initSQL);
    console.log('✅ Tables created');

    // Clear existing data
    await db.query('DELETE FROM house_images');
    await db.query('DELETE FROM houses');
    await db.query('DELETE FROM newsletter_subscribers');
    await db.query('DELETE FROM users');
    console.log('✅ Existing data cleared');

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
      ['DIGI Admin', 'admin@digihomes.co.ke', hashedPassword, 'admin']
    );
    console.log('✅ Admin user created');
    console.log('   Email: admin@digihomes.co.ke');
    console.log('   Password: admin123');

    // Sample houses data
    const houses = [
      {
        title: 'Modern 2 Bedroom Apartment',
        description: 'Beautiful modern apartment with spacious rooms, ample natural lighting, and a scenic view. Located in a quiet neighborhood with easy access to amenities.',
        location: 'Nakuru',
        house_type: '2 Bedroom',
        bedrooms: 2,
        bathrooms: 1,
        rent_price: 15000,
        vacancy_status: 'available',
        featured: true
      },
      {
        title: 'Cozy 1 Bedroom Studio',
        description: 'Perfect starter home for singles or couples. Well-maintained with modern finishes and secure parking.',
        location: 'Nakuru',
        house_type: '1 Bedroom',
        bedrooms: 1,
        bathrooms: 1,
        rent_price: 8500,
        vacancy_status: 'available',
        featured: false
      },
      {
        title: 'Spacious 3 Bedroom Family Home',
        description: 'Ideal for families! Large living area, modern kitchen, and a small garden. Located near schools and shopping centers.',
        location: 'Nakuru',
        house_type: '3 Bedroom',
        bedrooms: 3,
        bathrooms: 2,
        rent_price: 25000,
        vacancy_status: 'occupied',
        featured: true
      },
      {
        title: 'Executive 2 Bedroom Apartment',
        description: 'High-end finishing with premium amenities. 24/7 security, backup water supply, and dedicated parking.',
        location: 'Nyahururu',
        house_type: '2 Bedroom',
        bedrooms: 2,
        bathrooms: 2,
        rent_price: 18000,
        vacancy_status: 'available',
        featured: true
      },
      {
        title: 'Budget-Friendly Bedsitter',
        description: 'Affordable and clean bedsitter perfect for students or young professionals. Water and electricity included.',
        location: 'Nyahururu',
        house_type: 'Bedsitter',
        bedrooms: 1,
        bathrooms: 1,
        rent_price: 5000,
        vacancy_status: 'available',
        featured: false
      },
      {
        title: 'Luxurious 4 Bedroom Villa',
        description: 'Premium villa with stunning views, large compound, servant quarters, and top-notch security. Perfect for executive families.',
        location: 'Nakuru',
        house_type: '4 Bedroom',
        bedrooms: 4,
        bathrooms: 3,
        rent_price: 45000,
        vacancy_status: 'available',
        featured: true
      },
      {
        title: 'Single Room with Kitchen',
        description: 'Self-contained single room with a private kitchen area. Ideal for individuals on a budget.',
        location: 'Nyahururu',
        house_type: 'Single Room',
        bedrooms: 1,
        bathrooms: 1,
        rent_price: 3500,
        vacancy_status: 'occupied',
        featured: false
      },
      {
        title: 'Modern 1 Bedroom Apartment',
        description: 'Newly built apartment with contemporary design. Features tiled floors, fitted kitchen, and reliable water supply.',
        location: 'Nyahururu',
        house_type: '1 Bedroom',
        bedrooms: 1,
        bathrooms: 1,
        rent_price: 7500,
        vacancy_status: 'available',
        featured: false
      }
    ];

    for (const house of houses) {
      await db.query(
        `INSERT INTO houses (title, description, location, house_type, bedrooms, bathrooms, rent_price, vacancy_status, featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [house.title, house.description, house.location, house.house_type, house.bedrooms, house.bathrooms, house.rent_price, house.vacancy_status, house.featured]
      );
    }
    console.log(`✅ ${houses.length} sample houses created`);

    // Sample newsletter subscribers
    const subscribers = [
      'john.doe@email.com',
      'jane.smith@gmail.com',
      'tenant@example.com'
    ];

    for (const email of subscribers) {
      await db.query(
        'INSERT INTO newsletter_subscribers (email) VALUES ($1)',
        [email]
      );
    }
    console.log(`✅ ${subscribers.length} sample subscribers created`);

    // Default locations
    const defaultLocations = ['Nakuru', 'Nyahururu'];
    for (const loc of defaultLocations) {
      await db.query(
        'INSERT INTO locations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [loc]
      );
    }
    console.log('✅ Default locations created');

    // Default house types
    const defaultHouseTypes = ['Bedsitter', 'Single Room', '1 Bedroom', '2 Bedroom', '3 Bedroom', '4 Bedroom', '5+ Bedroom'];
    for (const type of defaultHouseTypes) {
      await db.query(
        'INSERT INTO house_types (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [type]
      );
    }
    console.log('✅ Default house types created');

    // Default site settings
    const defaultSettings = [
      {
        key: 'hero_stats',
        value: [
          { value: '100+', label: 'Happy Tenants' },
          { value: '50+', label: 'Properties' },
          { value: '2', label: 'Locations' },
          { value: '5+', label: 'Years Experience' }
        ]
      },
      {
        key: 'features',
        value: [
          { title: 'Quality Homes', description: 'Carefully selected properties that meet our high standards for comfort and safety.', icon: 'Building' },
          { title: 'Prime Locations', description: 'Properties in Nakuru and Nyahururu with easy access to amenities and transport.', icon: 'MapPin' },
          { title: 'Trusted Agency', description: 'Years of experience helping families find their perfect homes in Kenya.', icon: 'Shield' },
          { title: 'Quick Process', description: 'Streamlined rental process to get you into your new home faster.', icon: 'Clock' }
        ]
      },
      {
        key: 'company_info',
        value: {
          name: 'DIGIHOMES AGENCIES',
          tagline: 'WE CARE ALWAYS',
          phone: '+254 700 000 000',
          phone2: '+254 711 111 111',
          email: 'info@digihomes.co.ke',
          whatsapp: '254700000000',
          facebook: 'https://web.facebook.com/digihomesagency/',
          instagram: '',
          twitter: '',
          logo: ''
        }
      },
      {
        key: 'hero_content',
        value: {
          title: 'Find Your Perfect Home in',
          highlight: 'Nakuru & Nyahururu',
          description: 'DIGI Homes Agencies is your trusted partner in finding quality rental properties. From cozy bedsitters to spacious family homes, we have something for everyone.',
          backgroundImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&auto=format&fit=crop&q=60'
        }
      },
      {
        key: 'features_section',
        value: {
          title: 'Why Choose DIGIHOMES?',
          subtitle: "We're committed to making your house-hunting experience smooth and successful."
        }
      },
      {
        key: 'houses_section',
        value: {
          title: 'Available Houses',
          subtitle: 'Explore our selection of quality rental properties'
        }
      },
      {
        key: 'locations_section',
        value: {
          title: 'Our Locations',
          subtitle: "We operate in two beautiful towns in Kenya's Rift Valley region",
          locations: [
            { name: 'Nakuru', description: "Kenya's fourth-largest city with vibrant urban amenities", image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&auto=format&fit=crop&q=60' },
            { name: 'Nyahururu', description: "Cool climate town known for Thomson's Falls", image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=60' }
          ]
        }
      },
      {
        key: 'footer_content',
        value: {
          tagline: 'WE CARE ALWAYS',
          description: 'Your trusted housing agency in Nakuru and Nyahururu, Kenya. Finding you the perfect home.',
          quickLinks: [
            { label: 'Home', url: '/' },
            { label: 'Browse Houses', url: '/houses' },
            { label: 'Contact Us', url: '/contact' }
          ],
          contactLocations: ['Nakuru Town, Kenya', 'Nyahururu Town, Kenya'],
          contactPhones: ['+254 700 000 000', '+254 711 111 111'],
          contactEmail: 'info@digihomes.co.ke'
        }
      },
      {
        key: 'contact_page',
        value: {
          title: 'Get in Touch',
          subtitle: "Have questions? We'd love to hear from you. Reach out through any of our channels.",
          workingHours: [
            'Monday - Friday: 8AM - 6PM',
            'Saturday: 9AM - 4PM',
            'Sunday: Closed'
          ],
          offices: [
            { 
              name: 'Nakuru Office', 
              address: 'Nakuru Town, Kenya',
              phone: '+254 700 000 000',
              email: 'nakuru@digihomes.co.ke',
              mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127672.75772082848!2d36.0167!3d-0.3031!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18298e0d5f0!2sNakuru!5e0!3m2!1sen!2ske!4v1'
            },
            { 
              name: 'Nyahururu Office', 
              address: 'Nyahururu Town, Kenya',
              phone: '+254 711 111 111',
              email: 'nyahururu@digihomes.co.ke',
              mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127672.75772082848!2d36.3639!3d0.0380!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18298e0d5f0!2sNyahururu!5e0!3m2!1sen!2ske!4v1'
            }
          ],
          faqs: [
            { question: 'How do I schedule a house viewing?', answer: 'Contact us via phone or WhatsApp to schedule a convenient time for viewing any of our available properties.' },
            { question: 'What documents do I need to rent?', answer: 'You will need a valid ID/passport, proof of income, and a deposit equivalent to one month rent.' },
            { question: 'Do you offer furnished houses?', answer: 'Yes, we have both furnished and unfurnished options available in our listings.' },
            { question: 'What is your commission structure?', answer: 'Our standard commission is equivalent to one month rent, payable upon successful tenancy.' }
          ]
        }
      },
      {
        key: 'brand_settings',
        value: {
          name: 'DIGIHOMES',
          splitPosition: 4,
          primaryColor: '#2563eb',
          secondaryColor: '#dc2626',
          logo: '',
          themeColor: '#2563eb'
        }
      },
      {
        key: 'animation_settings',
        value: {
          duration: 700,
          staggerDelay: 100
        }
      },
      {
        key: 'digi_posts',
        value: {
          title: 'Digi Posts',
          subtitle: 'Stay updated with our latest news, offers, and announcements',
          posts: [
            { image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop&q=60', caption: 'New listings available in Nakuru!' },
            { image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&auto=format&fit=crop&q=60', caption: 'Modern apartments for rent' },
            { image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=60', caption: 'Luxury homes in Nyahururu' },
            { image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=60', caption: 'Family-friendly neighborhoods' },
            { image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=60', caption: 'Special offers this month!' }
          ]
        }
      }
    ];

    for (const setting of defaultSettings) {
      await db.query(
        `INSERT INTO site_settings (setting_key, setting_value) 
         VALUES ($1, $2) 
         ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2`,
        [setting.key, JSON.stringify(setting.value)]
      );
    }
    console.log('✅ Default site settings created');

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
