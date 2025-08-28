import pool from '../src/config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Default property ID (Alpine Chalet - Schladming)
const PROPERTY_ID = '24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b';

// Categories and their products
const productsData = [
  // Textiles (5 products)
  {
    name: 'Alpine Wool Throw Blanket',
    description: 'Luxurious hand-woven throw blanket made from 100% Austrian merino wool. Features traditional Alpine patterns passed down through generations.',
    short_description: 'Hand-woven merino wool blanket with Alpine patterns',
    price: 189.90,
    original_price: 229.90,
    category: 'textiles',
    availability: 'in_stock',
    stock_count: 8,
    is_featured: true,
    craftsperson_name: 'Maria Huber',
    materials: ['100% Merino Wool', 'Natural Dyes'],
    dimensions: '150cm x 200cm',
    weight: '1.2kg',
    care_instructions: 'Dry clean only or hand wash in cold water',
    tags: ['handwoven', 'merino', 'blanket', 'traditional']
  },
  {
    name: 'Linen Table Runner - Mountain Meadow',
    description: 'Elegant table runner featuring embroidered Alpine wildflowers. Made from premium Belgian linen with Austrian craftsmanship.',
    short_description: 'Embroidered linen table runner with wildflower design',
    price: 75.00,
    category: 'textiles',
    availability: 'in_stock',
    stock_count: 12,
    craftsperson_name: 'Anna Steiner',
    materials: ['Belgian Linen', 'Cotton Thread'],
    dimensions: '40cm x 180cm',
    weight: '300g',
    care_instructions: 'Machine wash cold, gentle cycle. Iron while damp.',
    tags: ['linen', 'table', 'embroidered', 'dining']
  },
  {
    name: 'Hemp Cushion Covers - Set of 2',
    description: 'Sustainable cushion covers made from organic hemp fabric. Natural, breathable, and incredibly durable.',
    short_description: 'Organic hemp cushion covers, set of 2',
    price: 55.00,
    original_price: 65.00,
    category: 'textiles',
    availability: 'in_stock',
    stock_count: 20,
    is_sustainable: true,
    materials: ['Organic Hemp', 'Coconut Shell Buttons'],
    dimensions: '45cm x 45cm each',
    weight: '200g per cover',
    care_instructions: 'Machine washable at 40°C',
    tags: ['hemp', 'sustainable', 'cushions', 'organic']
  },
  {
    name: 'Traditional Dirndl Apron',
    description: 'Authentic Austrian dirndl apron with delicate lace trim and traditional patterns. Perfect for special occasions.',
    short_description: 'Authentic dirndl apron with lace trim',
    price: 89.00,
    category: 'textiles',
    availability: 'made_to_order',
    is_locally_made: true,
    craftsperson_name: 'Greta Müller',
    materials: ['Cotton', 'Lace', 'Satin Ribbon'],
    dimensions: 'One size fits most',
    weight: '250g',
    care_instructions: 'Hand wash recommended',
    tags: ['dirndl', 'traditional', 'austrian', 'apron']
  },
  {
    name: 'Felted Wool Slippers',
    description: 'Cozy house slippers made from felted Austrian wool. Non-slip sole perfect for chalet floors.',
    short_description: 'Felted wool house slippers with non-slip sole',
    price: 45.00,
    category: 'textiles',
    availability: 'in_stock',
    stock_count: 15,
    materials: ['Felted Wool', 'Rubber Sole'],
    dimensions: 'Sizes 36-45 available',
    weight: '200g per pair',
    care_instructions: 'Spot clean only',
    tags: ['slippers', 'wool', 'felted', 'comfort']
  },

  // Ceramics (5 products)
  {
    name: 'Mountain Peak Mug Set',
    description: 'Set of 4 handcrafted ceramic mugs featuring a mountain peak glaze design. Each mug is unique.',
    short_description: 'Set of 4 handcrafted mountain-themed mugs',
    price: 95.00,
    category: 'ceramics',
    availability: 'in_stock',
    stock_count: 10,
    is_featured: true,
    craftsperson_name: 'Klaus Wagner',
    materials: ['Stoneware Clay', 'Lead-free Glazes'],
    dimensions: '350ml capacity each',
    weight: '300g per mug',
    care_instructions: 'Dishwasher and microwave safe',
    tags: ['mugs', 'ceramic', 'handmade', 'mountain']
  },
  {
    name: 'Glazed Serving Bowl - Alpine Blue',
    description: 'Large serving bowl with stunning Alpine blue glaze. Perfect for salads or as a decorative centerpiece.',
    short_description: 'Large ceramic bowl with Alpine blue glaze',
    price: 120.00,
    category: 'ceramics',
    availability: 'low_stock',
    stock_count: 3,
    craftsperson_name: 'Klaus Wagner',
    materials: ['Porcelain', 'Natural Glazes'],
    dimensions: '30cm diameter x 12cm height',
    weight: '1.5kg',
    care_instructions: 'Hand wash recommended for longevity',
    tags: ['bowl', 'serving', 'ceramic', 'blue']
  },
  {
    name: 'Rustic Dinner Plate Set',
    description: 'Set of 6 rustic dinner plates with earthy tones inspired by Alpine minerals.',
    short_description: 'Set of 6 rustic ceramic dinner plates',
    price: 145.00,
    original_price: 175.00,
    category: 'ceramics',
    availability: 'in_stock',
    stock_count: 8,
    materials: ['Stoneware', 'Mineral Glazes'],
    dimensions: '27cm diameter each',
    weight: '500g per plate',
    care_instructions: 'Dishwasher safe',
    tags: ['plates', 'dinnerware', 'rustic', 'ceramic']
  },
  {
    name: 'Ceramic Vase - Wildflower',
    description: 'Elegant vase with hand-painted wildflower motifs. A beautiful addition to any Alpine home.',
    short_description: 'Hand-painted wildflower ceramic vase',
    price: 85.00,
    category: 'ceramics',
    availability: 'in_stock',
    stock_count: 6,
    craftsperson_name: 'Elisabeth Hofer',
    materials: ['Porcelain', 'Ceramic Paints'],
    dimensions: '25cm height x 15cm diameter',
    weight: '800g',
    care_instructions: 'Hand wash only',
    tags: ['vase', 'ceramic', 'painted', 'flowers']
  },
  {
    name: 'Tea Light Holders - Mountain Silhouette',
    description: 'Set of 3 ceramic tea light holders with cut-out mountain silhouettes. Creates beautiful shadows.',
    short_description: 'Set of 3 mountain silhouette tea light holders',
    price: 42.00,
    category: 'ceramics',
    availability: 'in_stock',
    stock_count: 18,
    materials: ['Ceramic', 'Heat-resistant Glaze'],
    dimensions: '8cm x 8cm x 10cm each',
    weight: '150g each',
    care_instructions: 'Wipe clean with damp cloth',
    tags: ['candle', 'holder', 'ceramic', 'mountain']
  },

  // Woodwork (5 products)
  {
    name: 'Alpine Pine Cutting Board',
    description: 'Handcrafted cutting board from sustainable Austrian pine. Natural antibacterial properties.',
    short_description: 'Handcrafted pine cutting board',
    price: 68.00,
    category: 'woodwork',
    availability: 'in_stock',
    stock_count: 14,
    is_sustainable: true,
    craftsperson_name: 'Josef Bauer',
    materials: ['Austrian Pine', 'Natural Oil Finish'],
    dimensions: '40cm x 25cm x 3cm',
    weight: '1.2kg',
    care_instructions: 'Hand wash, oil monthly with mineral oil',
    tags: ['cutting board', 'pine', 'kitchen', 'sustainable']
  },
  {
    name: 'Oak Wine Rack - 8 Bottle',
    description: 'Elegant wine rack handcrafted from Austrian oak. Holds 8 bottles in style.',
    short_description: 'Handcrafted oak wine rack for 8 bottles',
    price: 145.00,
    category: 'woodwork',
    availability: 'in_stock',
    stock_count: 5,
    is_featured: true,
    craftsperson_name: 'Josef Bauer',
    materials: ['Austrian Oak', 'Beeswax Finish'],
    dimensions: '50cm x 20cm x 35cm',
    weight: '3kg',
    care_instructions: 'Dust regularly, polish with beeswax annually',
    tags: ['wine', 'rack', 'oak', 'storage']
  },
  {
    name: 'Maple Serving Tray',
    description: 'Beautiful serving tray with carved handles. Perfect for breakfast in bed or aperitifs.',
    short_description: 'Maple wood serving tray with carved handles',
    price: 58.00,
    category: 'woodwork',
    availability: 'in_stock',
    stock_count: 10,
    materials: ['Maple Wood', 'Food-safe Varnish'],
    dimensions: '45cm x 30cm x 5cm',
    weight: '800g',
    care_instructions: 'Wipe clean, do not soak',
    tags: ['tray', 'serving', 'maple', 'kitchen']
  },
  {
    name: 'Birch Coaster Set',
    description: 'Set of 6 birch wood coasters with natural bark edges. Protects surfaces with style.',
    short_description: 'Set of 6 natural birch wood coasters',
    price: 32.00,
    category: 'woodwork',
    availability: 'in_stock',
    stock_count: 22,
    is_sustainable: true,
    materials: ['Birch Wood', 'Natural Wax'],
    dimensions: '10cm diameter x 1cm thick',
    weight: '50g per coaster',
    care_instructions: 'Wipe clean, re-wax as needed',
    tags: ['coasters', 'birch', 'natural', 'tableware']
  },
  {
    name: 'Carved Wooden Spoon Set',
    description: 'Set of 3 hand-carved wooden spoons. Each piece is unique with natural wood grain.',
    short_description: 'Set of 3 hand-carved wooden spoons',
    price: 38.00,
    category: 'woodwork',
    availability: 'in_stock',
    stock_count: 16,
    craftsperson_name: 'Thomas Gruber',
    materials: ['Cherry Wood', 'Walnut Oil'],
    dimensions: 'Various sizes 20-30cm',
    weight: '150g total',
    care_instructions: 'Hand wash, oil occasionally',
    tags: ['spoons', 'carved', 'kitchen', 'utensils']
  },

  // Jewelry (5 products)
  {
    name: 'Silver Edelweiss Pendant',
    description: 'Sterling silver pendant featuring the iconic Edelweiss flower. Symbol of Alpine beauty.',
    short_description: 'Sterling silver Edelweiss flower pendant',
    price: 125.00,
    category: 'jewelry',
    availability: 'in_stock',
    stock_count: 8,
    is_featured: true,
    craftsperson_name: 'Ingrid Fischer',
    materials: ['Sterling Silver', 'Silver Chain'],
    dimensions: 'Pendant: 2cm, Chain: 45cm',
    weight: '10g',
    care_instructions: 'Polish with silver cloth',
    tags: ['pendant', 'silver', 'edelweiss', 'necklace']
  },
  {
    name: 'Copper Mountain Bracelet',
    description: 'Hand-forged copper bracelet with mountain ridge design. Adjustable size.',
    short_description: 'Hand-forged copper bracelet with mountain design',
    price: 68.00,
    category: 'jewelry',
    availability: 'in_stock',
    stock_count: 12,
    craftsperson_name: 'Hans Schmid',
    materials: ['Pure Copper'],
    dimensions: 'Adjustable 15-20cm',
    weight: '25g',
    care_instructions: 'Polish to maintain shine',
    tags: ['bracelet', 'copper', 'mountain', 'adjustable']
  },
  {
    name: 'Alpine Crystal Earrings',
    description: 'Delicate earrings featuring Austrian crystals. Catch the light beautifully.',
    short_description: 'Austrian crystal drop earrings',
    price: 95.00,
    original_price: 115.00,
    category: 'jewelry',
    availability: 'low_stock',
    stock_count: 4,
    materials: ['Austrian Crystal', 'Silver-plated Hooks'],
    dimensions: '3cm drop length',
    weight: '5g per pair',
    care_instructions: 'Store in jewelry box',
    tags: ['earrings', 'crystal', 'austrian', 'elegant']
  },
  {
    name: 'Wooden Bead Necklace',
    description: 'Natural wooden beads with silver accents. Modern take on traditional Alpine jewelry.',
    short_description: 'Natural wood bead necklace with silver accents',
    price: 52.00,
    category: 'jewelry',
    availability: 'in_stock',
    stock_count: 10,
    is_sustainable: true,
    materials: ['Ash Wood', 'Silver Beads'],
    dimensions: '50cm length',
    weight: '30g',
    care_instructions: 'Keep dry, avoid perfumes',
    tags: ['necklace', 'wooden', 'beads', 'natural']
  },
  {
    name: 'Stone Ring - Tyrolean Marble',
    description: 'Unique ring featuring polished Tyrolean marble. Each stone pattern is one of a kind.',
    short_description: 'Tyrolean marble stone ring',
    price: 78.00,
    category: 'jewelry',
    availability: 'made_to_order',
    craftsperson_name: 'Ingrid Fischer',
    materials: ['Tyrolean Marble', 'Stainless Steel Band'],
    dimensions: 'Various sizes available',
    weight: '15g',
    care_instructions: 'Remove before swimming',
    tags: ['ring', 'marble', 'stone', 'unique']
  },

  // Food (5 products)
  {
    name: 'Alpine Honey Collection',
    description: 'Set of 3 artisanal honeys: wildflower, forest, and mountain herb. From local beekeepers.',
    short_description: 'Set of 3 artisanal Alpine honeys',
    price: 48.00,
    category: 'food',
    availability: 'in_stock',
    stock_count: 20,
    is_featured: true,
    is_locally_made: true,
    craftsperson_name: 'Familie Berger Imkerei',
    materials: ['100% Pure Honey'],
    dimensions: '3 x 250g jars',
    weight: '750g total',
    care_instructions: 'Store at room temperature',
    tags: ['honey', 'artisanal', 'local', 'gift']
  },
  {
    name: 'Mountain Herb Tea Blend',
    description: 'Organic herbal tea blend with chamomile, mint, and Alpine herbs. Soothing and refreshing.',
    short_description: 'Organic Alpine herb tea blend',
    price: 22.00,
    category: 'food',
    availability: 'in_stock',
    stock_count: 30,
    is_sustainable: true,
    materials: ['Organic Herbs'],
    dimensions: '100g package',
    weight: '100g',
    care_instructions: 'Store in cool, dry place',
    tags: ['tea', 'herbs', 'organic', 'alpine']
  },
  {
    name: 'Tyrolean Speck - Sliced',
    description: 'Traditional smoked ham from Tyrol. Delicately spiced and aged to perfection.',
    short_description: 'Traditional Tyrolean smoked ham, sliced',
    price: 35.00,
    category: 'food',
    availability: 'in_stock',
    stock_count: 15,
    is_locally_made: true,
    materials: ['Pork', 'Natural Spices', 'Salt'],
    dimensions: '200g package',
    weight: '200g',
    care_instructions: 'Keep refrigerated',
    tags: ['speck', 'meat', 'tyrolean', 'traditional']
  },
  {
    name: 'Artisan Chocolate Box',
    description: 'Premium dark chocolates infused with Alpine herbs and berries. 12 pieces.',
    short_description: 'Premium dark chocolates with Alpine flavors',
    price: 42.00,
    category: 'food',
    availability: 'in_stock',
    stock_count: 18,
    craftsperson_name: 'Chocolaterie Alpin',
    materials: ['70% Cacao', 'Alpine Herbs', 'Berries'],
    dimensions: '20cm x 15cm box',
    weight: '250g',
    care_instructions: 'Store below 20°C',
    tags: ['chocolate', 'artisan', 'premium', 'gift']
  },
  {
    name: 'Schnapps Tasting Set',
    description: 'Collection of 5 traditional Austrian fruit schnapps. Perfect for après-ski.',
    short_description: 'Set of 5 traditional fruit schnapps',
    price: 65.00,
    category: 'food',
    availability: 'low_stock',
    stock_count: 6,
    is_locally_made: true,
    materials: ['Distilled Fruit Spirits'],
    dimensions: '5 x 50ml bottles',
    weight: '500g',
    care_instructions: 'Store upright in cool place',
    tags: ['schnapps', 'spirits', 'austrian', 'tasting']
  },

  // Wellness (5 products)
  {
    name: 'Pine Essential Oil',
    description: 'Pure Austrian pine essential oil. Perfect for aromatherapy and relaxation.',
    short_description: 'Pure Austrian pine essential oil',
    price: 38.00,
    category: 'wellness',
    availability: 'in_stock',
    stock_count: 25,
    is_locally_made: true,
    materials: ['100% Pine Essential Oil'],
    dimensions: '30ml bottle',
    weight: '50g',
    care_instructions: 'Keep away from direct sunlight',
    tags: ['essential oil', 'pine', 'aromatherapy', 'natural']
  },
  {
    name: 'Lavender Bath Salts',
    description: 'Relaxing bath salts with Austrian lavender and mineral salts from Bad Ischl.',
    short_description: 'Lavender and mineral bath salts',
    price: 28.00,
    category: 'wellness',
    availability: 'in_stock',
    stock_count: 20,
    is_sustainable: true,
    materials: ['Mineral Salts', 'Lavender', 'Essential Oils'],
    dimensions: '500g jar',
    weight: '500g',
    care_instructions: 'Keep lid closed, store in dry place',
    tags: ['bath', 'salts', 'lavender', 'relaxation']
  },
  {
    name: 'Herbal Soap Collection',
    description: 'Set of 4 handmade soaps with Alpine herbs: calendula, chamomile, arnica, and mint.',
    short_description: 'Set of 4 handmade herbal soaps',
    price: 45.00,
    original_price: 55.00,
    category: 'wellness',
    availability: 'in_stock',
    stock_count: 16,
    is_featured: true,
    craftsperson_name: 'Naturkosmetik Tirol',
    materials: ['Natural Oils', 'Alpine Herbs', 'Shea Butter'],
    dimensions: '4 x 100g bars',
    weight: '400g',
    care_instructions: 'Keep dry between uses',
    tags: ['soap', 'herbal', 'handmade', 'natural']
  },
  {
    name: 'Mountain Air Candle',
    description: 'Soy wax candle with pine, eucalyptus, and mint. Brings the mountains indoors.',
    short_description: 'Mountain-scented soy wax candle',
    price: 35.00,
    category: 'wellness',
    availability: 'in_stock',
    stock_count: 22,
    is_sustainable: true,
    materials: ['Soy Wax', 'Essential Oils', 'Cotton Wick'],
    dimensions: '8cm x 10cm',
    weight: '300g',
    care_instructions: 'Trim wick before each use',
    tags: ['candle', 'soy', 'mountain', 'aromatherapy']
  },
  {
    name: 'Massage Oil - Arnica',
    description: 'Warming massage oil with arnica extract. Perfect after a day on the slopes.',
    short_description: 'Arnica warming massage oil',
    price: 32.00,
    category: 'wellness',
    availability: 'in_stock',
    stock_count: 14,
    materials: ['Almond Oil', 'Arnica Extract', 'Vitamin E'],
    dimensions: '100ml bottle',
    weight: '120g',
    care_instructions: 'For external use only',
    tags: ['massage', 'oil', 'arnica', 'muscle']
  },

  // Books (5 products)
  {
    name: 'Alpine Flora Guide',
    description: 'Comprehensive guide to Alpine wildflowers and plants. Illustrated with beautiful photographs.',
    short_description: 'Illustrated guide to Alpine flora',
    price: 45.00,
    category: 'books',
    availability: 'in_stock',
    stock_count: 10,
    materials: ['Hardcover', '200 pages'],
    dimensions: '20cm x 25cm',
    weight: '800g',
    tags: ['guide', 'flora', 'nature', 'photography']
  },
  {
    name: 'Austrian Cookbook',
    description: 'Traditional Austrian recipes from schnitzel to sachertorte. Family recipes included.',
    short_description: 'Traditional Austrian recipe collection',
    price: 38.00,
    category: 'books',
    availability: 'in_stock',
    stock_count: 12,
    is_featured: true,
    materials: ['Hardcover', '180 pages'],
    dimensions: '22cm x 28cm',
    weight: '1kg',
    tags: ['cookbook', 'recipes', 'austrian', 'traditional']
  },
  {
    name: 'History of Schladming',
    description: 'Fascinating history of Schladming from mining town to ski resort. Rich with photographs.',
    short_description: 'Historical account of Schladming',
    price: 52.00,
    category: 'books',
    availability: 'low_stock',
    stock_count: 5,
    is_locally_made: true,
    materials: ['Hardcover', '240 pages'],
    dimensions: '24cm x 30cm',
    weight: '1.2kg',
    tags: ['history', 'schladming', 'local', 'photography']
  },
  {
    name: 'Mountain Photography',
    description: 'Stunning photography book featuring the Austrian Alps through the seasons.',
    short_description: 'Austrian Alps photography collection',
    price: 68.00,
    original_price: 85.00,
    category: 'books',
    availability: 'in_stock',
    stock_count: 8,
    materials: ['Hardcover', '160 pages'],
    dimensions: '30cm x 30cm',
    weight: '1.5kg',
    tags: ['photography', 'mountains', 'alps', 'coffee table']
  },
  {
    name: 'Hiking Trails Map Book',
    description: 'Detailed maps and descriptions of hiking trails around Schladming-Dachstein region.',
    short_description: 'Schladming-Dachstein hiking trail maps',
    price: 28.00,
    category: 'books',
    availability: 'in_stock',
    stock_count: 18,
    materials: ['Paperback', '120 pages', 'Waterproof'],
    dimensions: '15cm x 21cm',
    weight: '300g',
    tags: ['hiking', 'maps', 'trails', 'outdoor']
  },

  // Clothing (5 products)
  {
    name: 'Merino Wool Sweater',
    description: 'Classic Alpine sweater in 100% merino wool. Traditional pattern, modern fit.',
    short_description: 'Classic merino wool Alpine sweater',
    price: 185.00,
    category: 'clothing',
    availability: 'in_stock',
    stock_count: 10,
    is_featured: true,
    materials: ['100% Merino Wool'],
    dimensions: 'Sizes S-XXL available',
    weight: '500g',
    care_instructions: 'Hand wash or wool cycle',
    tags: ['sweater', 'merino', 'wool', 'traditional']
  },
  {
    name: 'Loden Jacket',
    description: 'Traditional Austrian loden jacket. Water-resistant and warm. Timeless style.',
    short_description: 'Traditional water-resistant loden jacket',
    price: 295.00,
    category: 'clothing',
    availability: 'made_to_order',
    is_locally_made: true,
    craftsperson_name: 'Schneider Werkstatt Wien',
    materials: ['Loden Wool', 'Horn Buttons'],
    dimensions: 'Custom sizing available',
    weight: '1.2kg',
    care_instructions: 'Professional cleaning recommended',
    tags: ['jacket', 'loden', 'traditional', 'waterproof']
  },
  {
    name: 'Felt Alpine Hat',
    description: 'Classic Alpine felt hat with feather decoration. One size fits most.',
    short_description: 'Classic felt Alpine hat with feather',
    price: 78.00,
    category: 'clothing',
    availability: 'in_stock',
    stock_count: 8,
    materials: ['Wool Felt', 'Feather Decoration'],
    dimensions: 'Adjustable 56-60cm',
    weight: '200g',
    care_instructions: 'Brush gently, keep dry',
    tags: ['hat', 'felt', 'alpine', 'traditional']
  },
  {
    name: 'Knitted Wool Gloves',
    description: 'Hand-knitted wool gloves with traditional Alpine patterns. Warm and stylish.',
    short_description: 'Hand-knitted wool gloves with patterns',
    price: 42.00,
    category: 'clothing',
    availability: 'in_stock',
    stock_count: 15,
    craftsperson_name: 'Oma Gertrude',
    materials: ['Wool Yarn', 'Fleece Lining'],
    dimensions: 'S, M, L sizes',
    weight: '100g',
    care_instructions: 'Hand wash in lukewarm water',
    tags: ['gloves', 'knitted', 'wool', 'warm']
  },
  {
    name: 'Thermal Base Layer Set',
    description: 'High-performance merino wool base layer. Perfect for skiing and winter activities.',
    short_description: 'Merino wool thermal base layer set',
    price: 125.00,
    original_price: 145.00,
    category: 'clothing',
    availability: 'in_stock',
    stock_count: 12,
    is_sustainable: true,
    materials: ['Merino Wool', 'Elastane'],
    dimensions: 'XS-XXL available',
    weight: '300g',
    care_instructions: 'Machine wash cold, air dry',
    tags: ['thermal', 'base layer', 'merino', 'skiing']
  }
];

