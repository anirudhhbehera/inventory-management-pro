import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, Select, MenuItem,
  FormControl, IconButton, Collapse, Avatar, Grid, Divider,
  LinearProgress, Fade, Grow, useTheme, Paper, useMediaQuery
} from '@mui/material';
import {
  ExpandMore, ShoppingCart, Person, CalendarToday,
  LocalShipping, CheckCircle, Cancel, Schedule, Inventory
} from '@mui/icons-material';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const response = await orderAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      loadOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: '#f59e0b', bgColor: '#fef3c7', icon: <Schedule />, label: 'Pending', progress: 25 },
      processing: { color: '#06b6d4', bgColor: '#cffafe', icon: <Inventory />, label: 'Processing', progress: 50 },
      shipped: { color: '#6366f1', bgColor: '#e0e7ff', icon: <LocalShipping />, label: 'Shipped', progress: 75 },
      delivered: { color: '#10b981', bgColor: '#d1fae5', icon: <CheckCircle />, label: 'Delivered', progress: 100 },
      cancelled: { color: '#ef4444', bgColor: '#fee2e2', icon: <Cancel />, label: 'Cancelled', progress: 0 }
    };
    return configs[status] || configs.pending;
  };

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    newExpanded.has(orderId) ? newExpanded.delete(orderId) : newExpanded.add(orderId);
    setExpandedOrders(newExpanded);
  };

  const OrderCard = ({ order, index }) => {
    const statusConfig = getStatusConfig(order.status);
    const isExpanded = expandedOrders.has(order._id);

    return (
      <Grow in={!loading} timeout={300 + index * 100}>
        <Card sx={{
          mb: 2, position: 'relative', overflow: 'visible',
          '&::before': {
            content: '""', position: 'absolute', top: 0, left: 0, right: 0,
            height: '4px', borderRadius: '4px 4px 0 0',
            background: `linear-gradient(90deg, ${statusConfig.color} 0%, ${statusConfig.color}80 100%)`
          }
        }}>
          <CardContent sx={{ pt: 3, px: { xs: 2, sm: 3 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: statusConfig.bgColor, color: statusConfig.color, width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}>
                  <ShoppingCart />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>
                    Order #{order.orderNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.items.length} items • ${order.total}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={statusConfig.icon}
                  label={statusConfig.label}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{ bgcolor: statusConfig.bgColor, color: statusConfig.color, fontWeight: 600, '& .MuiChip-icon': { color: statusConfig.color } }}
                />
                <IconButton
                  onClick={() => toggleOrderExpansion(order._id)}
                  size="small"
                  sx={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
                >
                  <ExpandMore />
                </IconButton>
              </Box>
            </Box>

            {/* Info Row */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person sx={{ color: 'text.secondary', fontSize: 18 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{order.customer.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{order.customer.email}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday sx={{ color: 'text.secondary', fontSize: 18 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Order Date</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl size="small" fullWidth>
                  <Select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    <MenuItem value="pending"><Schedule sx={{ fontSize: 16, mr: 1 }} />Pending</MenuItem>
                    <MenuItem value="processing"><Inventory sx={{ fontSize: 16, mr: 1 }} />Processing</MenuItem>
                    <MenuItem value="shipped"><LocalShipping sx={{ fontSize: 16, mr: 1 }} />Shipped</MenuItem>
                    <MenuItem value="delivered"><CheckCircle sx={{ fontSize: 16, mr: 1 }} />Delivered</MenuItem>
                    <MenuItem value="cancelled"><Cancel sx={{ fontSize: 16, mr: 1 }} />Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Progress */}
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">Order Progress</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{statusConfig.progress}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate" value={statusConfig.progress}
                sx={{
                  height: 8, borderRadius: 4,
                  '& .MuiLinearProgress-bar': { background: `linear-gradient(90deg, ${statusConfig.color} 0%, ${statusConfig.color}80 100%)` }
                }}
              />
            </Box>

            {/* Expanded Details */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '1rem' }}>📦 Order Details</Typography>
              <Grid container spacing={1.5}>
                {order.items.map((item, itemIndex) => (
                  <Grid item xs={12} key={itemIndex}>
                    <Paper sx={{ p: 2, bgcolor: theme.palette.action.hover, border: `1px solid ${theme.palette.divider}` }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {item.product?.name || item.name || 'Product'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Qty: {item.quantity} × ${item.price}
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                          ${(item.quantity * item.price).toFixed(2)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 2, p: 2, bgcolor: `${statusConfig.color}10`, borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>📍 Shipping Address</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.shippingAddress || 'Address not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: statusConfig.color }}>${order.total}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      </Grow>
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700, mb: 1, fontSize: { xs: '1.5rem', sm: '2rem' },
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}
        >
          Order Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track and manage customer orders with real-time status updates
        </Typography>
      </Box>

      <Box>
        {orders.map((order, index) => (
          <OrderCard key={order._id} order={order} index={index} />
        ))}
        {orders.length === 0 && !loading && (
          <Fade in>
            <Paper sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center', bgcolor: theme.palette.action.hover }}>
              <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>No orders found</Typography>
              <Typography variant="body2" color="text.secondary">
                Orders will appear here once customers start placing them.
              </Typography>
            </Paper>
          </Fade>
        )}
      </Box>
    </Box>
  );
}

export default Orders;
