import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Card, CardMedia, CardContent, Typography, Button, 
  TextField, Select, MenuItem, FormControl, InputLabel, Chip,
  AppBar, Toolbar, IconButton, Badge, Drawer, List, ListItem,
  Pagination, Container, Paper, Tabs, Tab, Slider, Accordion,
  AccordionSummary, AccordionDetails, Divider, ListItemText
} from '@mui/material';
import { 
  ShoppingCart, FilterList, Search, Add, Remove, History,
  ExpandMore, Clear, Sort, Psychology
} from '@mui/icons-material';
import { customerAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import SmartSearchBox from '../components/SmartSearchBox';
import AIFloatingHelper from '../components/AIFloatingHelper';
import ThemeToggle from '../components/ThemeToggle';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

function ShopEnhanced() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    category: '', minPrice: '', maxPrice: '', search: '', sort: 'name',
    priceRange: [0, 1000], inStock: true
  });
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [cartOpen, setCartOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isSmartSearch, setIsSmartSearch] = useState(false);
  const { user, logout } = useAuth();
  
  if (!user) {
    return null;
  }

  useEffect(() => {
    if (activeTab === 0) {
      loadProducts();
      loadCart();
    } else if (activeTab === 1) {
      loadOrders();
    }
  }, [filters, pagination.page, activeTab]);

  const loadProducts = async () => {
    try {
      const params = { ...filters, page: pagination.page };
      const response = await customerAPI.getProducts(params);
      setProducts(response.data.products);
      setCategories(response.data.categories);
      setIsSmartSearch(response.data.isSmartSearch || false);
      setPagination(prev => ({ 
        ...prev, 
        totalPages: response.data.totalPages 
      }));
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCart = async () => {
    try {
      const response = await customerAPI.getCart();
      setCart(response.data);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await customerAPI.getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const addToCart = async (productId) => {
    try {
      await customerAPI.addToCart(productId, 1);
      loadCart();
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      await customerAPI.updateCartItem(productId, quantity);
      loadCart();
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const placeOrder = async () => {
    try {
      await customerAPI.placeOrder();
      setCart({ items: [], total: 0 });
      setCartOpen(false);
      toast.success('Order placed successfully! 🎉');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  const cartItemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const clearFilters = () => {
    setFilters({
      category: '', minPrice: '', maxPrice: '', search: '', sort: 'name',
      priceRange: [0, 1000], inStock: true
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      processing: 'info', 
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontSize: { xs: '0.9rem', sm: '1.1rem' } }} noWrap>
            🛒 {user.username}
          </Typography>
          <IconButton color="inherit" onClick={() => setFiltersOpen(true)}>
            <FilterList />
          </IconButton>
          <IconButton color="inherit" onClick={() => setCartOpen(true)}>
            <Badge badgeContent={cartItemCount} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>
          <ThemeToggle />
          <Button color="inherit" onClick={logout} sx={{ ml: 0.5, fontSize: '0.8rem', minWidth: 'auto', px: 1 }}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1.5, sm: 3 } }}>
        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Products" />
            <Tab label="My Orders" />
          </Tabs>
        </Paper>

        {/* Products Tab */}
        {activeTab === 0 && (
          <>
            {/* Smart Search */}
            <Paper sx={{ 
              p: 3, 
              mb: 4,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
            }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <SmartSearchBox
                    value={filters.search}
                    onChange={(value) => setFilters({ ...filters, search: value })}
                    onSearch={(value) => {
                      setFilters({ ...filters, search: value });
                      setPagination({ page: 1, totalPages: 1 });
                    }}
                    placeholder="🧠 AI Search: Try 'food', '$100', categories..."
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {categories.map(cat => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={filters.sort}
                      onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                    >
                      <MenuItem value="name">Name A-Z</MenuItem>
                      <MenuItem value="price_low">Price: Low to High</MenuItem>
                      <MenuItem value="price_high">Price: High to Low</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setFiltersOpen(true)}
                    startIcon={<FilterList />}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: 500,
                      textTransform: 'none',
                      borderColor: 'primary.light',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.light',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Filters
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Search Results Info */}
            {filters.search && (
              <Box mb={2}>
                <Chip
                  icon={isSmartSearch ? <Psychology /> : <Search />}
                  label={isSmartSearch ? 
                    `🧠 AI Smart Search: "${filters.search}" (${products.length} results)` :
                    `Search: "${filters.search}" (${products.length} results)`
                  }
                  color={isSmartSearch ? "secondary" : "primary"}
                  variant="outlined"
                  onDelete={() => {
                    setFilters({ ...filters, search: '' });
                    setIsSmartSearch(false);
                  }}
                />
                {isSmartSearch && (
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                    🎆 Results include semantic matches and related products
                  </Typography>
                )}
              </Box>
            )}

            {/* Products Grid */}
            <Grid container spacing={3}>
              {products.map(product => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                      borderColor: 'primary.main'
                    }
                  }}>
                    <CardMedia
                      component="div"
                      sx={{ 
                        height: 200, 
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <Typography variant="h2" sx={{ 
                        color: 'primary.main',
                        fontWeight: 300,
                        opacity: 0.7
                      }}>
                        {product.name.charAt(0)}
                      </Typography>
                      <Box sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: product.stock > 10 ? 'success.main' : 'warning.main',
                        color: 'white',
                        borderRadius: 2,
                        px: 1,
                        py: 0.5
                      }}>
                        <Typography variant="caption" fontWeight="bold">
                          {product.stock} left
                        </Typography>
                      </Box>
                    </CardMedia>
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                        {product.category}
                      </Typography>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700 }}>
                          ${product.price}
                        </Typography>
                        <Chip 
                          label={product.stock > 10 ? 'In Stock' : 'Low Stock'}
                          size="small" 
                          sx={{
                            bgcolor: product.stock > 10 ? 'success.light' : 'warning.light',
                            color: product.stock > 10 ? 'success.dark' : 'warning.dark',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    </CardContent>
                    <Box sx={{ p: 3, pt: 0 }}>
                      {cart.items?.find(item => item.product._id === product._id) ? (
                        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                          <IconButton 
                            size="small"
                            onClick={() => {
                              const cartItem = cart.items.find(item => item.product._id === product._id);
                              updateCartItem(product._id, cartItem.quantity - 1);
                            }}
                            sx={{
                              background: 'linear-gradient(45deg, #ff6b6b 0%, #ee5a52 100%)',
                              color: 'white',
                              '&:hover': { background: 'linear-gradient(45deg, #ff5252 0%, #d32f2f 100%)' },
                              width: 32,
                              height: 32
                            }}
                          >
                            <Remove sx={{ fontSize: 16 }} />
                          </IconButton>
                          <Box sx={{
                            minWidth: 60,
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            borderRadius: 2,
                            py: 1,
                            fontWeight: 'bold'
                          }}>
                            {cart.items.find(item => item.product._id === product._id)?.quantity || 0}
                          </Box>
                          <IconButton 
                            size="small"
                            onClick={() => {
                              const cartItem = cart.items.find(item => item.product._id === product._id);
                              updateCartItem(product._id, cartItem.quantity + 1);
                            }}
                            disabled={product.stock <= (cart.items.find(item => item.product._id === product._id)?.quantity || 0)}
                            sx={{
                              background: 'linear-gradient(45deg, #4caf50 0%, #388e3c 100%)',
                              color: 'white',
                              '&:hover': { background: 'linear-gradient(45deg, #66bb6a 0%, #4caf50 100%)' },
                              '&:disabled': { background: 'linear-gradient(45deg, #ccc 0%, #999 100%)' },
                              width: 32,
                              height: 32
                            }}
                          >
                            <Add sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      ) : (
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => addToCart(product._id)}
                          disabled={product.stock === 0}
                          sx={{
                            borderRadius: 2,
                            py: 1.5,
                            fontWeight: 600,
                            textTransform: 'none',
                            boxShadow: 'none',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                              transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      )}
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={(e, page) => setPagination(prev => ({ ...prev, page }))}
              />
            </Box>
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>My Orders</Typography>
            {orders.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                  No orders found
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Start shopping to see your orders here
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {orders.map(order => (
                  <Grid item xs={12} key={order._id}>
                    <Card sx={{
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                        borderColor: 'primary.light'
                      }
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="h6">
                            Order #{order.orderNumber}
                          </Typography>
                          <Chip 
                            label={order.status.toUpperCase()} 
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </Box>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="textSecondary">
                              Order Date: {new Date(order.createdAt).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Total: ${order.total}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Items: {order.items?.length || 0}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" gutterBottom>
                              <strong>Items:</strong>
                            </Typography>
                            {order.items?.slice(0, 3).map((item, index) => (
                              <Typography key={index} variant="body2" color="textSecondary">
                                • {item.product?.name || 'Product'} x{item.quantity}
                              </Typography>
                            ))}
                            {order.items?.length > 3 && (
                              <Typography variant="body2" color="textSecondary">
                                ... and {order.items.length - 3} more items
                              </Typography>
                            )}
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Container>

      {/* Advanced Filters Drawer */}
      <Drawer anchor="left" open={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <Box sx={{ width: 350, p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Advanced Filters</Typography>
            <Button onClick={clearFilters} startIcon={<Clear />} size="small">
              Clear All
            </Button>
          </Box>
          
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Price Range</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography gutterBottom>Price: ${filters.priceRange[0]} - ${filters.priceRange[1]}</Typography>
              <Slider
                value={filters.priceRange}
                onChange={(e, newValue) => setFilters({ ...filters, priceRange: newValue })}
                valueLabelDisplay="auto"
                min={0}
                max={2000}
                step={10}
              />
              <Box display="flex" gap={2} mt={2}>
                <TextField
                  label="Min Price"
                  type="number"
                  size="small"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                />
                <TextField
                  label="Max Price"
                  type="number"
                  size="small"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Categories</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl fullWidth>
                <Select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Availability</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl fullWidth>
                <Select
                  value={filters.inStock}
                  onChange={(e) => setFilters({ ...filters, inStock: e.target.value })}
                >
                  <MenuItem value={true}>In Stock Only</MenuItem>
                  <MenuItem value={false}>All Products</MenuItem>
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>
          
          <Box mt={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setFiltersOpen(false)}
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Cart Drawer */}
      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
        <Box sx={{ width: { xs: '100vw', sm: 380 }, maxWidth: '100vw', p: 2 }}>
          <Typography variant="h6" gutterBottom>Shopping Cart</Typography>
          
          {cart.items?.length === 0 ? (
            <Typography>Your cart is empty</Typography>
          ) : (
            <>
              <List>
                {cart.items?.map(item => (
                  <ListItem key={item.product._id} sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <Box display="flex" justifyContent="space-between" width="100%">
                      <Typography variant="body1">{item.product.name}</Typography>
                      <Typography variant="body1">${item.price}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                      <Box display="flex" alignItems="center">
                        <IconButton 
                          size="small" 
                          onClick={() => updateCartItem(item.product._id, item.quantity - 1)}
                        >
                          <Remove />
                        </IconButton>
                        <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => updateCartItem(item.product._id, item.quantity + 1)}
                        >
                          <Add />
                        </IconButton>
                      </Box>
                      <Typography variant="body2">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
              
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="h6">
                  Total: ${cart.total?.toFixed(2)}
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={placeOrder}
                  sx={{ mt: 2 }}
                >
                  Place Order
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      {/* AI Floating Helper */}
      <AIFloatingHelper 
        onAddToCart={addToCart} 
        cart={cart}
        onUpdateCartItem={updateCartItem}
      />

      <Footer />
    </Box>
  );
}

export default ShopEnhanced;