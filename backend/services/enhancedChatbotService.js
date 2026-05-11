const Product = require('../models/Product');
const Order = require('../models/Order');
const Supplier = require('../models/Supplier');
const ChatHistory = require('../models/ChatHistory');

class EnhancedChatbotService {
  async processQuery(userMessage) {
    const message = userMessage.toLowerCase().trim();
    let response = '';
    let queryType = 'general';
    
    try {
      // Dashboard & Analytics queries
      if (this.matchesKeywords(message, ['dashboard', 'overview', 'summary', 'stats', 'analytics'])) {
        response = await this.handleDashboardQuery();
        queryType = 'dashboard';
      }
      // Performance & insights
      else if (this.matchesKeywords(message, ['performance', 'insights', 'trends', 'analysis', 'report'])) {
        response = await this.handlePerformanceQuery();
        queryType = 'performance';
      }
      // Stock & inventory queries
      else if (this.matchesKeywords(message, ['stock', 'inventory', 'how many', 'how much', 'quantity'])) {
        response = await this.handleStockQuery(message);
        queryType = 'stock_query';
      }
      // Order queries
      else if (this.matchesKeywords(message, ['order', 'orders', 'sales', 'purchase', 'buy'])) {
        response = await this.handleOrderQuery(message);
        queryType = 'order_query';
      }
      // Revenue & financial queries
      else if (this.matchesKeywords(message, ['revenue', 'profit', 'earnings', 'money', 'income', 'financial'])) {
        response = await this.handleRevenueQuery();
        queryType = 'revenue_query';
      }
      // Customer queries
      else if (this.matchesKeywords(message, ['customer', 'client', 'buyer', 'user', 'retention'])) {
        response = await this.handleCustomerQuery();
        queryType = 'customer_query';
      }
      // Supplier queries
      else if (this.matchesKeywords(message, ['supplier', 'vendor', 'provider', 'delivery'])) {
        response = await this.handleSupplierQuery();
        queryType = 'supplier_query';
      }
      // Low stock alerts
      else if (this.matchesKeywords(message, ['low stock', 'running out', 'shortage', 'reorder', 'alert'])) {
        response = await this.handleLowStockQuery();
        queryType = 'low_stock';
      }
      // Product search
      else if (this.matchesKeywords(message, ['find', 'search', 'look for', 'show me', 'get'])) {
        response = await this.handleProductSearch(message);
        queryType = 'product_search';
      }
      // Forecasting & predictions
      else if (this.matchesKeywords(message, ['forecast', 'predict', 'future', 'demand', 'projection'])) {
        response = await this.handleForecastQuery();
        queryType = 'forecast';
      }
      // General help
      else {
        response = this.getEnhancedHelpMessage();
        queryType = 'help';
      }
      
      // Save to chat history
      await this.saveChatHistory(userMessage, response, queryType);
      
      return response;
      
    } catch (error) {
      console.error('AI Chat Assistant error:', error);
      const errorResponse = '🤖 I encountered an issue processing your request. Please try rephrasing or ask for help to see available commands.';
      await this.saveChatHistory(userMessage, errorResponse, 'error');
      return errorResponse;
    }
  }

  matchesKeywords(message, keywords) {
    return keywords.some(keyword => message.includes(keyword));
  }

  async handleDashboardQuery() {
    try {
      const [products, orders, suppliers] = await Promise.all([
        Product.find(),
        Order.find(),
        Supplier.find()
      ]);
      
      const totalProducts = products.length;
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      
      return `📊 **BUSINESS DASHBOARD OVERVIEW**

🏪 **INVENTORY STATUS**
• Total Products: ${totalProducts}
• Low Stock Alerts: ${lowStockCount} items
• Categories: ${[...new Set(products.map(p => p.category))].length}

📋 **ORDER METRICS**
• Total Orders: ${totalOrders}
• Pending Orders: ${pendingOrders}
• Completed Orders: ${orders.filter(o => o.status === 'delivered').length}

💰 **FINANCIAL SUMMARY**
• Total Revenue: $${totalRevenue.toFixed(2)}
• Average Order: $${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0'}
• Active Suppliers: ${suppliers.length}

🚨 **ALERTS**
${lowStockCount > 0 ? `⚠️ ${lowStockCount} products need restocking` : '✅ All products adequately stocked'}
${pendingOrders > 0 ? `📦 ${pendingOrders} orders awaiting processing` : '✅ No pending orders'}`;
    } catch (error) {
      return '📊 Unable to fetch dashboard data. Please try again.';
    }
  }

