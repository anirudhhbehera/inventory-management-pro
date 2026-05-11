import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid, Rating, Card, CardContent, CardActions,
  useTheme, useMediaQuery, IconButton, Tooltip, Chip
} from '@mui/material';
import { Add, Edit, Delete, Email, Phone, LocationOn, Star } from '@mui/icons-material';
import { supplierAPI } from '../services/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyForm = { name: '', email: '', phone: '', address: '', rating: 5 };

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, supplier: null });
  const [formData, setFormData] = useState(emptyForm);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => { loadSuppliers(); }, []);

  const loadSuppliers = async () => {
    try {
      const response = await supplierAPI.getAll();
      setSuppliers(response.data);
    } catch (error) {
      toast.error('Failed to load suppliers');
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedSupplier) {
        await supplierAPI.update(selectedSupplier._id, formData);
        toast.success('Supplier updated successfully!');
      } else {
        await supplierAPI.create(formData);
        toast.success('Supplier added successfully!');
      }
      handleClose();
      loadSuppliers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save supplier');
    }
  };

  const handleDelete = async (id) => {
    try {
      await supplierAPI.delete(id);
      setDeleteDialog({ open: false, supplier: null });
      toast.success('Supplier deleted');
      loadSuppliers();
    } catch (error) {
      toast.error('Failed to delete supplier');
    }
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData(supplier);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedSupplier(null);
    setFormData(emptyForm);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Suppliers
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>
          Add Supplier
        </Button>
      </Box>

      {isMobile ? (
        <Grid container spacing={2}>
          {suppliers.map((supplier) => (
            <Grid item xs={12} key={supplier._id}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>{supplier.name}</Typography>
                    <Rating value={supplier.rating} readOnly size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">{supplier.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">{supplier.phone}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip label={`${supplier.products?.length || 0} products`} size="small" variant="outlined" />
                    {supplier.deliveryTime && (
                      <Chip label={`${supplier.deliveryTime} days`} size="small" variant="outlined" />
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ pt: 0, px: 2, pb: 1.5, gap: 1 }}>
                  <Button size="small" startIcon={<Edit />} onClick={() => handleEdit(supplier)}>Edit</Button>
                  <Button size="small" color="error" startIcon={<Delete />}
                    onClick={() => setDeleteDialog({ open: true, supplier })}>Delete</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Products</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Delivery Time</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier._id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                  <TableCell sx={{ fontWeight: 500 }}>{supplier.name}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell>{supplier.phone}</TableCell>
                  <TableCell>{supplier.products?.length || 0}</TableCell>
                  <TableCell><Rating value={supplier.rating} readOnly size="small" /></TableCell>
                  <TableCell>{supplier.deliveryTime} days</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(supplier)}
                          sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => setDeleteDialog({ open: true, supplier })}
                          sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, m: { xs: 1, sm: 2 } } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {selectedSupplier ? 'Edit Supplier' : 'Add Supplier'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Name" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" type="email" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Delivery Time (days)" type="number" value={formData.deliveryTime || ''}
                onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" multiline rows={2} value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Rating</Typography>
              <Rating value={formData.rating} onChange={(e, val) => setFormData({ ...formData, rating: val })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ borderRadius: 2 }}>
            {selectedSupplier ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Supplier"
        message={`Are you sure you want to delete "${deleteDialog.supplier?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
        onConfirm={() => handleDelete(deleteDialog.supplier?._id)}
        onCancel={() => setDeleteDialog({ open: false, supplier: null })}
      />
    </Box>
  );
}

export default Suppliers;
