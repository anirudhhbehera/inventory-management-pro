const express = require('express');
const enhancedChatbotService = require('../services/enhancedChatbotService');
const customerChatbotService = require('../services/customerChatbotService');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Chat endpoint
router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.user;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    let response;
    
    // Use different chatbot services based on user role
    if (user.role === 'customer') {
      response = await customerChatbotService.processCustomerQuery(message, user.userId);
    } else {
      // Admin users get the enhanced chatbot
      const botResponse = await enhancedChatbotService.processQuery(message);
      response = { botResponse, recommendedProducts: [] };
    }
    
    res.json({
      userMessage: message,
      botResponse: response.botResponse,
      recommendedProducts: response.recommendedProducts || [],
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Customer-specific trending products endpoint
router.get('/trending', auth, async (req, res) => {
  try {
    const trendingProducts = await customerChatbotService.handleTrendingQuery();
    res.json(trendingProducts);
  } catch (error) {
    console.error('Trending products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;