  async handlePerformanceQuery() {
    try {
      const [products, orders] = await Promise.all([
        Product.find(),
        Order.find()
      ]);
      
      const categoryStats = {};
      products.forEach(p => {
        if (!categoryStats[p.category]) {
          categoryStats[p.category] = { count: 0, totalValue: 0 };
        }
        categoryStats[p.category].count++;
        categoryStats[p.category].totalValue += p.price * p.stock;
      });
      
      const topCategory = Object.keys(categoryStats).reduce((a, b) => 
        categoryStats[a].count > categoryStats[b].count ? a : b
      );
      
      const recentOrders = orders.filter(o => 
        new Date(o.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      
      return `📈 **PERFORMANCE INSIGHTS**

🏆 **TOP PERFORMERS**
• Leading Category: ${topCategory} (${categoryStats[topCategory]?.count} products)
• Weekly Orders: ${recentOrders.length}
• Growth Trend: ${recentOrders.length > 5 ? '📈 Strong' : '📊 Steady'}

💡 **AI RECOMMENDATIONS**
• Focus on ${topCategory} category expansion
• ${recentOrders.length < 3 ? 'Consider marketing campaigns' : 'Maintain current momentum'}
• Monitor inventory levels for peak demand

🎯 **KEY METRICS**
• Order Velocity: ${(recentOrders.length / 7).toFixed(1)} orders/day
• Category Diversity: ${Object.keys(categoryStats).length} active categories
• Inventory Health: ${products.filter(p => p.stock > p.minStock).length}/${products.length} products well-stocked`;
    } catch (error) {
      return '📈 Unable to generate performance insights. Please try again.';
    }
  }

  async handleCustomerQuery() {
    try {
      const orders = await Order.find();
      const customers = new Set(orders.map(o => o.customer?.email)).size;
      const customerOrderCounts = {};
      
      orders.forEach(order => {
        const email = order.customer?.email || 'anonymous';
        customerOrderCounts[email] = (customerOrderCounts[email] || 0) + 1;
      });
      
      const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
      const retentionRate = customers > 0 ? (repeatCustomers / customers * 100).toFixed(1) : 0;
      
      const hourCounts = Array(24).fill(0);
      orders.forEach(order => {
        const hour = new Date(order.createdAt).getHours();
        hourCounts[hour]++;
      });
      const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
      
      return `👥 **CUSTOMER INTELLIGENCE**

📊 **CUSTOMER BASE**
• Total Customers: ${customers}
• Repeat Customers: ${repeatCustomers}
• Retention Rate: ${retentionRate}%
• Customer Loyalty: ${retentionRate > 30 ? '🟢 Excellent' : retentionRate > 15 ? '🟡 Good' : '🔴 Needs Improvement'}

⏰ **BEHAVIOR PATTERNS**
• Peak Order Time: ${peakHour}:00
• Average Orders/Customer: ${(orders.length / Math.max(customers, 1)).toFixed(1)}
• Order Frequency: ${orders.length > customers * 2 ? 'High' : 'Moderate'}

💡 **RECOMMENDATIONS**
• ${retentionRate < 20 ? 'Implement loyalty programs' : 'Maintain customer satisfaction'}
• Target promotions around ${peakHour}:00
• ${customers - repeatCustomers > 0 ? `Convert ${customers - repeatCustomers} one-time buyers` : 'Focus on acquisition'}`;
    } catch (error) {
      return '👥 Unable to analyze customer data. Please try again.';
    }
  }

  async handleForecastQuery() {
    try {
      const [products, orders] = await Promise.all([
        Product.find(),
        Order.find().sort({ createdAt: -1 }).limit(30)
      ]);
      
      const recentOrders = orders.filter(o => 
        new Date(o.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      
      const weeklyTrend = recentOrders.length;
      const monthlyProjection = weeklyTrend * 4.3;
      const lowStockProducts = products.filter(p => p.stock <= p.minStock);
      
      return `🔮 **PREDICTIVE ANALYTICS**

📈 **DEMAND FORECAST**
• Weekly Orders: ${weeklyTrend}
• Monthly Projection: ${Math.round(monthlyProjection)} orders
• Trend Direction: ${weeklyTrend > 10 ? '📈 Growing' : weeklyTrend > 5 ? '📊 Stable' : '📉 Declining'}

⚠️ **INVENTORY PREDICTIONS**
• Products at Risk: ${lowStockProducts.length}
• Reorder Priority: ${lowStockProducts.slice(0, 3).map(p => p.name).join(', ')}
• Stock Health: ${((products.length - lowStockProducts.length) / products.length * 100).toFixed(1)}%

🎯 **STRATEGIC INSIGHTS**
• ${weeklyTrend > 15 ? 'Prepare for high demand period' : 'Standard inventory management'}
• ${lowStockProducts.length > 5 ? 'Urgent restocking needed' : 'Inventory levels stable'}
• Recommended Action: ${weeklyTrend > 10 ? 'Scale up operations' : 'Optimize current processes'}`;
    } catch (error) {
      return '🔮 Unable to generate forecasts. Please try again.';
    }
  }

  async handleStockQuery(message) {
    const words = message.split(' ');
    let productName = '';
    
    const productKeywords = ['computer', 'laptop', 'mouse', 'keyboard', 'monitor', 'chair', 'mug'];
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
        return `📦 Found ${products.length} product(s) matching "${productName}": ${productList}. Total stock: ${totalStock} units.`;
      } else {
        return `❌ No products found matching "${productName}". Try: laptop, mouse, keyboard, chair, etc.`;
      }
    } else {
      const totalProducts = await Product.countDocuments();
      const totalStock = await Product.aggregate([
        { $group: { _id: null, total: { $sum: '$stock' } } }
      ]);
      return `📊 Total products in inventory: ${totalProducts}. Total stock units: ${totalStock[0]?.total || 0}.`;
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
      return `📅 Today's orders: ${todayOrders.length} orders with total value of $${todayOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}.`;
    } else {
      const orderList = recentOrders.map(order => 
        `Order ${order.orderNumber}: $${order.total} (${order.status})`
      ).join(', ');
      return `📋 Recent orders: ${orderList}`;
    }
  }

  async handleLowStockQuery() {
    const lowStockProducts = await Product.find({
      $expr: { $lt: ['$stock', '$minStock'] }
    });
    
    if (lowStockProducts.length === 0) {
      return '✅ Great news! No products are currently low on stock.';
    }
    
    const productList = lowStockProducts.map(p => 
      `${p.name}: ${p.stock}/${p.minStock} units`
    ).join(', ');
    
    return `⚠️ ${lowStockProducts.length} products are low on stock: ${productList}`;
  }

  async handleProductSearch(message) {
    const searchTerm = message.replace(/find|search|show me|get|look for/g, '').trim();
    const products = await Product.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { sku: { $regex: searchTerm, $options: 'i' } }
      ]
    }).limit(5);
    
