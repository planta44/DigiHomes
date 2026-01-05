const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testAndFixAnimations() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Testing animation settings in database...\n');
    
    // Get current settings
    const result = await client.query(
      "SELECT setting_key, setting_value FROM site_settings WHERE setting_key = 'animation_settings'"
    );
    
    if (result.rows.length === 0) {
      console.log('❌ No animation settings found!');
      console.log('Creating new settings...\n');
    } else {
      console.log('Current settings in database:');
      console.log(JSON.stringify(result.rows[0].setting_value, null, 2));
      console.log('');
    }
    
    // Force correct structure
    const correctSettings = {
      enabled: true,
      style: 'pop',
      delay: 100
    };
    
    console.log('Setting correct animation structure:');
    console.log(JSON.stringify(correctSettings, null, 2));
    console.log('');
    
    await client.query(
      `INSERT INTO site_settings (setting_key, setting_value, updated_at) 
       VALUES ('animation_settings', $1, CURRENT_TIMESTAMP)
       ON CONFLICT (setting_key) 
       DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(correctSettings)]
    );
    
    // Verify
    const verify = await client.query(
      "SELECT setting_value FROM site_settings WHERE setting_key = 'animation_settings'"
    );
    
    console.log('✅ Verified settings in database:');
    console.log(JSON.stringify(verify.rows[0].setting_value, null, 2));
    console.log('\n🎬 Animation settings are now correct!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
    console.log('\n🏁 Done!');
  }
}

testAndFixAnimations();
