import pool from '../config/database.js';
import { logger } from '../middleware/errorHandler.js';

const sampleData = {
  properties: [
    {
      name: "Luxury Mountain Chalet",
      address: "123 Alpine Drive, Mountain View, CO 80424",
      wifi_ssid: "ChaletGuest",
      wifi_password: "Welcome2024!",
      welcome_message: "Welcome to our luxury mountain chalet! We hope you enjoy your stay in this beautiful location with stunning mountain views.",
      house_rules: "• Check-in: 4:00 PM | Check-out: 11:00 AM\n• No smoking anywhere on the property\n• No pets allowed\n• Maximum occupancy: 8 guests\n• Please remove shoes when entering\n• Quiet hours: 10 PM - 8 AM",
      emergency_contact: "Emergency: 911 | Property Manager: (555) 123-4567 | After Hours: (555) 987-6543",
      checkout_instructions: "• Please start dishwasher if used\n• Take out trash to bins outside\n• Turn off all lights and lock all doors\n• Leave keys on kitchen counter\n• Thank you for staying with us!"
    }
  ],
  
  streamingServices: [
    {
      service_name: "Netflix",
      service_type: "streaming",
      app_url_scheme: "nflx://",
      logo_url: "https://images.ctfassets.net/y2ske730sjqp/1aONibCke6niZhgPxuiilC/2c401b05a07288746ddf3bd3943fbc76/BrandAssets_Logos_01-Wordmark.jpg",
      instructions: "Launch Netflix and log in with your account. Please log out when you check out.",
      requires_login: true,
      display_order: 1
    },
    {
      service_name: "Disney+",
      service_type: "streaming",
      app_url_scheme: "disneyplus://",
      logo_url: "https://cnbl-cdn.bamgrid.com/assets/7ecc8bcb60ad77193058d63e321bd21cbac2fc67281dcc9e7db35b73ad0ed03b/original",
      instructions: "Launch Disney+ and log in with your account. Please log out when you check out.",
      requires_login: true,
      display_order: 2
    },
    {
      service_name: "HBO Max",
      service_type: "streaming",
      app_url_scheme: "hbomax://",
      logo_url: "https://logos-world.net/wp-content/uploads/2021/08/HBO-Max-Logo.png",
      instructions: "Launch HBO Max and log in with your account. Please log out when you check out.",
      requires_login: true,
      display_order: 3
    },
    {
      service_name: "Hulu",
      service_type: "streaming",
      app_url_scheme: "hulu://",
      logo_url: "https://logos-world.net/wp-content/uploads/2020/05/Hulu-Logo.png",
      instructions: "Launch Hulu and log in with your account. Please log out when you check out.",
      requires_login: true,
      display_order: 4
    },
    {
      service_name: "Spotify",
      service_type: "music",
      app_url_scheme: "spotify://",
      logo_url: "https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_CMYK_Green.png",
      instructions: "Launch Spotify and log in with your account. Please log out when you check out.",
      requires_login: true,
      display_order: 5
    },
    {
      service_name: "Apple Music",
      service_type: "music",
      app_url_scheme: "music://",
      logo_url: "https://logos-world.net/wp-content/uploads/2020/08/Apple-Music-Logo.png",
      instructions: "Launch Apple Music. Use your Apple ID to access your music library.",
      requires_login: true,
      display_order: 6
    }
  ],
  
  activities: [
    {
      title: "Rocky Mountain National Park",
      description: "Explore over 400 square miles of pristine wilderness with hiking trails, wildlife viewing, and breathtaking mountain vistas. Perfect for families and nature lovers.",
      activity_type: "outdoor",
      target_guest_types: ["family", "couple", "solo", "business"],
      location: "Estes Park, CO (30 minutes drive)",
      contact_info: "(970) 586-1206",
      operating_hours: "24/7 (Visitor Centers: 8 AM - 6 PM)",
      price_range: "$30 per vehicle (7-day pass)",
      booking_required: false,
      display_order: 1
    },
    {
      title: "Alpine Adventure Spa",
      description: "Luxury spa services including couples massages, hot stone therapy, and mountain-view relaxation rooms. Perfect for a romantic getaway or personal wellness retreat.",
      activity_type: "wellness",
      target_guest_types: ["couple", "all_female", "solo"],
      location: "Downtown Mountain View (15 minutes drive)",
      contact_info: "(555) SPA-TIME",
      operating_hours: "9 AM - 9 PM daily",
      price_range: "$150 - $400",
      booking_required: true,
      booking_phone: "(555) 772-8463",
      display_order: 2
    },
    {
      title: "Mountain Peak Brewery & Grill",
      description: "Local craft brewery with award-winning beers and hearty mountain cuisine. Live music on weekends, family-friendly atmosphere with outdoor patio.",
      activity_type: "restaurant",
      target_guest_types: ["family", "couple", "all_male", "business"],
      location: "Main Street, Mountain View (10 minutes drive)",
      contact_info: "(555) BREWERY",
      operating_hours: "11 AM - 11 PM (Fri-Sat until midnight)",
      price_range: "$15 - $35 per entree",
      booking_required: false,
      display_order: 3
    },
    {
      title: "Summit Adventure Tours",
      description: "Guided hiking, rock climbing, and mountain biking adventures. Professional guides provide all equipment and instruction for all skill levels.",
      activity_type: "outdoor",
      target_guest_types: ["family", "couple", "all_male", "business"],
      location: "Various locations (pickup available)",
      contact_info: "(555) SUMMIT-1",
      operating_hours: "7 AM - 6 PM (seasonal)",
      price_range: "$75 - $200 per person",
      booking_required: true,
      booking_url: "https://summitadventuretours.com",
      booking_phone: "(555) 786-6481",
      display_order: 4
    },
    {
      title: "Mountain View Golf Club",
      description: "Championship 18-hole golf course with stunning mountain views. Pro shop, driving range, and clubhouse restaurant available.",
      activity_type: "recreation",
      target_guest_types: ["couple", "all_male", "business"],
      location: "Country Club Drive (20 minutes drive)",
      contact_info: "(555) GOLF-PRO",
      operating_hours: "6 AM - 8 PM (weather permitting)",
      price_range: "$65 - $120 per round",
      booking_required: true,
      booking_phone: "(555) 465-3776",
      display_order: 5
    },
    {
      title: "Artisan Market & Boutiques",
      description: "Local artisan shops featuring handmade crafts, jewelry, art, and Colorado specialty items. Perfect for unique souvenirs and gifts.",
      activity_type: "shopping",
      target_guest_types: ["family", "all_female", "couple", "solo"],
      location: "Historic Town Square (12 minutes drive)",
      contact_info: "Various vendors",
      operating_hours: "10 AM - 6 PM (closed Mondays)",
      price_range: "$5 - $200+ items",
      booking_required: false,
      display_order: 6
    }
  ]
};

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database seed...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await client.query('DELETE FROM guest_sessions');
    await client.query('DELETE FROM activities');
    await client.query('DELETE FROM streaming_services');
    await client.query('DELETE FROM guests');
    await client.query('DELETE FROM devices');
    await client.query('DELETE FROM properties');
    
    // Insert properties
    console.log('Inserting properties...');
    const propertyResults = [];
    
    for (const property of sampleData.properties) {
      const result = await client.query(`
        INSERT INTO properties (name, address, wifi_ssid, wifi_password, welcome_message, house_rules, emergency_contact, checkout_instructions)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [
        property.name,
        property.address,
        property.wifi_ssid,
        property.wifi_password,
        property.welcome_message,
        property.house_rules,
        property.emergency_contact,
        property.checkout_instructions
      ]);
      
      propertyResults.push(result.rows[0]);
    }
    
    const propertyId = propertyResults[0].id;
    console.log(`Created property: ${propertyId}`);
    
    // Insert streaming services
    console.log('Inserting streaming services...');
    for (const service of sampleData.streamingServices) {
      await client.query(`
        INSERT INTO streaming_services (property_id, service_name, service_type, app_url_scheme, logo_url, instructions, requires_login, display_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        propertyId,
        service.service_name,
        service.service_type,
        service.app_url_scheme,
        service.logo_url,
        service.instructions,
        service.requires_login,
        service.display_order
      ]);
    }
    
    // Insert activities
    console.log('Inserting activities...');
    for (const activity of sampleData.activities) {
      await client.query(`
        INSERT INTO activities (
          property_id, title, description, activity_type, target_guest_types,
          location, contact_info, operating_hours, price_range, booking_required,
          booking_url, booking_phone, display_order
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        propertyId,
        activity.title,
        activity.description,
        activity.activity_type,
        activity.target_guest_types,
        activity.location,
        activity.contact_info,
        activity.operating_hours,
        activity.price_range,
        activity.booking_required,
        activity.booking_url || null,
        activity.booking_phone || null,
        activity.display_order
      ]);
    }
    
    // Create a sample guest for testing (checking in tomorrow, checking out in 3 days)
    console.log('Creating sample guest...');
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 1); // Tomorrow
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + 3); // 3 days later
    
    await client.query(`
      INSERT INTO guests (
        property_id, first_name, last_name, email, phone, guest_type, party_size,
        check_in_date, check_out_date, special_requests
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      propertyId,
      'John',
      'Doe',
      'john.doe@example.com',
      '(555) 123-4567',
      'couple',
      2,
      checkInDate,
      checkOutDate,
      'Anniversary celebration - would appreciate a welcome bottle of wine'
    ]);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Database seed completed successfully!');
    console.log(`Property ID: ${propertyId}`);
    console.log(`Sample guest checking in: ${checkInDate.toDateString()}`);
    console.log(`Sample guest checking out: ${checkOutDate.toDateString()}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database seed failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run seed if this file is executed directly
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  seedDatabase()
    .then(() => {
      console.log('Seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;