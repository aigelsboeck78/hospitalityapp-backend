import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function parseActivitiesMD() {
  const filePath = path.join(process.cwd(), 'activities.md');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  const activities = [];
  
  // Skip header line
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith('|')) continue;
    
    const cols = line.split('|').map(col => col.trim()).filter(col => col);
    
    if (cols.length >= 10) {
      const [titleEN, titleDE, descEN, descDE, labels, season, elevationGain, driveTime, link, location] = cols;
      
      // Parse labels
      const labelArray = labels.split('•').map(l => l.trim()).filter(l => l);
      
      // Determine activity type based on labels
      let activityType = 'outdoor';
      if (labelArray.includes('indoor')) activityType = 'indoor';
      else if (labelArray.includes('intense/adventure')) activityType = 'adventure';
      else if (labelArray.includes('chill/relaxing')) activityType = 'wellness';
      
      // Determine weather suitability
      const weatherSuitability = [];
      if (labelArray.includes('all-weather') || labelArray.includes('indoor')) {
        weatherSuitability.push('indoor', 'rain', 'any');
      } else {
        weatherSuitability.push('sunny', 'partly_cloudy');
      }
      
      // Determine target guest types based on labels
      const targetGuestTypes = [];
      if (labelArray.includes('family-friendly')) {
        targetGuestTypes.push('family');
      }
      if (labelArray.includes('intense/adventure')) {
        targetGuestTypes.push('all_male', 'all_female', 'solo');
      }
      if (labelArray.includes('girls/boys weekend')) {
        targetGuestTypes.push('all_male', 'all_female');
      }
      if (labelArray.includes('chill/relaxing')) {
        targetGuestTypes.push('couple', 'family');
      }
      
      // If no specific types, add all
      if (targetGuestTypes.length === 0) {
        targetGuestTypes.push('family', 'couple', 'solo', 'all_male', 'all_female');
      }
      
      activities.push({
        titleEN: titleEN.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'), // Remove markdown links
        titleDE,
        descEN,
        descDE,
        labels: labelArray,
        season,
        elevationGain,
        driveTime,
        link: link.match(/\(([^)]+)\)/)?.[1] || '', // Extract URL from markdown
        location,
        activityType,
        weatherSuitability,
        targetGuestTypes
      });
    }
  }
  
  return activities;
}

async function importActivities() {
  console.log('Starting activities import from activities.md...');
  
  try {
    const activities = await parseActivitiesMD();
    console.log(`Found ${activities.length} activities to import`);
    
    // Get the property ID (using the main property - Chalet 20)
    // Use direct ID since we know it exists
    const propertyId = '41059600-402d-434e-9b34-2b4821f6e3a4';
    console.log(`Using property ID: ${propertyId}`);
    
    for (const activity of activities) {
      try {
        // Check if activity already exists (by title_en)
        const existing = await pool.query(
          'SELECT id FROM activities WHERE title = $1 AND property_id = $2',
          [activity.titleEN, propertyId]
        );
        
        if (existing.rows.length > 0) {
          console.log(`Activity already exists: ${activity.titleEN}`);
          
          // Update existing activity with multilingual content
          await pool.query(`
            UPDATE activities 
            SET title_de = $1,
                description_de = $2,
                multilingual_content = $3,
                activity_labels = $4,
                weather_suitability = $5,
                booking_url = $6,
                location = $7,
                activity_type = $8,
                target_guest_types = $9,
                updated_at = NOW()
            WHERE id = $10
          `, [
            activity.titleDE,
            activity.descDE,
            JSON.stringify({
              en: { title: activity.titleEN, description: activity.descEN },
              de: { title: activity.titleDE, description: activity.descDE }
            }),
            activity.labels,
            activity.weatherSuitability,
            activity.link,
            activity.location,
            activity.activityType,
            activity.targetGuestTypes,
            existing.rows[0].id
          ]);
          
          console.log(`Updated: ${activity.titleEN}`);
        } else {
          // Insert new activity
          await pool.query(`
            INSERT INTO activities (
              property_id, title, description, title_de, description_de,
              activity_type, target_guest_types, location, 
              operating_hours, price_range, booking_url,
              is_active, display_order, activity_labels, weather_suitability,
              multilingual_content
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
            )
          `, [
            propertyId,
            activity.titleEN,
            activity.descEN,
            activity.titleDE,
            activity.descDE,
            activity.activityType,
            activity.targetGuestTypes,
            activity.location,
            activity.season, // Using season as operating hours
            null, // price_range
            activity.link,
            true, // is_active
            0, // display_order
            activity.labels,
            activity.weatherSuitability,
            JSON.stringify({
              en: { title: activity.titleEN, description: activity.descEN },
              de: { title: activity.titleDE, description: activity.descDE }
            })
          ]);
          
          console.log(`Imported: ${activity.titleEN}`);
        }
      } catch (err) {
        console.error(`Error importing activity ${activity.titleEN}:`, err.message);
      }
    }
    
    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await pool.end();
  }
}

// Run import
importActivities().catch(console.error);