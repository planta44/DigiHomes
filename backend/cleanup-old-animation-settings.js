const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function cleanupOldAnimationSettings() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Cleaning up old animation settings...');
    
    // Get current animation_settings
    const currentSettings = await client.query(
      "SELECT setting_value FROM site_settings WHERE setting_key = 'animation_settings'"
    );
    
    if (currentSettings.rows.length > 0) {
      const settings = currentSettings.rows[0].setting_value;
      
      // Check if old structure exists
      const hasOldStructure = settings.animationStyle || settings.baseDelay || settings.cardStaggerMultiplier;
      
      if (hasOldStructure) {
        console.log('📝 Found old animation structure, migrating to new format...');
        
        // Create new structure from old values
        const newSettings = {
          enabled: settings.enabled !== undefined ? settings.enabled : true,
          // Hero text animations
          heroAnimationStyle: settings.animationStyle || settings.heroAnimationStyle || 'pop',
          heroTextDelay: settings.heroTextDelay || 400,
          heroTextStagger: settings.heroTextStagger || (settings.baseDelay * settings.heroStaggerMultiplier) || 200,
          // Card animations
          cardAnimationStyle: settings.animationStyle || settings.cardAnimationStyle || 'pop',
          cardBaseDelay: settings.cardBaseDelay || settings.baseDelay || 150,
          cardStaggerDelay: settings.cardStaggerDelay || (settings.baseDelay * settings.cardStaggerMultiplier) || 100,
          // Section animations
          sectionAnimationStyle: settings.animationStyle || settings.sectionAnimationStyle || 'pop',
          sectionBaseDelay: settings.sectionBaseDelay || settings.baseDelay || 200,
          sectionStaggerDelay: settings.sectionStaggerDelay || (settings.baseDelay * settings.sectionStaggerMultiplier) || 150,
          // Stats animation
          statsCountDuration: settings.statsCountDuration || 2000
        };
        
        // Update with new structure
        await client.query(
          `UPDATE site_settings 
           SET setting_value = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE setting_key = 'animation_settings'`,
          [JSON.stringify(newSettings)]
        );
        
        console.log('✅ Migration complete! New settings:', newSettings);
      } else {
        console.log('✅ Animation settings already in new format');
      }
    } else {
      console.log('📝 No animation settings found, creating new ones...');
      
      const defaultSettings = {
        enabled: true,
        heroAnimationStyle: 'pop',
        heroTextDelay: 400,
        heroTextStagger: 200,
        cardAnimationStyle: 'pop',
        cardBaseDelay: 150,
        cardStaggerDelay: 100,
        sectionAnimationStyle: 'pop',
        sectionBaseDelay: 200,
        sectionStaggerDelay: 150,
        statsCountDuration: 2000
      };
      
      await client.query(
        `INSERT INTO site_settings (setting_key, setting_value, updated_at) 
         VALUES ('animation_settings', $1, CURRENT_TIMESTAMP)`,
        [JSON.stringify(defaultSettings)]
      );
      
      console.log('✅ Default animation settings created');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
    console.log('🏁 Done!');
  }
}

cleanupOldAnimationSettings();
