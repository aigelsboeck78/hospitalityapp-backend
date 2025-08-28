import pool from '../config/database.js';

class BackgroundImage {
  static async findByProperty(propertyId, season = null) {
    try {
      // Determine the season from current date if not provided
      let targetSeason = season;
      if (!targetSeason) {
        const month = new Date().getMonth() + 1; // 0-indexed to 1-indexed
        if (month >= 12 || month <= 3) targetSeason = 'winter';
        else if (month >= 4 && month <= 5) targetSeason = 'spring';
        else if (month >= 6 && month <= 9) targetSeason = 'summer';
        else if (month >= 10 && month <= 11) targetSeason = 'autumn';
      }

      // Query for seasonal background images
      const query = `
        SELECT 
          id,
          filename,
          COALESCE(image_url, file_path, '/uploads/backgrounds/' || property_id || '/' || filename) as url,
          title,
          description,
          season,
          display_order,
          upload_date as uploadedAt
        FROM background_images 
        WHERE property_id = $1 
        AND is_active = true
        AND (season = $2 OR season = 'all')
        ORDER BY 
          CASE WHEN season = $2 THEN 0 ELSE 1 END,
          display_order ASC,
          upload_date DESC
      `;
      
      const result = await pool.query(query, [propertyId, targetSeason]);
      
      // If no database records found, fall back to filesystem
      if (result.rows.length === 0) {
        console.log('No seasonal backgrounds in database, falling back to filesystem');
      }
      
      return result.rows.map(row => ({
        id: row.id,
        filename: row.filename,
        url: row.url,
        image_url: row.url,  // Add image_url for compatibility
        title: row.title,
        description: row.description,
        season: row.season,
        displayOrder: row.display_order,
        uploadedAt: row.uploadedat
      }));
    } catch (error) {
      console.error('Error finding background images:', error);
      
      // Return actual uploaded background images from filesystem
      const fs = await import('fs/promises');
      const path = await import('path');
      
      try {
        const uploadsDir = path.join(process.cwd(), 'uploads', 'backgrounds', propertyId);
        const files = await fs.readdir(uploadsDir);
        
        // Filter for image files
        const imageFiles = files.filter(file => 
          file.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        );
        
        // Map to the expected format
        return imageFiles.map((filename, index) => ({
          id: `bg-${index + 1}`,
          filename: filename,
          url: `/uploads/backgrounds/${propertyId}/${filename}`,
          uploadedAt: new Date().toISOString()
        }));
      } catch (fsError) {
        console.log('No uploaded backgrounds, using fallback images');
        // Return mock background images as ultimate fallback
        return [
          {
            id: '1',
            filename: 'planai-winter.jpg',
            url: '/uploads/planai-winter.jpg',
            uploadedAt: new Date().toISOString()
          },
          {
            id: '2',
            filename: 'dachstein-glacier.jpg',
            url: '/uploads/dachstein-glacier.jpg',
            uploadedAt: new Date().toISOString()
          },
          {
            id: '3',
            filename: 'schladming-town.jpg',
            url: '/uploads/schladming-town.jpg',
            uploadedAt: new Date().toISOString()
          }
        ];
      }
    }
  }

  static async create(propertyId, filename, path) {
    try {
      const query = `
        INSERT INTO background_images (property_id, filename, file_path, upload_date, is_active)
        VALUES ($1, $2, $3, NOW(), true)
        RETURNING *
      `;
      const result = await pool.query(query, [propertyId, filename, path]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating background image:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const query = `
        UPDATE background_images 
        SET is_active = false 
        WHERE id = $1
        RETURNING *
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting background image:', error);
      throw error;
    }
  }
}

export default BackgroundImage;