async function seedShopProducts() {
  try {
    console.log('🌱 Starting to seed shop products...');
    
    // First, clear existing products for this property
    await pool.query('DELETE FROM shop_products WHERE property_id = $1', [PROPERTY_ID]);
    console.log('✅ Cleared existing products');
    
    let insertedCount = 0;
    
    for (const product of productsData) {
      const id = uuidv4();
      const slug = product.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const query = `
        INSERT INTO shop_products (
          id, property_id, name, description, short_description,
          price, original_price, category, availability, stock_count,
          is_featured, is_locally_made, is_sustainable, craftsperson_name,
          materials, dimensions, weight, care_instructions, tags,
          slug, image_url, is_active
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13, $14,
          $15, $16, $17, $18, $19,
          $20, $21, $22
        )
      `;
      
      const values = [
        id,
        PROPERTY_ID,
        product.name,
        product.description,
        product.short_description,
        product.price,
        product.original_price || null,
        product.category,
        product.availability || 'in_stock',
        product.stock_count || 0,
        product.is_featured || false,
        product.is_locally_made !== false,
        product.is_sustainable || false,
        product.craftsperson_name || null,
        JSON.stringify(product.materials || []),
        product.dimensions || null,
        product.weight || null,
        product.care_instructions || null,
        JSON.stringify(product.tags || []),
        slug,
        `https://picsum.photos/400/300?random=${insertedCount + 1}`,
        true
      ];
      
      await pool.query(query, values);
      insertedCount++;
      console.log(`✅ Inserted: ${product.name} (${insertedCount}/${productsData.length})`);
    }
    
    console.log(`\n🎉 Successfully seeded ${insertedCount} shop products!`);
    
    // Get summary statistics
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_featured = true THEN 1 END) as featured,
        COUNT(CASE WHEN availability = 'in_stock' THEN 1 END) as in_stock,
        COUNT(CASE WHEN is_locally_made = true THEN 1 END) as locally_made
      FROM shop_products 
      WHERE property_id = $1
    `, [PROPERTY_ID]);
    
    console.log('\n📊 Product Statistics:');
    console.log(`   Total Products: ${stats.rows[0].total}`);
    console.log(`   Featured: ${stats.rows[0].featured}`);
    console.log(`   In Stock: ${stats.rows[0].in_stock}`);
    console.log(`   Locally Made: ${stats.rows[0].locally_made}`);
    
    // Show category breakdown
    const categories = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM shop_products
      WHERE property_id = $1
      GROUP BY category
      ORDER BY category
    `, [PROPERTY_ID]);
    
    console.log('\n📦 Products by Category:');
    categories.rows.forEach(cat => {
      console.log(`   ${cat.category}: ${cat.count} products`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding shop products:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seeding
seedShopProducts()
  .then(() => {
    console.log('\n✨ Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding failed:', error);
    process.exit(1);
  });