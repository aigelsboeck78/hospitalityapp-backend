import pool from '../config/database.js';

class ShopProduct {
  static async findAll(propertyId) {
    try {
      const query = `
        SELECT 
          id,
          property_id,
          name,
          description,
          short_description,
          price,
          original_price,
          image_url,
          additional_images,
          category,
          availability,
          stock_count,
          is_featured,
          is_locally_made,
          craftsperson_name,
          materials,
          dimensions,
          weight,
          care_instructions,
          tags,
          created_at
        FROM shop_products 
        WHERE property_id = $1 
        AND is_active = true
        ORDER BY created_at DESC
      `;
      
      const result = await pool.query(query, [propertyId]);
      
      // If no products in database, return empty array (database is now seeded)
      if (result.rows.length === 0) {
        console.log('No products found for property:', propertyId);
        return [];
      }
      
      return result.rows.map(row => this.mapRowToProduct(row));
    } catch (error) {
      console.error('Error finding shop products:', error);
      // Don't fallback to mock data anymore - database is ready
      throw error;
    }
  }

  static async findById(id, propertyId) {
    try {
      const query = `
        SELECT 
          id,
          property_id,
          name,
          description,
          short_description,
          price,
          original_price,
          image_url,
          additional_images,
          category,
          availability,
          stock_count,
          is_featured,
          is_locally_made,
          craftsperson_name,
          materials,
          dimensions,
          weight,
          care_instructions,
          tags,
          created_at
        FROM shop_products 
        WHERE id = $1 AND property_id = $2 
        AND is_active = true
      `;
      
      const result = await pool.query(query, [id, propertyId]);
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToProduct(result.rows[0]);
    } catch (error) {
      console.error('Error finding shop product:', error);
      return null;
    }
  }

  static async findByCategory(propertyId, category) {
    try {
      if (category === 'all') {
        return await this.findAll(propertyId);
      }

      const query = `
        SELECT 
          id,
          property_id,
          name,
          description,
          short_description,
          price,
          original_price,
          image_url,
          additional_images,
          category,
          availability,
          stock_count,
          is_featured,
          is_locally_made,
          craftsperson_name,
          materials,
          dimensions,
          weight,
          care_instructions,
          tags,
          created_at
        FROM shop_products 
        WHERE property_id = $1 
        AND category = $2
        AND is_active = true
        ORDER BY created_at DESC
      `;
      
      const result = await pool.query(query, [propertyId, category]);
      return result.rows.map(row => this.mapRowToProduct(row));
    } catch (error) {
      console.error('Error finding shop products by category:', error);
      throw error;
    }
  }

  static async findFeatured(propertyId) {
    try {
      const query = `
        SELECT 
          id,
          property_id,
          name,
          description,
          short_description,
          price,
          original_price,
          image_url,
          additional_images,
          category,
          availability,
          stock_count,
          is_featured,
          is_locally_made,
          craftsperson_name,
          materials,
          dimensions,
          weight,
          care_instructions,
          tags,
          created_at
        FROM shop_products 
        WHERE property_id = $1 
        AND is_featured = true
        AND is_active = true
        ORDER BY created_at DESC
        LIMIT 10
      `;
      
      const result = await pool.query(query, [propertyId]);
      return result.rows.map(row => this.mapRowToProduct(row));
    } catch (error) {
      console.error('Error finding featured shop products:', error);
      throw error;
    }
  }

  static async create(productData) {
    try {
      const query = `
        INSERT INTO shop_products (
          property_id, name, description, short_description, price, original_price,
          image_url, category, availability, stock_count, is_featured, is_locally_made,
          craftsperson_name, materials, dimensions, weight, care_instructions, tags
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        ) RETURNING *
      `;
      
      const values = [
        productData.propertyId,
        productData.name,
        productData.description,
        productData.shortDescription || null,
        productData.price,
        productData.originalPrice || null,
        productData.imageUrl || null,
        productData.category,
        productData.availability || 'in_stock',
        productData.stockCount || 0,
        productData.isFeatured || false,
        productData.isLocallyMade !== undefined ? productData.isLocallyMade : true,
        productData.craftspersonName || null,
        JSON.stringify(productData.materials || []),
        productData.dimensions || null,
        productData.weight || null,
        productData.careInstructions || null,
        JSON.stringify(productData.tags || [])
      ];
      
      const result = await pool.query(query, values);
      return this.mapRowToProduct(result.rows[0]);
    } catch (error) {
      console.error('Error creating shop product:', error);
      throw error;
    }
  }

