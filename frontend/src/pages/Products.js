import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid, IconButton, Tooltip, useTheme, Divider,
  InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Card, CardContent, CardActions, useMediaQuery
} from '@mui/material';
import { Add, Edit, Delete, Psychology, Inventory, AttachMoney, Category, Search } from '@mui/icons-material';
import { productAPI, aiAPI } from '../services/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';

function Products() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [forecast, setForecast] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });
  const [searchTerm, setSearchTerm] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [formData, setFormData] = useState({
    name: '', sku: '', category: '', price: '', cost: '', stock: '', minStock: ''
  });

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedProduct) {
        await productAPI.update(selectedProduct._id, formData);
        toast.success('Product updated successfully!');
      } else {
        await productAPI.create(formData);
        toast.success('Product created successfully!');
      }
      setOpen(false);
      setFormData({ name: '', sku: '', category: '', price: '', cost: '', stock: '', minStock: '' });
      setSelectedProduct(null);
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData(product);
    setOpen(true);
  };

  const handleDelete = async (productId) => {
    try {
      await productAPI.delete(productId);
      setDeleteDialog({ open: false, product: null });
      toast.success('Product deleted');
      loadProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const loadForecast = async (productId) => {
    try {
      const response = await aiAPI.getForecast(productId);
      setForecast(prev => ({ ...prev, [productId]: response.data }));
      toast.success('Forecast loaded');
    } catch (error) {
      toast.error('Could not load forecast');
    }
  };

  const getStockStatus = (product) => {
    if (product.stock <= product.minStock) return { label: 'Low Stock', color: 'error' };
    if (product.stock <= product.minStock * 2) return { label: 'Medium', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
    setFormData({ name: '', sku: '', category: '', price: '', cost: '', stock: '', minStock: '' });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Products
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>
          Add Product
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          sx={{ maxWidth: { xs: '100%', sm: 400 } }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment>
          }}
        />
      </Box>

      {isMobile ? (
        <Grid container spacing={2}>
          {filteredProducts.map((product) => {
            const status = getStockStatus(product);
            return (
              <Grid item xs={12} key={product._id}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>{product.name}</Typography>
                      <Chip label={status.label} color={status.color} size="small" sx={{ borderRadius: 1 }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>SKU: {product.sku}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      <Chip label={product.category} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>${product.price}</Typography>
                      <Typography variant="body2" color="text.secondary">Stock: {product.stock}</Typography>
                    </Box>
                    {forecast[product._id] && (
                      <Typography variant="caption" color="text.secondary">
                        AI Forecast: {forecast[product._id].forecast} units
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ pt: 0, px: 2, pb: 1.5, gap: 1 }}>
                    <Button size="small" startIcon={<Psychology />} onClick={() => loadForecast(product._id)}>
                      Forecast
                    </Button>
                    <Button size="small" startIcon={<Edit />} onClick={() => handleEdit(product)}>Edit</Button>
                    <Button size="small" color="error" startIcon={<Delete />} onClick={() => setDeleteDialog({ open: true, product })}>
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>AI Forecast</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => {
                const status = getStockStatus(product);
                return (
                  <TableRow key={product._id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                    <TableCell><Typography variant="body1" sx={{ fontWeight: 500 }}>{product.name}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{product.sku}</Typography></TableCell>
                    <TableCell><Chip label={product.category} size="small" variant="outlined" sx={{ borderRadius: 1 }} /></TableCell>
                    <TableCell><Typography variant="body1" sx={{ fontWeight: 500 }}>${product.price}</Typography></TableCell>
                    <TableCell><Typography variant="body1">{product.stock}</Typography></TableCell>
                    <TableCell><Chip label={status.label} color={status.color} size="small" sx={{ borderRadius: 1 }} /></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Get AI Forecast">
                          <IconButton size="small" onClick={() => loadForecast(product._id)}
                            sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                            <Psychology fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {forecast[product._id] && (
                          <Typography variant="caption" color="text.secondary">
                            {forecast[product._id].forecast} units
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEdit(product)}
                            sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setDeleteDialog({ open: true, product })}
                            sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, m: { xs: 1, sm: 2 } } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {selectedProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Product Name" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><Inventory color="action" /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="SKU" value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Category" value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><Category color="action" /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Price" type="number" value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoney color="action" /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Cost" type="number" value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Stock Quantity" type="number" value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Minimum Stock" type="number" value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ borderRadius: 2 }}>
            {selectedProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteDialog.product?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
        onConfirm={() => handleDelete(deleteDialog.product?._id)}
        onCancel={() => setDeleteDialog({ open: false, product: null })}
      />
    </Box>
  );
}

export default Products;
