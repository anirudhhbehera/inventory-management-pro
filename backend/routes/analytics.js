const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const lowStockProducts = await Product.countDocuments({ $expr: { $lt: ['$stock', '$minStock'] } });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
    const topProducts = await Product.find().sort({ viewCount: -1 }).limit(5);
    
    res.json({
      totalProducts,
      totalOrders,
      lowStockProducts,
      pendingOrders,
      recentOrders,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;