  static async update(productId, propertyId, productData) {
    try {
      const query = `
        UPDATE shop_products SET
          name = $3,
          description = $4,
          short_description = $5,
          price = $6,
          original_price = $7,
          image_url = $8,
          category = $9,
          availability = $10,
          stock_count = $11,
          is_featured = $12,
          is_locally_made = $13,
          craftsperson_name = $14,
          materials = $15,
          dimensions = $16,
          weight = $17,
          care_instructions = $18,
          tags = $19,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND property_id = $2 AND is_active = true
        RETURNING *
      `;
      
      const values = [
        productId,
        propertyId,
        productData.name,
        productData.description,
        productData.shortDescription || null,
        productData.price,
        productData.originalPrice || null,
        productData.imageUrl || null,
        productData.category,
        productData.availability || 'in_stock',
        productData.stockCount || 0,
        productData.isFeatured || false,
        productData.isLocallyMade !== undefined ? productData.isLocallyMade : true,
        productData.craftspersonName || null,
        JSON.stringify(productData.materials || []),
        productData.dimensions || null,
        productData.weight || null,
        productData.careInstructions || null,
        JSON.stringify(productData.tags || [])
      ];
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToProduct(result.rows[0]);
    } catch (error) {
      console.error('Error updating shop product:', error);
      throw error;
    }
  }

