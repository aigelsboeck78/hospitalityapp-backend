#!/usr/bin/env node

import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api/dining';

const breakfastPlaces = [
    {
        name: "Steffl-Bäck Haus",
        description: "Traditional Austrian bakery - Breakfast like a king! Start your day perfectly with our ample breakfast menu including Acai bowl, porridge, Styrian breakfast, Shakshuka, and egg dishes. Features 3 guest rooms with 68 indoor seats and a beautiful castle garden with 54 seats in summer.",
        cuisine_type: "Breakfast",
        price_range: "$$",
        location: JSON.stringify({
            latitude: 47.4556,
            longitude: 13.9456,
            name: "Haus im Ennstal - Schlossplatz",
            walking_time_minutes: 12,
            driving_time_minutes: 5
        }),
        address: "Schlossplatz 48, 8967 Haus im Ennstal",
        phone: "+43 3686 2275",
        website: "https://www.stefflbaeck.at",
        opening_hours: {
            monday: "06:30-18:00",
            tuesday: "06:30-18:00",
            wednesday: "06:30-18:00",
            thursday: "06:30-18:00",
            friday: "06:30-18:00",
            saturday: "06:30-18:00",
            sunday: "07:00-17:00"
        },
        rating: 4.6,
        image_url: null,
        is_featured: true,
        is_active: true,
        reservation_required: false,
        reservation_url: null,
        tags: ["breakfast", "bakery", "coffee", "family-friendly", "outdoor-seating", "winter-garden"]
    },
    {
        name: "Steffl-Bäck Schladming",
        description: "Traditional Austrian bakery and cafe. Perfect for breakfast with fresh bread, pastries, and coffee. Breakfast served until 11:00 AM. Convenient location in Schladming center.",
        cuisine_type: "Breakfast",
        price_range: "$",
        location: JSON.stringify({
            latitude: 47.3928,
            longitude: 13.6863,
            name: "Schladming Center",
            walking_time_minutes: 3,
            driving_time_minutes: 1
        }),
        address: "Salzburger Straße 20, 8970 Schladming",
        phone: "+43 3687 23393",
        website: "https://www.stefflbaeck.at",
        opening_hours: {
            monday: "06:00-18:30",
            tuesday: "06:00-18:30",
            wednesday: "06:00-18:30",
            thursday: "06:00-18:30",
            friday: "06:00-18:30",
            saturday: "06:00-18:30",
            sunday: "07:00-17:00"
        },
        rating: 4.5,
        image_url: null,
        is_featured: true,
        is_active: true,
        reservation_required: false,
        reservation_url: null,
        tags: ["breakfast", "bakery", "coffee", "takeaway", "quick-bite"]
    }
];

async function addDiningPlace(place) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(place)
        });

        if (!response.ok) {
            const error = await response.text();
            console.error(`Failed to add ${place.name}:`, error);
            return false;
        }

        const result = await response.json();
        console.log(`✅ Successfully added: ${place.name}`);
        return true;
    } catch (error) {
        console.error(`Error adding ${place.name}:`, error.message);
        return false;
    }
}

async function main() {
    console.log('🥐 Adding breakfast dining places to database...\n');
    
    for (const place of breakfastPlaces) {
        await addDiningPlace(place);
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n✨ Done! Breakfast dining places have been added.');
}

// Run the script
main().catch(console.error);