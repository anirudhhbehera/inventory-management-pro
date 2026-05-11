import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Card, CardMedia, CardContent, Typography, Button, 
  TextField, Select, MenuItem, FormControl, InputLabel, Chip,
  AppBar, Toolbar, IconButton, Badge, Drawer, List, ListItem,
  Pagination, Container, Paper
} from '@mui/material';
import { ShoppingCart, FilterList, Search, Add, Remove } from '@mui/icons-material';
import { customerAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Shop() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [filters, setFilters] = useState({
    category: '', minPrice: '', maxPrice: '', search: '', sort: 'name'
  });
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [cartOpen, setCartOpen] = useState(false);
  const { user, logout } = useAuth();
  
  if (!user) {
    return null;
  }

  useEffect(() => {
    loadProducts();
    loadCart();
  }, [filters, pagination.page]);

  const loadProducts = async () => {
    try {
      const params = { ...filters, page: pagination.page };
      const response = await customerAPI.getProducts(params);
      setProducts(response.data.products);
      setCategories(response.data.categories);
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

  const addToCart = async (productId) => {
    try {
      await customerAPI.addToCart(productId, 1);
      loadCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      await customerAPI.updateCartItem(productId, quantity);
      loadCart();
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const placeOrder = async () => {
    try {
      await customerAPI.placeOrder();
      setCart({ items: [], total: 0 });
      setCartOpen(false);
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order');
    }
  };

  const cartItemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <Box>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            🛒 Shop - Welcome {user.username}
          </Typography>
          <IconButton color="inherit" onClick={() => setCartOpen(true)}>
            <Badge badgeContent={cartItemCount} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>
          <Button color="inherit" onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                InputProps={{ startAdornment: <Search /> }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={1.5}>
              <TextField
                fullWidth
                label="Min Price"
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </Grid>
            <Grid item xs={6} sm={1.5}>
              <TextField
                fullWidth
                label="Max Price"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sort}
                  onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="price_low">Price: Low to High</MenuItem>
                  <MenuItem value="price_high">Price: High to Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Products Grid */}
        <Grid container spacing={3}>
          {products.map(product => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="div"
                  sx={{ height: 200, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Typography variant="h6" color="textSecondary">
                    {product.name.charAt(0)}
                  </Typography>
                </CardMedia>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>{product.name}</Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {product.category}
                  </Typography>
                  <Typography variant="h5" color="primary" gutterBottom>
                    ${product.price}
                  </Typography>
                  <Chip 
                    label={`Stock: ${product.stock}`} 
                    size="small" 
                    color={product.stock > 10 ? 'success' : 'warning'} 
                  />
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => addToCart(product._id)}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
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
      </Container>

      {/* Cart Drawer */}
      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
        <Box sx={{ width: 400, p: 2 }}>
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
    </Box>
  );
}

export default Shop;