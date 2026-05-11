import React, { useState, useEffect } from 'react';
import { 
  Grid, Card, CardContent, Typography, Box, Avatar, IconButton,
  LinearProgress, Chip, useTheme, Paper, Fade, Grow
} from '@mui/material';
import { 
  Inventory, ShoppingCart, Warning, TrendingUp, 
  Psychology, Timeline, Star, ArrowUpward, ArrowDownward
} from '@mui/icons-material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { analyticsAPI, aiAPI } from '../services/api';
import toast from 'react-hot-toast';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [behaviorAnalytics, setBehaviorAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    loadDashboardData();
    loadRecommendations();
    loadBehaviorAnalytics();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await aiAPI.getRecommendations();
      setRecommendations(response.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setRecommendations([]);
    }
  };

  const loadBehaviorAnalytics = async () => {
    try {
      const response = await aiAPI.getAnalytics();
      setBehaviorAnalytics(response.data);
    } catch (error) {
      console.error('Error loading behavior analytics:', error);
    }
  };

  const peakHoursData = behaviorAnalytics.peakHours?.map((count, hour) => ({
    hour: `${hour}:00`,
    orders: count
  })) || [];

  const statsCards = [
    {
      title: 'Total Products',
      value: dashboardData.totalProducts || 0,
      icon: <Inventory />,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Orders',
      value: dashboardData.totalOrders || 0,
      icon: <ShoppingCart />,
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Low Stock Items',
      value: dashboardData.lowStockProducts || 0,
      icon: <Warning />,
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      change: '-5%',
      trend: 'down'
    },
    {
      title: 'Revenue',
      value: '$24,500',
      icon: <TrendingUp />,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      change: '+15%',
      trend: 'up'
    }
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <Box>
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700, mb: 1,
            fontSize: { xs: '1.5rem', sm: '2rem' },
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}
        >
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's what's happening with your inventory today.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Grow in={!loading} timeout={300 + index * 100}>
              <Card 
                sx={{
                  background: card.gradient,
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '100px',
                    height: '100px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    transform: 'translate(30px, -30px)'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                      {card.icon}
                    </Avatar>
                    <Chip 
                      icon={card.trend === 'up' ? <ArrowUpward /> : <ArrowDownward />}
                      label={card.change}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        '& .MuiChip-icon': { color: 'white' }
                      }}
                    />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {card.value.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {card.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        ))}

        <Grid item xs={12} md={8}>
          <Fade in={!loading} timeout={800}>
            <Card sx={{ height: { xs: 'auto', md: '400px' } }}>
              <CardContent sx={{ height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Timeline sx={{ color: theme.palette.primary.main, mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Peak Hours Analysis
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={peakHoursData}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis 
                      dataKey="hour" 
                      stroke={theme.palette.text.secondary}
                      fontSize={12}
                    />
                    <YAxis stroke={theme.palette.text.secondary} fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8
                      }}
                    />
                    <Bar 
                      dataKey="orders" 
                      fill="url(#colorGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        <Grid item xs={12} md={4}>
          <Fade in={!loading} timeout={1000}>
            <Card sx={{ height: '400px' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Psychology sx={{ color: theme.palette.secondary.main, mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    AI Recommendations
                  </Typography>
                </Box>
                {recommendations.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    color: theme.palette.text.secondary
                  }}>
                    <Psychology sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
                    <Typography variant="body2">
                      No recommendations available. Add some products to see AI insights.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                    {recommendations.map((product, index) => (
                      <Paper 
                        key={index} 
                        sx={{ 
                          p: 2, 
                          mb: 2, 
                          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 2,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[4]
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {product.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Star sx={{ color: '#f59e0b', fontSize: 16, mr: 0.5 }} />
                            <Typography variant="caption" color="text.secondary">
                              {product.score?.toFixed(1) || 0}
                            </Typography>
                          </Box>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={(product.score || 0) * 10} 
                          sx={{ 
                            mt: 1, 
                            borderRadius: 1,
                            '& .MuiLinearProgress-bar': {
                              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                            }
                          }} 
                        />
                      </Paper>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;