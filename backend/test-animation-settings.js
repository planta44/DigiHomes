const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testAnimationSettings() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Testing Animation Settings...\n');
    
    // Get current settings
    const result = await client.query(
      "SELECT setting_key, setting_value FROM site_settings WHERE setting_key = 'animation_settings'"
    );
    
    if (result.rows.length === 0) {
      console.log('❌ No animation settings found in database!');
      console.log('Creating default settings...\n');
      
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
      
      console.log('✅ Default settings created:', defaultSettings);
    } else {
      console.log('✅ Animation settings found!');
      const settings = result.rows[0].setting_value;
      console.log('\nCurrent settings:', JSON.stringify(settings, null, 2));
      
      // Check structure
      const requiredKeys = [
        'enabled',
        'heroAnimationStyle',
        'heroTextDelay',
        'heroTextStagger',
        'cardAnimationStyle',
        'cardBaseDelay',
        'cardStaggerDelay',
        'sectionAnimationStyle',
        'sectionBaseDelay',
        'sectionStaggerDelay',
        'statsCountDuration'
      ];
      
      const missingKeys = requiredKeys.filter(key => !(key in settings));
      
      if (missingKeys.length > 0) {
        console.log('\n⚠️  Missing keys:', missingKeys);
        console.log('Updating to correct structure...\n');
        
        const updatedSettings = {
          enabled: settings.enabled !== false,
          heroAnimationStyle: settings.heroAnimationStyle || settings.animationStyle || 'pop',
          heroTextDelay: settings.heroTextDelay || 400,
          heroTextStagger: settings.heroTextStagger || 200,
          cardAnimationStyle: settings.cardAnimationStyle || settings.animationStyle || 'pop',
          cardBaseDelay: settings.cardBaseDelay || settings.baseDelay || 150,
          cardStaggerDelay: settings.cardStaggerDelay || 100,
          sectionAnimationStyle: settings.sectionAnimationStyle || settings.animationStyle || 'pop',
          sectionBaseDelay: settings.sectionBaseDelay || settings.baseDelay || 200,
          sectionStaggerDelay: settings.sectionStaggerDelay || 150,
          statsCountDuration: settings.statsCountDuration || 2000
        };
        
        await client.query(
          `UPDATE site_settings 
           SET setting_value = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE setting_key = 'animation_settings'`,
          [JSON.stringify(updatedSettings)]
        );
        
        console.log('✅ Settings updated:', JSON.stringify(updatedSettings, null, 2));
      } else {
        console.log('\n✅ All required keys present!');
        console.log('\nSettings breakdown:');
        console.log('- Enabled:', settings.enabled);
        console.log('- Hero Animation Style:', settings.heroAnimationStyle);
        console.log('- Hero Text Delay:', settings.heroTextDelay, 'ms');
        console.log('- Hero Text Stagger:', settings.heroTextStagger, 'ms');
        console.log('- Card Animation Style:', settings.cardAnimationStyle);
        console.log('- Card Base Delay:', settings.cardBaseDelay, 'ms');
        console.log('- Card Stagger Delay:', settings.cardStaggerDelay, 'ms');
        console.log('- Section Animation Style:', settings.sectionAnimationStyle);
        console.log('- Section Base Delay:', settings.sectionBaseDelay, 'ms');
        console.log('- Section Stagger Delay:', settings.sectionStaggerDelay, 'ms');
        console.log('- Stats Count Duration:', settings.statsCountDuration, 'ms');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
    console.log('\n🏁 Test complete!');
  }
}

testAnimationSettings();
