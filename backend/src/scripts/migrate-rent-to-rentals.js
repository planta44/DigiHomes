const db = require('../config/database');

/**
 * Migration script to rename 'rent' page slug to 'rentals'
 * Run this once on production database
 */
async function migrateRentToRentals() {
  try {
    console.log('Starting migration: rent -> rentals...');
    
    // Check if 'rent' page exists
    const rentCheck = await db.query('SELECT * FROM pages WHERE slug = $1', ['rent']);
    
    if (rentCheck.rows.length === 0) {
      console.log('❌ No page with slug "rent" found. Migration not needed or already completed.');
      process.exit(0);
    }
    
    console.log('✓ Found page with slug "rent"');
    
    // Check if 'rentals' page already exists
    const rentalsCheck = await db.query('SELECT * FROM pages WHERE slug = $1', ['rentals']);
    
    if (rentalsCheck.rows.length > 0) {
      console.log('⚠️  Page with slug "rentals" already exists. Skipping migration.');
      process.exit(0);
    }
    
    // Update slug from 'rent' to 'rentals'
    const result = await db.query(
      'UPDATE pages SET slug = $1, title = $2, updated_at = CURRENT_TIMESTAMP WHERE slug = $3 RETURNING *',
      ['rentals', 'Rentals', 'rent']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Successfully migrated page slug from "rent" to "rentals"');
      console.log('Updated page:', result.rows[0]);
    } else {
      console.log('⚠️  No rows updated. Migration may have already been applied.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateRentToRentals();
