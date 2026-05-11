import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Paper, Button, 
  LinearProgress, Chip, useTheme
} from '@mui/material';
import { 
  TrendingUp, ShoppingCart, AttachMoney, Inventory, Refresh
} from '@mui/icons-material';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';
import { aiAPI, orderAPI, productAPI } from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

function Analytics() {
  const [behaviorData, setBehaviorData] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    loadAllAnalytics();
  }, []);

  const loadAllAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadAnalytics(),
        loadRecommendations(),
        loadDashboardData()
      ]);
      toast.success('Analytics refreshed');
    } catch (error) {
      toast.error('Failed to load analytics');
    }
    setLoading(false);
  };

  const loadAnalytics = async () => {
    try {
      const response = await aiAPI.getAnalytics();
      setBehaviorData(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await aiAPI.getRecommendations();
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        orderAPI.getAll(),
        productAPI.getAll()
      ]);
      
      const orders = ordersRes.data;
      const products = productsRes.data;
      
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalOrders = orders.length;
      const totalProducts = products.length;
      const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
      
      setDashboardData({
        totalRevenue,
        totalOrders,
        totalProducts,
        lowStockCount,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const categoryData = Object.entries(behaviorData.topCategories || {}).map(([category, count]) => ({
    name: category,
    value: count
  }));

  const peakHoursData = behaviorData.peakHours?.map((count, hour) => ({
    hour: `${hour}:00`,
    orders: count
  })).filter(item => item.orders > 0) || [];

  const trendData = [
    { month: 'Jan', revenue: 4000, orders: 24 },
    { month: 'Feb', revenue: 3000, orders: 18 },
    { month: 'Mar', revenue: 5000, orders: 32 },
    { month: 'Apr', revenue: 4500, orders: 28 },
    { month: 'May', revenue: 6000, orders: 38 },
    { month: 'Jun', revenue: 5500, orders: 35 }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Analytics Overview
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Refresh />}
          onClick={loadAllAnalytics}
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

      {/* Metrics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    ${dashboardData.totalRevenue?.toFixed(0) || 0}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {dashboardData.totalOrders || 0}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Total Orders
                  </Typography>
                </Box>
                <ShoppingCart sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {dashboardData.totalProducts || 0}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Products
                  </Typography>
                  <Typography variant="caption" color="error.main">
                    {dashboardData.lowStockCount || 0} low stock
                  </Typography>
                </Box>
                <Inventory sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                    ${dashboardData.avgOrderValue?.toFixed(0) || 0}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Avg Order Value
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'secondary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Revenue Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Revenue & Orders Trend
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} />
                <ChartTooltip 
                  contentStyle={{ 
                    borderRadius: 8, 
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.paper
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={theme.palette.primary.main} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Category Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Peak Hours */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Peak Hours Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="hour" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} />
                <ChartTooltip 
                  contentStyle={{ 
                    borderRadius: 8, 
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.paper
                  }} 
                />
                <Bar 
                  dataKey="orders" 
                  fill={theme.palette.primary.main} 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* AI Recommendations */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              AI Recommendations
            </Typography>
            <Box sx={{ maxHeight: 280, overflowY: 'auto' }}>
              {recommendations.slice(0, 5).map((product, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  mb: 1,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.selected' }
                }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Confidence: {product.score?.toFixed(1) || 0}
                    </Typography>
                  </Box>
                  <Chip 
                    label="Recommended"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Analytics;