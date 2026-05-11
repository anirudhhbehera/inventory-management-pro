const Product = require('../models/Product');
const Order = require('../models/Order');

class CustomerChatbotService {
  async processCustomerQuery(userMessage, userId) {
    const message = userMessage.toLowerCase();
    
    try {
      // Greetings and casual conversation
      if (this.isGreeting(message)) {
        return await this.handleGreeting();
      }
      
      // Casual responses
      if (this.isCasualChat(message)) {
        return await this.handleCasualChat(message);
      }
      
      // Trending products
      if (message.includes('trending') || message.includes('popular') || message.includes('hot')) {
        return await this.handleTrendingQuery();
      }
      
      // Product search
      if (message.includes('find') || message.includes('search') || message.includes('looking for') || message.includes('need') || message.includes('want')) {
        return await this.handleProductSearch(message);
      }
      
      // Price queries
      if (message.includes('under') || message.includes('below') || message.includes('cheap') || message.includes('budget') || message.includes('$')) {
        return await this.handlePriceQuery(message);
      }
      
      // Category queries
      if (message.includes('electronics') || message.includes('computers') || message.includes('laptop') || message.includes('phone')) {
        return await this.handleCategoryQuery(message);
      }
      
      // Deals
      if (message.includes('deal') || message.includes('discount') || message.includes('sale') || message.includes('offer')) {
        return await this.handleDealsQuery();
      }
      
      // Recommendations
      if (message.includes('recommend') || message.includes('suggest') || message.includes('best') || message.includes('good')) {
        return await this.handleRecommendations(message);
      }
      
      // Default friendly response
      return await this.handleDefault(message);
      
    } catch (error) {
      console.error('Customer chatbot error:', error);
      return {
        botResponse: 'Oops! Something went wrong on my end. Let me try again! 😅',
        recommendedProducts: []
      };
    }
  }
  
  isGreeting(message) {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy'];
    return greetings.some(greeting => message.includes(greeting));
  }
  
  isCasualChat(message) {
    const casual = ['how are you', 'what\'s up', 'how\'s it going', 'thanks', 'thank you', 'bye', 'goodbye'];
    return casual.some(phrase => message.includes(phrase));
  }

  async handleGreeting() {
    const greetings = [
      'Hey there! 👋 Welcome to our store! I\'m here to help you find amazing products!',
      'Hello! 😊 Great to see you! What can I help you discover today?',
      'Hi! 🛍️ Ready to find something awesome? I\'ve got some great recommendations!'
    ];
    
    const products = await Product.find({ stock: { $gt: 0 } }).limit(4);
    
    return {
      botResponse: greetings[Math.floor(Math.random() * greetings.length)],
      recommendedProducts: products
    };
  }
  
  async handleCasualChat(message) {
    if (message.includes('how are you')) {
      return {
        botResponse: 'I\'m doing great, thanks for asking! 😊 I\'m excited to help you find some amazing products today! What are you in the mood for?',
        recommendedProducts: await Product.find({ stock: { $gt: 0 } }).limit(3)
      };
    }
    
    if (message.includes('thank')) {
      return {
        botResponse: 'You\'re so welcome! 🤗 I love helping customers like you! Need anything else?',
        recommendedProducts: []
      };
    }
    
    if (message.includes('bye') || message.includes('goodbye')) {
      return {
        botResponse: 'Goodbye! 👋 Thanks for chatting with me! Come back anytime - I\'ll be here to help! 😊',
        recommendedProducts: []
      };
    }
    
    return {
      botResponse: 'That\'s awesome! 😄 So, what brings you to our store today? Looking for anything specific?',
      recommendedProducts: await Product.find({ stock: { $gt: 0 } }).limit(3)
    };
  }
  
