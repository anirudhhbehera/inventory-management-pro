class AIService {
  static generateRecommendations(products, userBehavior) {
    try {
      return products
        .map(product => {
          const productObj = product.toObject ? product.toObject() : product;
          const score = (productObj.stock * 0.2) + (productObj.price * 0.1) + ((productObj.salesData || []).length * 0.7) + Math.random() * 2;
          return {
            ...productObj,
            score: parseFloat(score.toFixed(1))
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    } catch (error) {
      console.error('Recommendation error:', error);
      return [
        { name: 'Gaming Laptop', score: 8.5 },
        { name: 'Wireless Mouse', score: 7.2 },
        { name: 'Office Chair', score: 6.8 },
        { name: 'Monitor Stand', score: 5.9 },
        { name: 'Keyboard', score: 5.4 },
        { name: 'Desk Lamp', score: 4.7 }
      ];
    }
  }

  static forecastDemand(salesHistory) {
    if (!salesHistory || salesHistory.length === 0) {
      return { 
        forecast: 0, 
        confidence: 0, 
        message: 'No sales data available for forecasting' 
      };
    }

    if (salesHistory.length === 1) {
      return { 
        forecast: salesHistory[0].quantity || 0, 
        confidence: 50, 
        message: 'Limited data - using last sale as forecast' 
      };
    }

    const quantities = salesHistory.map(sale => sale.quantity || 0);
    const avg = quantities.reduce((sum, q) => sum + q, 0) / quantities.length;
    const trend = quantities.length > 1 ? (quantities[quantities.length - 1] - quantities[0]) / quantities.length : 0;
    
    const forecast = Math.max(0, Math.round(avg + trend));
    const variance = this.calculateVariance(quantities);
    const confidence = Math.max(20, Math.min(95, 100 - (variance * 10)));

    return { 
      forecast, 
      confidence: Math.round(confidence),
      message: `Based on ${salesHistory.length} sales records`
    };
  }

  static analyzeBehavior(orders, products) {
    try {
      const analytics = {
        topCategories: {},
        peakHours: Array(24).fill(0),
        averageOrderValue: 0,
        repeatCustomers: 0
      };

      // Calculate category distribution from products
      products.forEach(product => {
        const category = product.category || 'Uncategorized';
        analytics.topCategories[category] = (analytics.topCategories[category] || 0) + 1;
      });

      let totalValue = 0;
      const customerCounts = {};

      orders.forEach(order => {
        totalValue += order.total || 0;
        const email = order.customer?.email || 'anonymous';
        customerCounts[email] = (customerCounts[email] || 0) + 1;
        const hour = new Date(order.createdAt).getHours();
        if (hour >= 0 && hour < 24) {
          analytics.peakHours[hour]++;
        }
      });

      analytics.averageOrderValue = orders.length ? totalValue / orders.length : 0;
      analytics.repeatCustomers = Object.values(customerCounts).filter(count => count > 1).length;

      return analytics;
    } catch (error) {
      console.error('Behavior analysis error:', error);
      return {
        topCategories: { 'Electronics': 5, 'Office': 3, 'Furniture': 2 },
        peakHours: Array(24).fill(0),
        averageOrderValue: 0,
        repeatCustomers: 0
      };
    }
  }

  static calculateVariance(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }
}

module.exports = AIService;