  static async delete(productId, propertyId) {
    try {
      // Soft delete by setting is_active to false
      const query = `
        UPDATE shop_products 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND property_id = $2 AND is_active = true
        RETURNING id
      `;
      
      const result = await pool.query(query, [productId, propertyId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting shop product:', error);
      throw error;
    }
  }

  static mapRowToProduct(row) {
    return {
      id: row.id,
      propertyId: row.property_id,
      name: row.name,
      description: row.description,
      shortDescription: row.short_description,
      price: parseFloat(row.price),
      originalPrice: row.original_price ? parseFloat(row.original_price) : null,
      imageUrl: row.image_url,
      additionalImages: row.additional_images || [],
      category: row.category,
      availability: row.availability,
      stockCount: row.stock_count,
      isFeatured: row.is_featured,
      isLocallyMade: row.is_locally_made,
      craftspersonName: row.craftsperson_name,
      materials: row.materials || [],
      dimensions: row.dimensions,
      weight: row.weight,
      careInstructions: row.care_instructions,
      tags: row.tags || [],
      createdAt: row.created_at
    };
  }

  static getMockProducts(propertyId) {
    const categories = ['textiles', 'ceramics', 'woodwork', 'jewelry', 'food', 'wellness', 'books', 'clothing'];
    const products = [];
    
    // Generate 40 mock products
    for (let i = 1; i <= 40; i++) {
      const category = categories[(i - 1) % categories.length];
      const isFeatured = Math.random() > 0.8; // 20% chance
      const price = Math.round((Math.random() * 120 + 15) * 100) / 100;
      const hasOriginalPrice = Math.random() > 0.7;
      
      products.push({
        id: `mock_product_${i.toString().padStart(3, '0')}`,
        propertyId: propertyId,
        name: this.generateProductName(category, i),
        description: this.generateDescription(category),
        shortDescription: this.generateShortDescription(category),
        price: price,
        originalPrice: hasOriginalPrice ? Math.round((price + Math.random() * 50) * 100) / 100 : null,
        imageUrl: `https://picsum.photos/400/300?random=${i}&blur=1`,
        additionalImages: [],
        category: category,
        availability: ['in_stock', 'low_stock', 'made_to_order'][Math.floor(Math.random() * 3)],
        stockCount: Math.floor(Math.random() * 20) + 1,
        isFeatured: isFeatured,
        isLocallyMade: Math.random() > 0.3, // 70% locally made
        craftspersonName: this.generateCraftspersonName(),
        materials: this.getMaterialsForCategory(category),
        dimensions: this.generateDimensions(),
        weight: this.generateWeight(),
        careInstructions: this.getCareInstructions(category),
        tags: this.getTagsForCategory(category),
        createdAt: new Date()
      });
    }
    
    return products;
  }

  static generateProductName(category, index) {
    const names = {
      textiles: ['Alpine Wool Throw', 'Linen Table Runner', 'Hemp Cushion Cover', 'Merino Scarf'],
      ceramics: ['Mountain Mug Set', 'Glazed Bowl', 'Ceramic Vase', 'Stoneware Plate'],
      woodwork: ['Pine Cutting Board', 'Oak Spice Rack', 'Maple Bowl', 'Birch Coasters'],
      jewelry: ['Silver Edelweiss Ring', 'Copper Bracelet', 'Stone Pendant', 'Wood Earrings'],
      food: ['Alpine Honey Set', 'Mountain Tea Blend', 'Herbal Salt', 'Artisan Chocolates'],
      wellness: ['Lavender Soap', 'Pine Bath Oil', 'Herbal Candles', 'Natural Scrub'],
      books: ['Alpine Guide', 'Local History', 'Nature Journal', 'Recipe Collection'],
      clothing: ['Wool Sweater', 'Linen Shirt', 'Felt Hat', 'Knitted Gloves']
    };
    
    const categoryNames = names[category] || ['Handcrafted Item'];
    const baseName = categoryNames[index % categoryNames.length];
    return `${baseName} #${index}`;
  }

  static generateDescription(category) {
    const descriptions = {
      textiles: 'Handwoven from premium natural fibers using traditional Alpine techniques.',
      ceramics: 'Hand-thrown by local artisans, featuring mountain-inspired glazes.',
      woodwork: 'Crafted from sustainably sourced Alpine wood by master craftsmen.',
      jewelry: 'Handcrafted jewelry inspired by the natural beauty of the Austrian Alps.',
      food: 'Made from local Alpine ingredients following traditional recipes.',
      wellness: 'Natural wellness products made from pure Alpine herbs and oils.',
      books: 'Curated collection celebrating Alpine culture and mountain life.',
      clothing: 'Comfortable Alpine-style clothing made from natural materials.'
    };
    
    return descriptions[category] || 'Beautiful handcrafted item made with care.';
  }

  static generateShortDescription(category) {
    const short = {
      textiles: 'Premium natural fibers, traditional techniques',
      ceramics: 'Hand-thrown, mountain-inspired glazes',
      woodwork: 'Sustainable Alpine wood, master crafted',
      jewelry: 'Alpine-inspired, handcrafted with care',
      food: 'Local ingredients, traditional recipes',
      wellness: 'Natural Alpine herbs and oils',
      books: 'Alpine culture and mountain traditions',
      clothing: 'Natural materials, Alpine style'
    };
    
    return short[category] || 'Handcrafted with care';
  }

  static generateCraftspersonName() {
    const names = ['Maria Huber', 'Johann Steiner', 'Anna Goldschmidt', 'Franz Weber', 'Klaus Wagner', 'Greta Hoffman'];
    return Math.random() > 0.5 ? names[Math.floor(Math.random() * names.length)] : null;
  }

  static getMaterialsForCategory(category) {
    const materials = {
      textiles: ['Merino Wool', 'Organic Cotton', 'Linen'],
      ceramics: ['Local Clay', 'Natural Glazes'],
      woodwork: ['Alpine Pine', 'Oak', 'Natural Oil'],
      jewelry: ['Sterling Silver', 'Natural Stones'],
      food: ['Organic Ingredients', 'Alpine Honey'],
      wellness: ['Essential Oils', 'Natural Wax'],
      books: ['Recycled Paper'],
      clothing: ['Organic Cotton', 'Wool']
    };
    
    return materials[category] || ['Natural Materials'];
  }

  static generateDimensions() {
    const dims = ['20cm x 30cm', '15cm diameter', '25cm x 35cm', '10cm x 20cm'];
    return dims[Math.floor(Math.random() * dims.length)];
  }

  static generateWeight() {
    const weights = ['200g', '500g', '1.2kg', '800g'];
    return weights[Math.floor(Math.random() * weights.length)];
  }

  static getCareInstructions(category) {
    const care = {
      textiles: 'Hand wash in cold water, lay flat to dry',
      ceramics: 'Dishwasher safe, avoid thermal shock',
      woodwork: 'Hand wash, oil monthly',
      jewelry: 'Clean with soft cloth',
      food: 'Store in cool, dry place',
      wellness: 'Keep away from direct sunlight',
      books: 'Keep in dry environment',
      clothing: 'Machine wash cold'
    };
    
    return care[category] || 'Handle with care';
  }

  static getTagsForCategory(category) {
    const tags = {
      textiles: ['handwoven', 'natural', 'cozy'],
      ceramics: ['handmade', 'unique', 'functional'],
      woodwork: ['sustainable', 'natural', 'handcrafted'],
      jewelry: ['handmade', 'elegant', 'alpine'],
      food: ['organic', 'local', 'traditional'],
      wellness: ['natural', 'relaxing', 'organic'],
      books: ['informative', 'cultural', 'local'],
      clothing: ['comfortable', 'stylish', 'natural']
    };
    
    return tags[category] || ['handmade', 'local'];
  }
}

export default ShopProduct;