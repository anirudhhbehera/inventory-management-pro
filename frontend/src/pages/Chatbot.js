import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Paper, List, ListItem,
  Avatar, Chip, IconButton, useTheme, useMediaQuery
} from '@mui/material';
import { Send, SmartToy, Person, Clear } from '@mui/icons-material';
import { chatbotAPI } from '../services/api';
import toast from 'react-hot-toast';

function Chatbot() {
  const [messages, setMessages] = useState([{
    type: 'bot',
    text: "Hi! I'm your inventory assistant. Ask me anything about stock, orders, or products!",
    timestamp: new Date()
  }]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { type: 'user', text: inputMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await chatbotAPI.sendMessage(inputMessage);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: response.data.botResponse,
        timestamp: new Date()
      }]);
    } catch (error) {
      toast.error('Failed to get response. Please try again.');
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{ type: 'bot', text: 'Chat cleared! How can I help you?', timestamp: new Date() }]);
    toast.success('Chat cleared');
  };

  const quickQuestions = [
    'How many laptops are left?',
    "Show today's orders",
    "What's low on stock?",
    'Total revenue?',
    'Find electronics'
  ];

  return (
    <Box sx={{ height: { xs: 'calc(100vh - 80px)', sm: 'calc(100vh - 120px)' }, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.3rem', sm: '1.8rem' } }}>
          🤖 Inventory Assistant
        </Typography>
        <IconButton onClick={clearChat} color="primary" title="Clear chat">
          <Clear />
        </IconButton>
      </Box>

      {/* Quick Questions */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">Quick Questions:</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {quickQuestions.map((question, index) => (
            <Chip
              key={index}
              label={question}
              onClick={() => setInputMessage(question)}
              variant="outlined"
              size="small"
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
            />
          ))}
        </Box>
      </Box>

      {/* Messages */}
      <Paper sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', mb: 2, borderRadius: 2 }}>
        <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 1, sm: 2 } }}>
          <List disablePadding>
            {messages.map((message, index) => (
              <ListItem
                key={index}
                sx={{
                  alignItems: 'flex-start',
                  px: { xs: 0.5, sm: 1 },
                  flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                  gap: 1
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: message.type === 'bot' ? theme.palette.primary.main : theme.palette.secondary.main,
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                    flexShrink: 0
                  }}
                >
                  {message.type === 'bot' ? <SmartToy sx={{ fontSize: { xs: 18, sm: 22 } }} /> : <Person sx={{ fontSize: { xs: 18, sm: 22 } }} />}
                </Avatar>
                <Box
                  sx={{
                    maxWidth: { xs: '80%', sm: '70%' },
                    bgcolor: message.type === 'bot' ? theme.palette.action.hover : theme.palette.primary.main,
                    color: message.type === 'user' ? 'white' : 'inherit',
                    borderRadius: message.type === 'bot' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                    px: { xs: 1.5, sm: 2 },
                    py: 1
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                    {message.text}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Box>
              </ListItem>
            ))}
            {loading && (
              <ListItem sx={{ alignItems: 'flex-start', px: { xs: 0.5, sm: 1 }, gap: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}>
                  <SmartToy sx={{ fontSize: { xs: 18, sm: 22 } }} />
                </Avatar>
                <Box sx={{ bgcolor: theme.palette.action.hover, borderRadius: '4px 12px 12px 12px', px: 2, py: 1 }}>
                  <Typography variant="body2" color="text.secondary">Thinking...</Typography>
                </Box>
              </ListItem>
            )}
          </List>
          <div ref={messagesEndRef} />
        </Box>
      </Paper>

      {/* Input */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          placeholder="Ask me about inventory, orders, stock levels..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          size={isMobile ? 'small' : 'medium'}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <Button
          variant="contained"
          onClick={handleSendMessage}
          disabled={loading || !inputMessage.trim()}
          sx={{ minWidth: 'auto', px: { xs: 1.5, sm: 2 }, borderRadius: 2 }}
        >
          <Send />
        </Button>
      </Box>
    </Box>
  );
}

export default Chatbot;
