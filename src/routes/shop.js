import express from 'express';
import ShopProduct from '../models/ShopProduct.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateTVOSKey } from '../middleware/tvosAuth.js';

const router = express.Router();

// MARK: - Web Management Routes

// Get all products for property (web management)
router.get('/property/:propertyId/products', authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { category, featured } = req.query;
    
    let products;
    
    if (featured === 'true') {
      products = await ShopProduct.findFeatured(propertyId);
    } else if (category) {
      products = await ShopProduct.findByCategory(propertyId, category);
    } else {
      products = await ShopProduct.findAll(propertyId);
    }
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching shop products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Get single product (web management)
router.get('/property/:propertyId/products/:productId', authenticateToken, async (req, res) => {
  try {
    const { propertyId, productId } = req.params;
    
    const product = await ShopProduct.findById(productId, propertyId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching shop product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

// Create new product (web management)
router.post('/property/:propertyId/products', authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const productData = { ...req.body, propertyId };
    
    const product = await ShopProduct.create(productData);
    
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating shop product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// Update product (web management)
router.put('/property/:propertyId/products/:productId', authenticateToken, async (req, res) => {
  try {
    const { propertyId, productId } = req.params;
    const productData = req.body;
    
    const product = await ShopProduct.update(productId, propertyId, productData);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating shop product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// Delete product (web management)
router.delete('/property/:propertyId/products/:productId', authenticateToken, async (req, res) => {
  try {
    const { propertyId, productId } = req.params;
    
    const deleted = await ShopProduct.delete(productId, propertyId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shop product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

// MARK: - tvOS API Routes

// Get all products for tvOS
router.get('/tvos/properties/:propertyId/products', validateTVOSKey, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { category, featured, limit = '40', offset = '0' } = req.query;
    
    let products;
    
    if (featured === 'true') {
      products = await ShopProduct.findFeatured(propertyId);
    } else if (category && category !== 'all') {
      products = await ShopProduct.findByCategory(propertyId, category);
    } else {
      products = await ShopProduct.findAll(propertyId);
    }
    
    // Apply pagination
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const paginatedProducts = products.slice(offsetNum, offsetNum + limitNum);
    
    res.json({
      success: true,
      data: paginatedProducts,
      total: products.length,
      limit: limitNum,
      offset: offsetNum
    });
  } catch (error) {
    console.error('Error fetching tvOS shop products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Get featured products for tvOS
router.get('/tvos/properties/:propertyId/products/featured', validateTVOSKey, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { limit = '5' } = req.query;
    
    const products = await ShopProduct.findFeatured(propertyId);
    const limitNum = parseInt(limit);
    const limitedProducts = products.slice(0, limitNum);
    
    res.json({
      success: true,
      data: limitedProducts
    });
  } catch (error) {
    console.error('Error fetching tvOS featured products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    });
  }
});

// Get products by category for tvOS
router.get('/tvos/properties/:propertyId/products/category/:category', validateTVOSKey, async (req, res) => {
  try {
    const { propertyId, category } = req.params;
    const { limit = '40', offset = '0' } = req.query;
    
    const products = await ShopProduct.findByCategory(propertyId, category);
    
    // Apply pagination
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const paginatedProducts = products.slice(offsetNum, offsetNum + limitNum);
    
    res.json({
      success: true,
      data: paginatedProducts,
      total: products.length,
      limit: limitNum,
      offset: offsetNum,
      category: category
    });
  } catch (error) {
    console.error('Error fetching tvOS products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products by category'
    });
  }
});

// Get single product for tvOS
router.get('/tvos/properties/:propertyId/products/:productId', validateTVOSKey, async (req, res) => {
  try {
    const { propertyId, productId } = req.params;
    
    const product = await ShopProduct.findById(productId, propertyId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching tvOS product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

// Get shop categories
router.get('/categories', (req, res) => {
  const categories = [
    { id: 'all', name: 'All Products', icon: 'square.grid.2x2' },
    { id: 'textiles', name: 'Textiles & Fabrics', icon: 'scissors' },
    { id: 'ceramics', name: 'Ceramics & Pottery', icon: 'cup.and.saucer' },
    { id: 'woodwork', name: 'Woodwork & Crafts', icon: 'hammer' },
    { id: 'jewelry', name: 'Jewelry & Accessories', icon: 'sparkles' },
    { id: 'food', name: 'Local Delicacies', icon: 'carrot' },
    { id: 'wellness', name: 'Wellness & Spa', icon: 'leaf.fill' },
    { id: 'books', name: 'Books & Guides', icon: 'book' },
    { id: 'clothing', name: 'Alpine Clothing', icon: 'tshirt' }
  ];
  
  res.json({
    success: true,
    data: categories
  });
});

export default router;