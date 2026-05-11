import React, { useState } from 'react';
import { 
  Box, Paper, TextField, Button, Typography, Link, Alert, 
  Container, InputAdornment, IconButton, Fade, Slide, useTheme,
  Divider, Chip
} from '@mui/material';
import { 
  Email, Lock, Visibility, VisibilityOff, Store, 
  Google, GitHub, ArrowForward, Security
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${user.username}!`);
      if (user.role === 'admin' || user.role === 'manager') {
        navigate('/');
      } else {
        navigate('/shop');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Check your credentials.');
    }
    setLoading(false);
  };

  const handleDemoLogin = (role) => {
    if (role === 'admin') {
      setFormData({ email: 'admin@gmail.com', password: '123456' });
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        animation: 'float 20s ease-in-out infinite'
      }
    }}>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
        `}
      </style>
      
      <Box sx={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
        <ThemeToggle />
      </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Paper 
            elevation={0} 
            sx={{
              borderRadius: 6,
              overflow: 'hidden',
              background: theme.palette.mode === 'dark'
                ? 'rgba(30, 41, 59, 0.8)'
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
          >
            <Slide direction="down" in timeout={600}>
              <Box sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                p: 5,
                textAlign: 'center',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
                }
              }}>
                <Box sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  mb: 2,
                  backdropFilter: 'blur(10px)'
                }}>
                  <Store sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h3" sx={{ 
                  color: 'white', 
                  fontWeight: 700,
                  mb: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  InventoryPro
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: '1.1rem'
                }}>
                  Smart Inventory Management
                </Typography>
              </Box>
            </Slide>
            
            <Slide direction="up" in timeout={800}>
              <Box sx={{ p: 5 }}>
                {/* removed inline Alert — toasts handle errors */}
                
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: theme.palette.primary.main }} />
                        </InputAdornment>
                      )
                    }}
                    required
                  />
                  
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    sx={{ mb: 4 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: theme.palette.primary.main }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton 
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    required
                  />
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    endIcon={!loading && <ArrowForward />}
                    sx={{
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      mb: 3,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      boxShadow: `0 8px 32px ${theme.palette.primary.main}40`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 12px 40px ${theme.palette.primary.main}60`
                      },
                      '&:disabled': {
                        background: theme.palette.action.disabledBackground
                      }
                    }}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                  
                  <Divider sx={{ my: 3 }}>
                    <Chip 
                      label="Quick Access" 
                      size="small" 
                      sx={{ 
                        bgcolor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`
                      }} 
                    />
                  </Divider>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    startIcon={<Security />}
                    onClick={() => handleDemoLogin('admin')}
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      borderWidth: 2,
                      mb: 4,
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-1px)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                  >
                    Demo Admin Access
                  </Button>
                  
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      New to InventoryPro?{' '}
                      <Link 
                        href="/register"
                        sx={{ 
                          color: theme.palette.primary.main,
                          textDecoration: 'none',
                          fontWeight: 600,
                          '&:hover': { 
                            textDecoration: 'underline',
                            color: theme.palette.primary.dark
                          }
                        }}
                      >
                        Create Account
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Slide>
          </Paper>
        </Fade>
      </Container>
      </Box>

      <Footer />
    </Box>
  );
}

export default Login;