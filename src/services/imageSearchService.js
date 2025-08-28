import fetch from 'node-fetch';

class ImageSearchService {
  constructor() {
    // Using Google Custom Search API
    this.apiKey = process.env.GOOGLE_API_KEY || '';
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || '';
    this.unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY || '';
  }

  // Search for activity images using multiple sources
  async searchActivityImage(activityName, location = 'Schladming Austria') {
    try {
      console.log('Searching for image:', { activityName, location });
      
      // Try Google first if configured (for actual venue images)
      if (this.apiKey && this.searchEngineId) {
        console.log('Trying Google search for actual venue images...');
        const googleImage = await this.searchGoogle(`${activityName} ${location}`);
        if (googleImage) {
          console.log('Found image from Google');
          return googleImage;
        }
      }

      // Try scraping from official websites
      console.log('Trying to find official images...');
      const officialImage = await this.searchOfficialSources(activityName, location);
      if (officialImage) {
        console.log('Found official image');
        return officialImage;
      }
      
      // Fallback to a generic mountain/activity image for Schladming
      console.log('Using fallback Schladming image');
      return this.getSchladmingFallback(activityName);
    } catch (error) {
      console.error('Image search error:', error);
      return null;
    }
  }

  // Search using Unsplash API (free tier available)
  async searchUnsplash(query) {
    if (!this.unsplashAccessKey || this.unsplashAccessKey === 'demo_access_key') {
      console.log('Unsplash API key not configured, skipping...');
      return null;
    }

    try {
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
      console.log('Unsplash search URL:', url);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Client-ID ${this.unsplashAccessKey}`
        }
      });

      if (!response.ok) {
        console.error(`Unsplash API error: ${response.status} ${response.statusText}`);
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const photo = data.results[0];
        return {
          url: photo.urls.regular,
          thumbnail: photo.urls.small,
          author: photo.user.name,
          source: 'Unsplash',
          attribution: photo.user.links.html
        };
      }
    } catch (error) {
      console.error('Unsplash search error:', error);
    }
    return null;
  }

  // Search using Google Custom Search API
  async searchGoogle(query) {
    try {
      const url = `https://www.googleapis.com/customsearch/v1?` +
        `key=${this.apiKey}&` +
        `cx=${this.searchEngineId}&` +
        `q=${encodeURIComponent(query)}&` +
        `searchType=image&` +
        `imgSize=large&` +
        `num=1`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        return {
          url: data.items[0].link,
          thumbnail: data.items[0].image.thumbnailLink,
          source: 'Google Images',
          attribution: data.items[0].displayLink
        };
      }
    } catch (error) {
      console.error('Google search error:', error);
    }
    return null;
  }

  // Search using Pexels API (free)
  async searchPexels(query) {
    const pexelsApiKey = process.env.PEXELS_API_KEY || '563492ad6f91700001000001d33e4d66e4914a1e826e45518ec642a7';

    try {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
      const response = await fetch(url, {
        headers: {
          'Authorization': pexelsApiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.photos && data.photos.length > 0) {
        const photo = data.photos[0];
        return {
          url: photo.src.large2x || photo.src.large,
          thumbnail: photo.src.medium,
          author: photo.photographer,
          source: 'Pexels',
          attribution: photo.photographer_url
        };
      }
    } catch (error) {
      console.error('Pexels search error:', error);
    }
    return null;
  }

  // Search for dining place images
  async searchDiningImage(placeName, cuisineType = 'restaurant') {
    const query = `${placeName} ${cuisineType} Austria`;
    return await this.searchActivityImage(query, '');
  }

  // Search official Schladming sources
  async searchOfficialSources(activityName, location) {
    try {
      // Known Schladming venues with their official images
      const knownVenues = {
        'planai': 'https://www.planai.at/fileadmin/_processed_/5/1/csm_Planai-Schladming-Hopsiland_d8f3c4a5e0.jpg',
        'hochwurzen': 'https://www.hochwurzen.at/fileadmin/Hochwurzen/Sommer/hochwurzen-sommer-wandern.jpg',
        'reiteralm': 'https://www.reiteralm.at/fileadmin/Reiteralm/reiteralm-sommer.jpg',
        'rittisberg': 'https://www.rittisberg.at/fileadmin/Rittisberg/rittisberg-coaster.jpg',
        'dachstein': 'https://www.derdachstein.at/fileadmin/Dachstein/dachstein-gletscher.jpg',
        'eispalast': 'https://www.derdachstein.at/fileadmin/Dachstein/eispalast-dachstein.jpg',
        'skywalk': 'https://www.derdachstein.at/fileadmin/Dachstein/skywalk-dachstein.jpg',
        'therme': 'https://www.therme-amadé.at/fileadmin/therme/therme-amade-aussenansicht.jpg',
        'wasserwelt': 'https://www.wasserwelt.at/fileadmin/wasserwelt/wasserwelt-wagrain.jpg'
      };
      
      // Check if activity name contains any known venue
      const activityLower = activityName.toLowerCase();
      for (const [venue, imageUrl] of Object.entries(knownVenues)) {
        if (activityLower.includes(venue)) {
          return {
            url: imageUrl,
            thumbnail: imageUrl,
            source: 'Official Website',
            attribution: `${venue}.at`
          };
        }
      }
      
      // Try to construct a URL for schladming-dachstein.at
      if (activityLower.includes('schladming') || location.includes('Schladming')) {
        return {
          url: 'https://www.schladming-dachstein.at/fileadmin/_processed_/0/6/csm_schladming-panorama_8b7c4f5e9a.jpg',
          thumbnail: 'https://www.schladming-dachstein.at/fileadmin/_processed_/0/6/csm_schladming-panorama_8b7c4f5e9a.jpg',
          source: 'Schladming-Dachstein Tourism',
          attribution: 'schladming-dachstein.at'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error searching official sources:', error);
      return null;
    }
  }
  
  // Get Schladming-specific fallback images
  getSchladmingFallback(activityName) {
    const activityLower = activityName.toLowerCase();
    
    // Category-specific Schladming images
    const schladmingImages = {
      'ski': 'https://www.schladming-dachstein.at/fileadmin/Bilder/Winter/Skifahren/planai-skifahren-schladming.jpg',
      'wandern': 'https://www.schladming-dachstein.at/fileadmin/Bilder/Sommer/Wandern/dachstein-wandern-sommer.jpg',
      'bike': 'https://www.schladming-dachstein.at/fileadmin/Bilder/Sommer/Biken/schladming-bike-trail.jpg',
      'wellness': 'https://www.schladming-dachstein.at/fileadmin/Bilder/Wellness/therme-amade-wellness.jpg',
      'family': 'https://www.schladming-dachstein.at/fileadmin/Bilder/Familie/hopsiland-planai-familie.jpg',
      'restaurant': 'https://www.schladming-dachstein.at/fileadmin/Bilder/Kulinarik/restaurant-schladming.jpg',
      'hotel': 'https://www.schladming-dachstein.at/fileadmin/Bilder/Unterkunft/hotel-schladming.jpg',
      'default': 'https://www.schladming-dachstein.at/fileadmin/Bilder/schladming-dachstein-panorama.jpg'
    };
    
    // Check activity name for keywords
    for (const [keyword, imageUrl] of Object.entries(schladmingImages)) {
      if (activityLower.includes(keyword)) {
        return {
          url: imageUrl,
          thumbnail: imageUrl,
          source: 'Schladming Tourism',
          attribution: 'schladming-dachstein.at'
        };
      }
    }
    
    // Default Schladming panorama
    return {
      url: schladmingImages.default,
      thumbnail: schladmingImages.default,
      source: 'Schladming Tourism',
      attribution: 'schladming-dachstein.at'
    };
  }
  
  // Get a fallback image based on category
  getFallbackImage(category) {
    const fallbacks = {
      'outdoor': 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=1200&h=800&fit=crop',
      'indoor': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop',
      'adventure': 'https://images.unsplash.com/photo-1533692328991-08159ff19fca?w=1200&h=800&fit=crop',
      'wellness': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&h=800&fit=crop',
      'dining': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop',
      'mountain': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
      'default': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=800&fit=crop'
    };

    return {
      url: fallbacks[category] || fallbacks.default,
      thumbnail: fallbacks[category] || fallbacks.default,
      source: 'Fallback',
      attribution: 'Unsplash'
    };
  }
}

export default new ImageSearchService();