const Product = require('../models/Product');
const Order = require('../models/Order');
const Supplier = require('../models/Supplier');

class ChatbotService {
  async processQuery(userMessage) {
    const message = userMessage.toLowerCase();
    
    try {
      // Stock quantity queries
      if (message.includes('how many') || message.includes('how much') || message.includes('stock')) {
        return await this.handleStockQuery(message);
      }
      
      // Order queries
      if (message.includes('order') && (message.includes('today') || message.includes('recent'))) {
        return await this.handleOrderQuery(message);
      }
      
      // Low stock alerts
      if (message.includes('low stock') || message.includes('running out')) {
        return await this.handleLowStockQuery();
      }
      
      // Product search
      if (message.includes('find') || message.includes('search')) {
        return await this.handleProductSearch(message);
      }
      
      // Revenue queries
      if (message.includes('revenue') || message.includes('sales') || message.includes('earnings')) {
        return await this.handleRevenueQuery();
      }
      
      // Supplier queries
      if (message.includes('supplier')) {
        return await this.handleSupplierQuery();
      }
      
      // General help
      return this.getHelpMessage();
      
    } catch (error) {
      console.error('Chatbot error:', error);
      return 'Sorry, I encountered an error processing your request. Please try again.';
    }
  }

  async handleStockQuery(message) {
    // Extract product name from message
    const words = message.split(' ');
    let productName = '';
    
    // Look for product keywords
    const productKeywords = ['computer', 'laptop', 'mouse', 'keyboard', 'monitor'];
    for (const keyword of productKeywords) {
      if (message.includes(keyword)) {
        productName = keyword;
        break;
      }
    }
    
    if (productName) {
      const products = await Product.find({ 
        name: { $regex: productName, $options: 'i' } 
      });
      
      if (products.length > 0) {
        const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
        const productList = products.map(p => `${p.name}: ${p.stock} units`).join(', ');
        return `I found ${products.length} product(s) matching "${productName}": ${productList}. Total stock: ${totalStock} units.`;
      } else {
        return `No products found matching "${productName}". Try searching for: laptop, mouse, keyboard, etc.`;
      }
    } else {
      const totalProducts = await Product.countDocuments();
      const totalStock = await Product.aggregate([
        { $group: { _id: null, total: { $sum: '$stock' } } }
      ]);
      return `Total products in inventory: ${totalProducts}. Total stock units: ${totalStock[0]?.total || 0}.`;
    }
  }

  async handleOrderQuery(message) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = await Order.find({ 
      createdAt: { $gte: today } 
    });
    
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    if (message.includes('today')) {
      return `Today's orders: ${todayOrders.length} orders with total value of $${todayOrders.reduce((sum, order) => sum + order.total, 0)}.`;
    } else {
      const orderList = recentOrders.map(order => 
        `Order ${order.orderNumber}: $${order.total} (${order.status})`
      ).join(', ');
      return `Recent orders: ${orderList}`;
    }
  }

  async handleLowStockQuery() {
    const lowStockProducts = await Product.find({
      $expr: { $lt: ['$stock', '$minStock'] }
    });
    
    if (lowStockProducts.length === 0) {
      return 'Great news! No products are currently low on stock.';
    }
    
    const productList = lowStockProducts.map(p => 
      `${p.name}: ${p.stock}/${p.minStock} units`
    ).join(', ');
    
    return `⚠️ ${lowStockProducts.length} products are low on stock: ${productList}`;
  }

  async handleProductSearch(message) {
    const searchTerm = message.replace(/find|search/g, '').trim();
    const products = await Product.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { sku: { $regex: searchTerm, $options: 'i' } }
      ]
    }).limit(5);
    
    if (products.length === 0) {
      return `No products found for "${searchTerm}".`;
    }
    
    const productList = products.map(p => 
      `${p.name} (${p.sku}): $${p.price}, Stock: ${p.stock}`
    ).join('; ');
    
    return `Found ${products.length} product(s): ${productList}`;
  }

  async handleRevenueQuery() {
    const orders = await Order.find({ status: { $ne: 'cancelled' } });
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = orders
      .filter(order => order.createdAt >= today)
      .reduce((sum, order) => sum + order.total, 0);
    
    return `Total revenue: $${totalRevenue.toFixed(2)}. Today's revenue: $${todayRevenue.toFixed(2)}.`;
  }

  async handleSupplierQuery() {
    const suppliers = await Supplier.find().populate('products');
    const supplierList = suppliers.map(s => 
      `${s.name}: ${s.products?.length || 0} products, Rating: ${s.rating}/5`
    ).join('; ');
    
    return `We have ${suppliers.length} suppliers: ${supplierList}`;
  }

  getHelpMessage() {
    return `I can help you with:
    📦 Stock queries: "How many laptops are left?"
    📋 Orders: "Show today's orders"
    ⚠️ Alerts: "What's low on stock?"
    🔍 Search: "Find electronics"
    💰 Revenue: "What's our total sales?"
    🏢 Suppliers: "Show suppliers"
    
    Try asking me anything about your inventory!`;
  }
}

module.exports = new ChatbotService();