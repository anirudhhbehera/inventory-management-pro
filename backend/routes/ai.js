const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Supplier = require('../models/Supplier');
const AIService = require('../services/aiService');
const GeminiService = require('../services/geminiService');
const router = express.Router();

// Get product recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const products = await Product.find();
    if (products.length === 0) {
      return res.json([]);
    }
    const recommendations = AIService.generateRecommendations(products);
    res.json(recommendations);
  } catch (error) {
    console.error('AI recommendations error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get demand forecast for a product
router.get('/forecast/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get actual sales data from orders
    const orders = await Order.find({
      'items.product': req.params.productId,
      status: { $in: ['delivered', 'shipped', 'processing'] }
    }).sort({ createdAt: -1 }).limit(30);
    
    // Extract sales data from orders
    const salesData = [];
    orders.forEach(order => {
      const item = order.items.find(item => item.product.toString() === req.params.productId);
      if (item) {
        salesData.push({
          date: order.createdAt,
          quantity: item.quantity,
          revenue: item.price * item.quantity
        });
      }
    });
    
    const forecast = AIService.forecastDemand(salesData);
    
    res.json({
      ...forecast,
      productName: product.name,
      currentStock: product.stock,
      salesHistory: salesData.length,
      totalSold: salesData.reduce((sum, sale) => sum + sale.quantity, 0)
    });
  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get behavioral analytics
router.get('/analytics', async (req, res) => {
  try {
    const orders = await Order.find();
    const products = await Product.find();
    const analytics = AIService.analyzeBehavior(orders, products);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Gemini AI insights
router.get('/gemini-insights', async (req, res) => {
  try {
    const products = await Product.find();
    const orders = await Order.find().sort({ createdAt: -1 });
    const insights = await GeminiService.generateInventoryInsights(products, orders);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate product description
router.post('/generate-description', async (req, res) => {
  try {
    const { name, category } = req.body;
    const description = await GeminiService.generateProductDescription(name, category);
    res.json({ description });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get customer behavior analysis
router.get('/customer-behavior', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    const behavior = await GeminiService.analyzeCustomerBehavior(orders);
    res.json(behavior);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get supplier recommendations
router.get('/supplier-recommendations', async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    const products = await Product.find();
    const recommendations = await GeminiService.generateSupplierRecommendations(suppliers, products);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;