import pool from '../src/config/database.js';

async function seedPropertyInfo() {
  console.log('Seeding property information...');
  
  try {
    // Get the main property
    const propertyResult = await pool.query(
      'SELECT id FROM properties WHERE name LIKE $1 LIMIT 1',
      ['%Hauser Kaibling%']
    );
    
    if (propertyResult.rows.length === 0) {
      console.error('No property found');
      return;
    }
    
    const propertyId = propertyResult.rows[0].id;
    console.log(`Using property ID: ${propertyId}`);
    
    const propertyInfoItems = [
      // House Information
      {
        category: 'house_info',
        type: 'wifi',
        title: 'WiFi Information',
        description: 'High-speed fiber internet throughout the property',
        instructions: 'Network: ChaletMoments_5G\nPassword: Welcome2025!',
        icon: 'wifi',
        display_order: 1
      },
      {
        category: 'house_info',
        type: 'climate',
        title: 'Climate Control',
        description: 'Smart thermostat and underfloor heating',
        instructions: 'Use the tablet on each floor to adjust temperature. Eco mode activates automatically at night.',
        icon: 'thermometer',
        display_order: 2
      },
      {
        category: 'house_info',
        type: 'kitchen',
        title: 'Kitchen & Appliances',
        description: 'Fully equipped modern kitchen',
        instructions: 'Coffee machine: Nespresso (capsules in drawer)\nDishwasher: Eco mode recommended\nInduction hob: Use only suitable cookware',
        icon: 'fork.knife',
        display_order: 3
      },
      {
        category: 'house_info',
        type: 'entertainment',
        title: 'Entertainment System',
        description: 'Apple TV, Netflix, and Sound System',
        instructions: 'Apple TV remote on coffee table\nNetflix already logged in\nSound system: Sonos app on tablet',
        icon: 'tv',
        display_order: 4
      },
      
      // House Guides
      {
        category: 'guides',
        type: 'checkin',
        title: 'Check-in Guide',
        description: 'Everything you need for a smooth arrival',
        instructions: 'Key collection: Lock box code sent via SMS\nParking: 2 spaces in garage\nLuggage trolley: In garage',
        icon: 'key.fill',
        display_order: 10
      },
      {
        category: 'guides',
        type: 'checkout',
        title: 'Check-out Guide',
        description: 'Simple checkout process',
        instructions: 'Check-out by 10:00 AM\nLeave keys in lock box\nNo cleaning required - just tidy up',
        icon: 'door.left.hand.open',
        display_order: 11
      },
      {
        category: 'guides',
        type: 'waste',
        title: 'Waste & Recycling',
        description: 'Waste separation guide',
        instructions: 'General waste: Black bin\nPaper: Blue container\nGlass: Green container\nPlastic: Yellow bag\nCollection: Tuesday mornings',
        icon: 'trash',
        display_order: 12
      },
      {
        category: 'guides',
        type: 'emergency',
        title: 'Emergency Contacts',
        description: 'Important phone numbers',
        instructions: 'Property Manager: +43 664 1234567\nEmergency: 112\nLocal Doctor: +43 3687 22456\nHospital Schladming: +43 3687 22290',
        icon: 'phone.fill',
        display_order: 13
      },
      
      // Amenities
      {
        category: 'amenities',
        type: 'sauna',
        title: 'Sauna & Wellness',
        description: 'Private sauna in basement',
        instructions: 'Heat up time: 45 minutes\nMax temperature: 90°C\nTowels provided in wellness area',
        icon: 'flame',
        display_order: 20
      },
      {
        category: 'amenities',
        type: 'hottub',
        title: 'Hot Tub',
        description: 'Outdoor hot tub on terrace',
        instructions: 'Temperature: 38°C\nCover after use\nNo glass near hot tub',
        icon: 'drop.fill',
        display_order: 21
      },
      {
        category: 'amenities',
        type: 'ski_storage',
        title: 'Ski Storage',
        description: 'Heated ski room with boot dryers',
        instructions: 'Access via garage\nBoot dryers: Timer on wall\nWaxing bench available',
        icon: 'snowflake',
        display_order: 22
      },
      {
        category: 'amenities',
        type: 'parking',
        title: 'Parking',
        description: '2 garage spaces + 2 outdoor',
        instructions: 'Garage code: 2580\nElectric charging: Type 2 connector\nOutdoor spaces: Behind property',
        icon: 'car.fill',
        display_order: 23
      },
      
      // Local Information
      {
        category: 'local_info',
        type: 'grocery',
        title: 'Grocery Shopping',
        description: 'Nearest supermarkets',
        instructions: 'SPAR: 5 min drive, open until 19:00\nHofer: 8 min drive, open until 20:00\nBakery: 3 min walk, open from 6:30',
        icon: 'cart.fill',
        display_order: 30
      },
      {
        category: 'local_info',
        type: 'ski_lifts',
        title: 'Ski Lifts',
        description: 'Hauser Kaibling cable car',
        instructions: '8 min drive to valley station\nFirst lift: 8:30 AM\nLast lift down: 4:30 PM\nNight skiing: Wed & Fri until 9 PM',
        icon: 'figure.skiing.downhill',
        display_order: 31
      },
      {
        category: 'local_info',
        type: 'restaurants',
        title: 'Restaurant Reservations',
        description: 'We can help with bookings',
        instructions: 'Contact concierge for reservations\nPopular spots book quickly\nDietary requirements: Let us know',
        icon: 'fork.knife.circle',
        display_order: 32
      }
    ];
    
    for (const item of propertyInfoItems) {
      try {
        // Check if item already exists
        const existing = await pool.query(
          'SELECT id FROM property_information WHERE property_id = $1 AND type = $2',
          [propertyId, item.type]
        );
        
        if (existing.rows.length > 0) {
          // Update existing
          await pool.query(`
            UPDATE property_information SET
              category = $3,
              title = $4,
              description = $5,
              instructions = $6,
              icon = $7,
              display_order = $8,
              updated_at = NOW()
            WHERE property_id = $1 AND type = $2
          `, [
            propertyId,
            item.type,
            item.category,
            item.title,
            item.description,
            item.instructions,
            item.icon,
            item.display_order
          ]);
          console.log(`Updated: ${item.title}`);
        } else {
          // Insert new
          await pool.query(`
            INSERT INTO property_information (
              property_id, category, type, title, description,
              instructions, icon, display_order, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [
            propertyId,
            item.category,
            item.type,
            item.title,
            item.description,
            item.instructions,
            item.icon,
            item.display_order,
            true
          ]);
          console.log(`Created: ${item.title}`);
        }
      } catch (err) {
        console.error(`Error with ${item.title}:`, err.message);
      }
    }
    
    console.log('Property information seeding completed!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

// Run seeding
seedPropertyInfo().catch(console.error);