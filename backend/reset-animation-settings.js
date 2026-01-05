const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function resetAnimationSettings() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Resetting animation settings to new simple structure...\n');
    
    const newSettings = {
      enabled: true,
      style: 'pop',
      delay: 100
    };
    
    await client.query(
      `INSERT INTO site_settings (setting_key, setting_value, updated_at) 
       VALUES ('animation_settings', $1, CURRENT_TIMESTAMP)
       ON CONFLICT (setting_key) 
       DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(newSettings)]
    );
    
    console.log('✅ Animation settings reset successfully!');
    console.log('\nNew settings:');
    console.log('  - Enabled:', newSettings.enabled);
    console.log('  - Style:', newSettings.style);
    console.log('  - Delay:', newSettings.delay + 'ms');
    console.log('\n🎬 All old complex settings have been removed.');
    console.log('📝 You can now adjust these in the admin panel.\n');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
    console.log('🏁 Done!');
  }
}

resetAnimationSettings();
