import React, { useState, useRef, useEffect } from 'react';
import {
  Fab, Dialog, DialogTitle, DialogContent, Box, Typography, TextField,
  IconButton, Avatar, List, ListItem, Paper, Chip, Slide, Zoom,
  CircularProgress, Card, CardContent, Button, Divider, Badge
} from '@mui/material';
import {
  SmartToy, Close, Send, TrendingUp, ShoppingCart, Search,
  Lightbulb, Star, LocalOffer, AutoAwesome, Recommend, Add, Remove
} from '@mui/icons-material';
import { chatbotAPI, customerAPI } from '../services/api';
import './AIFloatingHelper.css';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function AIFloatingHelper({ onAddToCart, cart, onUpdateCartItem }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [showTrending, setShowTrending] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      initializeChat();
      loadTrendingProducts();
    }
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = () => {
    const welcomeMessages = [
      'Hey there! 👋 I\'m your personal shopping buddy! What brings you here today?',
      'Hi! 😊 Welcome to our store! I\'m here to help you find amazing stuff. What are you looking for?',
      'Hello! 🛍️ Ready to discover some awesome products? I\'ve got great recommendations waiting for you!'
    ];
    
    const welcomeMessage = {
      type: 'bot',
      text: welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)],
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const loadTrendingProducts = async () => {
    try {
      const response = await customerAPI.getProducts({ sort: 'popular', limit: 4 });
      setTrendingProducts(response.data.products || []);
    } catch (error) {
      console.error('Error loading trending products:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setShowTrending(false);

    try {
      const response = await chatbotAPI.sendMessage(inputMessage);
      const botMessage = {
        type: 'bot',
        text: response.data.botResponse,
        timestamp: new Date(),
        products: response.data.recommendedProducts || []
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        type: 'bot',
        text: '😅 Sorry, I encountered an error. Please try again or ask me something else!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { text: 'What\'s trending? 🔥', icon: <TrendingUp /> },
    { text: 'Show me deals! 💰', icon: <LocalOffer /> },
    { text: 'I need recommendations ⭐', icon: <Star /> },
    { text: 'Help me find laptops 💻', icon: <Search /> }
  ];

  const handleQuickAction = (action) => {
    setInputMessage(action.text);
    handleSendMessage();
  };

  return (
    <>
      {/* Floating Button */}
      <Zoom in={!open}>
        <Badge
          badgeContent={<AutoAwesome sx={{ fontSize: 12 }} />}
          color="secondary"
          className="notification-badge"
        >
          <Fab
            color="primary"
            onClick={() => setOpen(true)}
            className="ai-floating-button"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              width: 64,
              height: 64,
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            <SmartToy sx={{ fontSize: 32, color: 'white' }} />
          </Fab>
        </Badge>
      </Zoom>

      {/* Chat Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            maxHeight: '85vh',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)'
          },
          className: 'chat-dialog'
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 3,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <SmartToy />
            </Avatar>
            <Typography variant="h6">AI Shopping Assistant</Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '60vh' }}>
          {/* Trending Products Section */}
          {showTrending && trendingProducts.length > 0 && (
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                Trending Now
              </Typography>
              <Box display="flex" gap={1} sx={{ overflowX: 'auto', pb: 1 }}>
                {trendingProducts.map((product, index) => (
                  <Card 
                    key={product._id} 
                    className="trending-product product-card"
                    sx={{ 
                      minWidth: 140, 
                      cursor: 'pointer',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s ease',
                      animationDelay: `${index * 0.1}s`,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box display="flex" alignItems="center" mb={0.5}>
                        <TrendingUp sx={{ fontSize: 14, color: 'orange', mr: 0.5 }} />
                        <Typography variant="caption" color="orange" fontWeight="bold">
                          HOT
                        </Typography>
                      </Box>
                      <Typography variant="caption" noWrap fontWeight="medium">
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="primary" fontWeight="bold">
                        ${product.price}
                      </Typography>
                      {cart?.items?.find(item => item.product._id === product._id) ? (
                        <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                          <IconButton 
                            size="small"
                            onClick={() => {
                              const cartItem = cart.items.find(item => item.product._id === product._id);
                              onUpdateCartItem?.(product._id, cartItem.quantity - 1);
                            }}
                            sx={{ width: 20, height: 20, bgcolor: '#ff5252', color: 'white' }}
                          >
                            <Remove sx={{ fontSize: 12 }} />
                          </IconButton>
                          <Typography variant="caption" sx={{ 
                            minWidth: 20, 
                            textAlign: 'center',
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            borderRadius: 1,
                            px: 0.5,
                            fontWeight: 'bold'
                          }}>
                            {cart.items.find(item => item.product._id === product._id)?.quantity || 0}
                          </Typography>
                          <IconButton 
                            size="small"
                            onClick={() => {
                              const cartItem = cart.items.find(item => item.product._id === product._id);
                              onUpdateCartItem?.(product._id, cartItem.quantity + 1);
                            }}
                            sx={{ width: 20, height: 20, bgcolor: '#4caf50', color: 'white' }}
                          >
                            <Add sx={{ fontSize: 12 }} />
                          </IconButton>
                        </Box>
                      ) : (
                        <Button 
                          size="small" 
                          variant="contained"
                          onClick={() => onAddToCart?.(product._id)}
                          sx={{ 
                            mt: 0.5, 
                            fontSize: '0.7rem',
                            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                            }
                          }}
                          startIcon={<ShoppingCart sx={{ fontSize: 12 }} />}
                        >
                          Add
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          {/* Messages Area */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
            <List>
              {messages.map((message, index) => (
                <ListItem key={index} className="message-item" sx={{ alignItems: 'flex-start', px: 1 }}>
                  <Avatar sx={{ 
                    mr: 1, 
                    mt: 0.5,
                    background: message.type === 'bot' 
                      ? 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)' 
                      : 'linear-gradient(45deg, #74b9ff 0%, #0984e3 100%)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}>
                    {message.type === 'bot' ? <SmartToy /> : '👤'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Paper sx={{ 
                      p: 2,
                      bgcolor: message.type === 'bot' ? 'primary.light' : 'secondary.light',
                      borderRadius: 3,
                      border: 1,
                      borderColor: message.type === 'bot' ? 'primary.main' : 'secondary.main',
                      boxShadow: 1,
                      '& .MuiTypography-root': { color: 'text.primary' }
                    }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'text.primary' }}>
                        {message.text}
                      </Typography>
                      
                      {/* Product Recommendations */}
                      {message.products && message.products.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <Recommend sx={{ fontSize: 16, color: '#667eea', mr: 0.5 }} />
                            <Typography variant="caption" color="text.primary" fontWeight="bold">
                              Recommended for you:
                            </Typography>
                          </Box>
                          <Box display="flex" gap={1} sx={{ flexWrap: 'wrap' }}>
                            {message.products.slice(0, 4).map(product => (
                              <Chip
                                key={product._id}
                                label={`${product.name} - $${product.price}`}
                                size="small"
                                onClick={() => onAddToCart?.(product._id)}
                                clickable
                                sx={{
                                  bgcolor: 'primary.light',
                                  border: 1,
                                  borderColor: 'primary.main',
                                  color: 'text.primary',
                                  '&:hover': {
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    transform: 'translateY(-1px)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                                icon={<ShoppingCart sx={{ fontSize: 14 }} />}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Paper>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontSize: '0.7rem' }}>
                      {message.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
              
              {loading && (
                <ListItem sx={{ alignItems: 'center', px: 1 }}>
                  <Avatar sx={{ 
                    mr: 1, 
                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                    animation: 'pulse 1.5s infinite'
                  }}>
                    <SmartToy className="typing-indicator" />
                  </Avatar>
                  <Box display="flex" alignItems="center">
                    <CircularProgress 
                      size={16} 
                      sx={{ 
                        mr: 1,
                        color: '#667eea'
                      }} 
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      AI is thinking...
                    </Typography>
                  </Box>
                </ListItem>
              )}
            </List>
            <div ref={messagesEndRef} />
          </Box>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Quick Actions:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {quickActions.map((action, index) => (
                  <Chip
                    key={index}
                    label={action.text}
                    icon={action.icon}
                    onClick={() => handleQuickAction(action)}
                    clickable
                    size="small"
                    variant="outlined"
                    className="quick-action-chip"
                    sx={{ 
                      fontSize: '0.75rem',
                      animationDelay: `${index * 0.1}s`,
                      '&:hover': {
                        bgcolor: 'primary.light',
                        borderColor: 'primary.main'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Divider />

          {/* Input Area */}
          <Box sx={{ 
            p: 2,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider'
          }}>
            <Box display="flex" gap={1} alignItems="flex-end">
              <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder="Just chat with me! Try: 'Hello' or 'Show me laptops' 😊"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3
                  },
                  '& .MuiInputBase-input::placeholder': {
                    fontSize: '0.9rem'
                  }
                }}
              />
              <IconButton
                onClick={handleSendMessage}
                disabled={loading || !inputMessage.trim()}
                sx={{
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  width: 48,
                  height: 48,
                  '&:hover': { 
                    background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                    transform: 'scale(1.05)'
                  },
                  '&:disabled': { 
                    background: 'linear-gradient(45deg, #ccc 0%, #999 100%)',
                    transform: 'none'
                  },
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                <Send sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
              🤖 Powered by AI • Press Enter to send
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AIFloatingHelper;