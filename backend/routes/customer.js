const express = require('express');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const SmartSearchService = require('../services/smartSearchService');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get products with filters (public)
router.get('/products', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, sort, page = 1, limit = 12 } = req.query;
    
    let products = [];
    
    // Use smart search if search query exists
    if (search && search.trim()) {
      products = await SmartSearchService.intelligentSearch(search);
      
      // Apply additional filters to smart search results
      if (category) {
        products = products.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
      }
      if (minPrice) {
        products = products.filter(p => p.price >= Number(minPrice));
      }
      if (maxPrice) {
        products = products.filter(p => p.price <= Number(maxPrice));
      }
    } else {
      // Regular filtering
      let query = { stock: { $gt: 0 } };
      
      if (category) query.category = { $regex: category, $options: 'i' };
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }
      
      products = await Product.find(query);
    }
    
    // Apply sorting
    switch (sort) {
      case 'price_low': products.sort((a, b) => a.price - b.price); break;
      case 'price_high': products.sort((a, b) => b.price - a.price); break;
      case 'name': products.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    // Pagination
    const total = products.length;
    const startIndex = (page - 1) * limit;
    const paginatedProducts = products.slice(startIndex, startIndex + limit);
    
    const categories = await Product.distinct('category');
    
    res.json({
      products: paginatedProducts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      categories,
      isSmartSearch: !!(search && search.trim())
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Smart search suggestions
router.get('/search-suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    const suggestions = await SmartSearchService.getSearchSuggestions(q);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Increment view count
    await Product.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to cart
router.post('/cart/add', auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }
    
    const existingItem = cart.items.find(item => item.product.toString() === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }
    
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get cart
router.get('/cart', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    res.json(cart || { items: [], total: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update cart item
router.put('/cart/item/:productId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const item = cart.items.find(item => item.product.toString() === req.params.productId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    if (quantity <= 0) {
      cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
    } else {
      item.quantity = quantity;
    }
    
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Place order
router.post('/orders', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Check stock availability
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.product.name}` 
        });
      }
    }
    
    const order = new Order({
      orderNumber: 'ORD' + Date.now(),
      customer: {
        name: req.user.username,
        email: req.user.email,
        phone: req.user.phone,
        address: req.user.address
      },
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price
      })),
      total: cart.total,
      status: 'pending'
    });
    
    await order.save();
    
    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }
    
    // Clear cart
    await Cart.findOneAndDelete({ user: req.user._id });
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user orders
router.get('/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ 'customer.email': req.user.email })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;