    if (products.length === 0) {
      return `❌ No products found for "${searchTerm}".`;
    }
    
    const productList = products.map(p => 
      `${p.name} (${p.sku}): $${p.price}, Stock: ${p.stock}`
    ).join('; ');
    
    return `🔍 Found ${products.length} product(s): ${productList}`;
  }

  async handleRevenueQuery() {
    const orders = await Order.find({ status: { $ne: 'cancelled' } });
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = orders
      .filter(order => order.createdAt >= today)
      .reduce((sum, order) => sum + order.total, 0);
    
    return `💰 Total revenue: $${totalRevenue.toFixed(2)}. Today's revenue: $${todayRevenue.toFixed(2)}.`;
  }

  async handleSupplierQuery() {
    const suppliers = await Supplier.find().populate('products');
    const supplierList = suppliers.map(s => 
      `${s.name}: ${s.products?.length || 0} products, Rating: ${s.rating}/5`
    ).join('; ');
    
    return `🏢 We have ${suppliers.length} suppliers: ${supplierList}`;
  }

  getEnhancedHelpMessage() {
    return `🤖 **AI CHAT ASSISTANT** - Your Smart Business Intelligence Companion

📊 **DASHBOARD & ANALYTICS**
• "Show dashboard" - Complete business overview
• "Performance report" - Key metrics analysis
• "Business insights" - AI-powered recommendations

📦 **INVENTORY MANAGEMENT**
• "Stock levels" - Current inventory status
• "Low stock alerts" - Items needing reorder
• "Find electronics" - Category search
• "How many laptops?" - Product quantities

💰 **FINANCIAL INSIGHTS**
• "Total revenue" - Revenue analysis
• "Today's earnings" - Daily performance
• "Profit analysis" - Financial metrics

👥 **CUSTOMER INTELLIGENCE**
• "Customer behavior" - Purchase patterns
• "Retention rate" - Loyalty analysis
• "Peak hours" - Optimal business times

🚚 **SUPPLIER ANALYTICS**
• "Supplier performance" - Vendor analysis
• "Delivery metrics" - Logistics insights

🔮 **PREDICTIVE ANALYTICS**
• "Demand forecast" - Future predictions
• "Trend analysis" - Market insights

💡 **QUICK COMMANDS**
• "What's trending?" • "Show alerts" • "Best sellers"
• "Revenue today" • "Customer stats" • "Inventory health"

Just ask naturally - I understand context and provide intelligent responses! 🚀`;
  }

  async saveChatHistory(userMessage, botResponse, queryType) {
    try {
      await ChatHistory.create({
        userMessage,
        botResponse,
        queryType,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  async getChatHistory(limit = 50) {
    try {
      return await ChatHistory.find()
        .sort({ timestamp: -1 })
        .limit(limit);
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  async clearChatHistory() {
    try {
      await ChatHistory.deleteMany({});
      return '🗑️ Chat history cleared successfully! Ready for fresh conversations.';
    } catch (error) {
      console.error('Error clearing chat history:', error);
      return '❌ Error clearing chat history. Please try again.';
    }
  }
}

module.exports = new EnhancedChatbotService();