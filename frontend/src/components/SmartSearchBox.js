import React, { useState, useEffect, useRef } from 'react';
import {
  TextField, Paper, List, ListItem, ListItemText, Box, 
  Typography, Chip, InputAdornment, IconButton
} from '@mui/material';
import { Search, Clear, TrendingUp, Category, Psychology } from '@mui/icons-material';
import { customerAPI } from '../services/api';

function SmartSearchBox({ value, onChange, onSearch, placeholder }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (value && value.length > 1) {
      // Debounce search suggestions
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        loadSuggestions(value);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value]);

  const loadSuggestions = async (query) => {
    try {
      setLoading(true);
      const response = await customerAPI.getSearchSuggestions(query);
      setSuggestions(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion.value);
    setShowSuggestions(false);
    onSearch && onSearch(suggestion.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      onSearch && onSearch(value);
    }
  };

  const handleClear = () => {
    onChange('');
    setShowSuggestions(false);
    onSearch && onSearch('');
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'category': return <Category fontSize="small" />;
      case 'product': return <TrendingUp fontSize="small" />;
      case 'semantic': return <Psychology fontSize="small" />;
      default: return <Search fontSize="small" />;
    }
  };

  const getSuggestionColor = (type) => {
    switch (type) {
      case 'category': return 'primary';
      case 'product': return 'success';
      case 'semantic': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Box position="relative" ref={searchRef}>
      <TextField
        fullWidth
        placeholder={placeholder || "🔍 Smart Search: Try 'food', '$50', 'electronics'..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        onFocus={() => value && suggestions.length > 0 && setShowSuggestions(true)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="action" />
            </InputAdornment>
          ),
          endAdornment: value && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear}>
                <Clear />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: 300,
            overflow: 'auto',
            mt: 1
          }}
        >
          <List dense>
            {suggestions.map((suggestion, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{ py: 1 }}
              >
                <Box display="flex" alignItems="center" width="100%">
                  {getSuggestionIcon(suggestion.type)}
                  <ListItemText
                    primary={suggestion.value}
                    sx={{ ml: 1 }}
                  />
                  <Chip
                    label={suggestion.type}
                    size="small"
                    color={getSuggestionColor(suggestion.type)}
                    variant="outlined"
                  />
                </Box>
              </ListItem>
            ))}
            
            <ListItem sx={{ bgcolor: 'grey.50', py: 1 }}>
              <Typography variant="caption" color="textSecondary">
                💡 Try: Product names, categories, prices ($50), or related terms
              </Typography>
            </ListItem>
          </List>
        </Paper>
      )}
    </Box>
  );
}

export default SmartSearchBox;