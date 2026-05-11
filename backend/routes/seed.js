const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Supplier = require('../models/Supplier');
const router = express.Router();

// Seed sample data
router.post('/sample-data', async (req, res) => {
  try {
    // Clear existing data
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Supplier.deleteMany({});

    // Create sample suppliers
    const supplier1 = await Supplier.create({
      name: 'Tech Supplies Co',
      email: 'contact@techsupplies.com',
      phone: '123-456-7890',
      address: '123 Tech Street'
    });

    // Create sample products
    const products = await Product.create([
      {
        name: 'Laptop Pro',
        sku: 'LP001',
        category: 'Electronics',
        price: 1200,
        cost: 800,
        stock: 50,
        minStock: 10,
        supplier: supplier1._id,
        viewCount: 25,
        salesData: [
          { date: new Date(), quantity: 5, revenue: 6000 },
          { date: new Date(Date.now() - 86400000), quantity: 3, revenue: 3600 }
        ]
      },
      {
        name: 'Wireless Mouse',
        sku: 'WM001',
        category: 'Electronics',
        price: 25,
        cost: 15,
        stock: 100,
        minStock: 20,
        supplier: supplier1._id,
        viewCount: 45,
        salesData: [
          { date: new Date(), quantity: 10, revenue: 250 }
        ]
      },
      {
        name: 'Gaming Keyboard',
        sku: 'GK001',
        category: 'Electronics',
        price: 150,
        cost: 100,
        stock: 30,
        minStock: 5,
        supplier: supplier1._id,
        viewCount: 35,
        salesData: [
          { date: new Date(), quantity: 8, revenue: 1200 }
        ]
      },
      {
        name: 'Office Chair',
        sku: 'OC001',
        category: 'Furniture',
        price: 300,
        cost: 200,
        stock: 15,
        minStock: 3,
        supplier: supplier1._id,
        viewCount: 20,
        salesData: [
          { date: new Date(), quantity: 2, revenue: 600 }
        ]
      },
      {
        name: 'Coffee Mug',
        sku: 'CM001',
        category: 'Kitchen',
        price: 15,
        cost: 8,
        stock: 200,
        minStock: 50,
        supplier: supplier1._id,
        viewCount: 60,
        salesData: [
          { date: new Date(), quantity: 15, revenue: 225 }
        ]
      }
    ]);

    // Create sample orders with multiple products
    const sampleOrders = [];
    
    // Create orders for the past 30 days
    for (let i = 0; i < 15; i++) {
      const orderDate = new Date(Date.now() - (i * 2 * 24 * 60 * 60 * 1000)); // Every 2 days
      
      sampleOrders.push({
        orderNumber: 'ORD' + (Date.now() + i),
        customer: {
          name: `Customer ${i + 1}`,
          email: `customer${i + 1}@example.com`,
          phone: '555-0123',
          address: '456 Main St'
        },
        items: [
          { product: products[Math.floor(Math.random() * products.length)]._id, quantity: Math.floor(Math.random() * 5) + 1, price: 25 },
          { product: products[Math.floor(Math.random() * products.length)]._id, quantity: Math.floor(Math.random() * 3) + 1, price: 150 }
        ],
        total: Math.floor(Math.random() * 500) + 100,
        status: ['delivered', 'shipped', 'processing'][Math.floor(Math.random() * 3)],
        createdAt: orderDate
      });
    }
    
    await Order.create(sampleOrders);

    res.json({ message: 'Sample data created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;