  async handleTrendingQuery() {
    const trendingProducts = await Product.find({ stock: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(6);
    
    const responses = [
      'Oh, you want to see what\'s hot right now? 🔥 Great choice! Here are the products everyone\'s talking about:',
      'Perfect timing! 🌟 These are absolutely flying off our shelves right now:',
      'You\'ve got great taste! 😍 Here are today\'s most popular picks:'
    ];
    
    return {
      botResponse: responses[Math.floor(Math.random() * responses.length)],
      recommendedProducts: trendingProducts
    };
  }

  async handleProductSearch(message) {
    const searchTerms = message.replace(/find|search|looking for|show me|need|want|get me/g, '').trim();
    
    const products = await Product.find({
      $and: [
        { stock: { $gt: 0 } },
        {
          $or: [
            { name: { $regex: searchTerms, $options: 'i' } },
            { category: { $regex: searchTerms, $options: 'i' } }
          ]
        }
      ]
    }).limit(8);
    
    if (products.length === 0) {
      const alternatives = await Product.find({ stock: { $gt: 0 } }).limit(4);
      
      const responses = [
        `Hmm, I couldn\'t find "${searchTerms}" but don\'t worry! 😊 Let me show you some popular items that might catch your eye:`,
        `No exact matches for "${searchTerms}", but I\'ve got some amazing alternatives! 🌟 Check these out:`,
        `Oops! "${searchTerms}" isn\'t available right now, but these might be even better! 💫`
      ];
      
      return {
        botResponse: responses[Math.floor(Math.random() * responses.length)],
        recommendedProducts: alternatives
      };
    }
    
    const responses = [
      `Perfect! 🎯 I found some great ${searchTerms} options for you:`,
      `Awesome choice! 😍 Here are the best ${searchTerms} we have:`,
      `You\'re in luck! 🍀 We have amazing ${searchTerms} in stock:`
    ];
    
    return {
      botResponse: responses[Math.floor(Math.random() * responses.length)],
      recommendedProducts: products
    };
  }

  async handlePriceQuery(message) {
    const priceMatch = message.match(/\$?(\d+)/);
    const maxPrice = priceMatch ? parseInt(priceMatch[1]) : 100;
    
    const products = await Product.find({
      $and: [
        { stock: { $gt: 0 } },
        { price: { $lte: maxPrice } }
      ]
    }).sort({ price: 1 }).limit(8);
    
    if (products.length === 0) {
      return {
        botResponse: `Hmm, nothing under $${maxPrice} right now, but don\'t worry! 😊 Let me show you our best budget-friendly options:`,
        recommendedProducts: await Product.find({ stock: { $gt: 0 } }).sort({ price: 1 }).limit(4)
      };
    }
    
    const responses = [
      `Great budget! 💰 I found some amazing deals under $${maxPrice} that won\'t break the bank:`,
      `Smart shopping! 😎 Here are fantastic products under $${maxPrice}:`,
      `Perfect! 🎯 These under $${maxPrice} are total steals:`
    ];
    
    return {
      botResponse: responses[Math.floor(Math.random() * responses.length)],
      recommendedProducts: products
    };
  }

  async handleCategoryQuery(message) {
    let category = '';
    if (message.includes('electronics')) category = 'Electronics';
    else if (message.includes('computers')) category = 'Computers';
    else if (message.includes('accessories')) category = 'Accessories';
    
    const products = await Product.find({
      $and: [
        { stock: { $gt: 0 } },
        { category: { $regex: category, $options: 'i' } }
      ]
    }).limit(8);
    
    if (products.length === 0) {
      return {
        botResponse: `We don't have ${category} in stock right now, but here are some similar products you might like! 🔄`,
        recommendedProducts: await Product.find({ stock: { $gt: 0 } }).limit(4)
      };
    }
    
    const productList = products.slice(0, 3).map(p => 
      `📱 ${p.name} - $${p.price}`
    ).join('\n');
    
    return {
      botResponse: `Here's our ${category} collection:\n\n${productList}\n\n🛍️ We have ${products.length} items in this category!`,
      recommendedProducts: products
    };
  }

  async handleDealsQuery() {
    const deals = await Product.find({ stock: { $gt: 0 } })
      .sort({ price: 1 })
      .limit(8);
    
    const responses = [
      'You\'re a smart shopper! 😎 I\'ve got some incredible deals that\'ll make you smile:',
      'Deal hunter, I like that! 🎯 Here are today\'s hottest bargains:',
      'Perfect timing! 🔥 These deals are absolutely amazing right now:'
    ];
    
    return {
      botResponse: responses[Math.floor(Math.random() * responses.length)],
      recommendedProducts: deals
    };
  }

  async handleTopRatedQuery() {
    // Get products with higher stock (assuming popular = top rated)
    const topProducts = await Product.find({ stock: { $gt: 0 } })
      .sort({ stock: -1, createdAt: -1 })
      .limit(8);
    
    const topList = topProducts.slice(0, 3).map(p => 
      `⭐ ${p.name} - $${p.price} (Highly Recommended)`
    ).join('\n');
    
    return {
      botResponse: `⭐ Here are our top-rated products:\n\n${topList}\n\n👥 These are customer favorites with excellent reviews!`,
      recommendedProducts: topProducts
    };
  }

  async handleOrderStatus(userId) {
    const recentOrders = await Order.find({ customer: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('items.product');
    
    if (recentOrders.length === 0) {
      return {
        botResponse: `You don't have any orders yet! 🛒 Ready to start shopping? Let me show you some great products!`,
        recommendedProducts: await Product.find({ stock: { $gt: 0 } }).limit(4)
      };
    }
    
    const orderList = recentOrders.map(order => 
      `📦 Order #${order.orderNumber}: ${order.status} - $${order.total}`
    ).join('\n');
    
    return {
      botResponse: `Here are your recent orders:\n\n${orderList}\n\n📱 You can track your orders in the "My Orders" tab!`,
      recommendedProducts: []
    };
  }

  async handleRecommendations(message) {
    const products = await Product.find({ stock: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(6);
    
    const responses = [
      'I\'d love to help you pick something amazing! 🌟 Based on what\'s popular, here are my top recommendations:',
      'Great question! 😊 I\'ve got some fantastic suggestions that I think you\'ll love:',
      'You came to the right person! 💫 Here are some products I personally recommend:'
    ];
    
    return {
      botResponse: responses[Math.floor(Math.random() * responses.length)],
      recommendedProducts: products
    };
  }
  
  async handleDefault(message) {
    const products = await Product.find({ stock: { $gt: 0 } }).limit(4);
    
    const responses = [
      'That\'s interesting! 🤔 Let me help you find something great. What kind of products are you looking for?',
      'I\'m here to help! 😊 Are you looking for something specific, or would you like me to show you what\'s popular?',
      'Tell me more! 💭 What can I help you discover today? I\'ve got tons of amazing products to show you!',
      'I love chatting with customers! 🗨️ What brings you here today? Looking for deals, new arrivals, or something specific?'
    ];
    
    return {
      botResponse: responses[Math.floor(Math.random() * responses.length)],
      recommendedProducts: products
    };
  }

  async handleCategoryQuery(message) {
    let category = '';
    if (message.includes('electronics') || message.includes('electronic')) category = 'Electronics';
    else if (message.includes('computer') || message.includes('laptop')) category = 'Computers';
    else if (message.includes('phone') || message.includes('mobile')) category = 'Electronics';
    
    const products = await Product.find({
      $and: [
        { stock: { $gt: 0 } },
        { category: { $regex: category, $options: 'i' } }
      ]
    }).limit(8);
    
    if (products.length === 0) {
      return {
        botResponse: `Oops! We\'re out of ${category.toLowerCase()} right now 😅 But check out these awesome alternatives:`,
        recommendedProducts: await Product.find({ stock: { $gt: 0 } }).limit(4)
      };
    }
    
    const responses = [
      `Excellent choice! 📱 Our ${category.toLowerCase()} section is fantastic:`,
      `You\'ve got great taste! 😍 Here are our best ${category.toLowerCase()}:`,
      `Perfect! ✨ These ${category.toLowerCase()} are absolutely amazing:`
    ];
    
    return {
      botResponse: responses[Math.floor(Math.random() * responses.length)],
      recommendedProducts: products
    };
  }
}

module.exports = new CustomerChatbotService();