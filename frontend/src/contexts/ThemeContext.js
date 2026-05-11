import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const CustomThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { 
        main: darkMode ? '#6366f1' : '#4f46e5',
        light: darkMode ? '#818cf8' : '#6366f1',
        dark: darkMode ? '#4338ca' : '#3730a3',
        contrastText: '#ffffff'
      },
      secondary: { 
        main: darkMode ? '#06b6d4' : '#0891b2',
        light: darkMode ? '#22d3ee' : '#06b6d4',
        dark: darkMode ? '#0e7490' : '#0c4a6e'
      },
      success: {
        main: darkMode ? '#10b981' : '#059669',
        light: darkMode ? '#34d399' : '#10b981',
        dark: darkMode ? '#047857' : '#065f46'
      },
      warning: {
        main: darkMode ? '#f59e0b' : '#d97706',
        light: darkMode ? '#fbbf24' : '#f59e0b',
        dark: darkMode ? '#b45309' : '#92400e'
      },
      error: {
        main: darkMode ? '#ef4444' : '#dc2626',
        light: darkMode ? '#f87171' : '#ef4444',
        dark: darkMode ? '#b91c1c' : '#991b1b'
      },
      background: {
        default: darkMode ? '#0f172a' : '#f8fafc',
        paper: darkMode ? '#1e293b' : '#ffffff'
      },
      text: {
        primary: darkMode ? '#f1f5f9' : '#1e293b',
        secondary: darkMode ? '#94a3b8' : '#64748b'
      },
      divider: darkMode ? '#334155' : '#e2e8f0'
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700, fontSize: '2.5rem' },
      h2: { fontWeight: 600, fontSize: '2rem' },
      h3: { fontWeight: 600, fontSize: '1.75rem' },
      h4: { fontWeight: 600, fontSize: '1.5rem' },
      h5: { fontWeight: 500, fontSize: '1.25rem' },
      h6: { fontWeight: 500, fontSize: '1.125rem' },
      button: { fontWeight: 500, textTransform: 'none' }
    },
    shape: {
      borderRadius: 12
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            boxShadow: darkMode 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
            }
          },
          contained: {
            background: darkMode 
              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
              : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            '&:hover': {
              background: darkMode
                ? 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)'
                : 'linear-gradient(135deg, #3730a3 0%, #6d28d9 100%)'
            }
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: darkMode
                ? '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
                : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? '#6366f1' : '#4f46e5'
                }
              },
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: 2
                }
              }
            }
          }
        }
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '4px 8px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: darkMode ? '#374151' : '#f1f5f9',
              transform: 'translateX(4px)'
            },
            '&.Mui-selected': {
              backgroundColor: darkMode ? '#4338ca' : '#e0e7ff',
              '&:hover': {
                backgroundColor: darkMode ? '#3730a3' : '#c7d2fe'
              }
            }
          }
        }
      }
    }
  });

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};