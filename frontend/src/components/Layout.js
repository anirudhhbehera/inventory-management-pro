import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Box, Button, Avatar, Chip, Divider, IconButton, useTheme,
  Collapse, Badge, useMediaQuery
} from '@mui/material';
import {
  Dashboard, Inventory, ShoppingCart, Business, Analytics, Psychology,
  Chat, Logout, Menu, Notifications, Settings, ExpandLess, ExpandMore,
  TrendingUp, Assessment, Store
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import Footer from './Footer';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/', color: '#6366f1' },
  { text: 'Products', icon: <Inventory />, path: '/products', color: '#10b981' },
  { text: 'Orders', icon: <ShoppingCart />, path: '/orders', color: '#f59e0b' },
  { text: 'Suppliers', icon: <Business />, path: '/suppliers', color: '#06b6d4' },
  {
    text: 'Analytics',
    icon: <Analytics />,
    color: '#8b5cf6',
    subItems: [
      { text: 'Overview', icon: <Assessment />, path: '/analytics' },
      { text: 'AI Insights', icon: <Psychology />, path: '/gemini-insights' }
    ]
  },
  { text: 'Chat Assistant', icon: <Chat />, path: '/chatbot', color: '#ef4444' }
];

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  if (!user) return null;

  const handleNavClick = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{
        p: 2.5,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Store sx={{ fontSize: 28, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>InventoryPro</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 36, height: 36, fontSize: '1rem', fontWeight: 600 }}>
            {user.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.username}
            </Typography>
            <Chip label={user.role} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.7rem', height: 18 }} />
          </Box>
        </Box>
      </Box>

      <List sx={{ flexGrow: 1, px: 1, py: 1, overflowY: 'auto' }}>
        {menuItems.map((item) => {
          if (item.subItems) {
            return (
              <Box key={item.text}>
                <ListItemButton
                  onClick={() => setAnalyticsOpen(!analyticsOpen)}
                  sx={{
                    borderRadius: 2, mb: 0.5,
                    '&:hover': { bgcolor: `${item.color}15`, '& .MuiListItemIcon-root': { color: item.color } }
                  }}
                >
                  <ListItemIcon sx={{ color: item.color, minWidth: 38 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem' }} />
                  {analyticsOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={analyticsOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <ListItemButton
                        key={subItem.text}
                        selected={location.pathname === subItem.path}
                        onClick={() => handleNavClick(subItem.path)}
                        sx={{
                          pl: 4, borderRadius: 2, mb: 0.5, ml: 1,
                          '&.Mui-selected': {
                            bgcolor: `${item.color}20`,
                            '& .MuiListItemIcon-root': { color: item.color },
                            '&:hover': { bgcolor: `${item.color}30` }
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 34 }}>{subItem.icon}</ListItemIcon>
                        <ListItemText primary={subItem.text} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </Box>
            );
          }
          return (
            <ListItemButton
              key={item.text}
              selected={location.pathname === item.path}
              onClick={() => handleNavClick(item.path)}
              sx={{
                borderRadius: 2, mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: `${item.color}20`,
                  '& .MuiListItemIcon-root': { color: item.color },
                  '&:hover': { bgcolor: `${item.color}30` }
                },
                '&:hover': { bgcolor: `${item.color}15`, '& .MuiListItemIcon-root': { color: item.color } }
              }}
            >
              <ListItemIcon sx={{ color: item.color, minWidth: 38 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem' }} />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ mx: 2 }} />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth variant="outlined" startIcon={<Settings />}
          sx={{
            mb: 1, borderRadius: 2, borderColor: theme.palette.divider, fontSize: '0.85rem',
            '&:hover': { borderColor: theme.palette.primary.main, bgcolor: `${theme.palette.primary.main}10` }
          }}
        >
          Settings
        </Button>
        <Button
          fullWidth variant="contained" startIcon={<Logout />} onClick={logout}
          sx={{
            borderRadius: 2, fontSize: '0.85rem',
            background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
            '&:hover': { background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.main} 100%)` }
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: theme.palette.background.paper,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 1.5, display: { md: 'none' }, color: theme.palette.text.primary }}
          >
            <Menu />
          </IconButton>
          <Typography
            variant="h6" noWrap component="div"
            sx={{ flexGrow: 1, color: theme.palette.text.primary, fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1.1rem' } }}
          >
            Inventory Management
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton sx={{ color: theme.palette.text.primary }}>
              <Badge badgeContent={3} color="error"><Notifications /></Badge>
            </IconButton>
            <ThemeToggle />
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none', background: theme.palette.background.paper }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          background: theme.palette.background.default,
          overflowX: 'hidden'
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />
        <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}

export default Layout;
