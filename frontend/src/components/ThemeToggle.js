import React from 'react';
import { IconButton, Tooltip, Box, useTheme as useMuiTheme } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

function ThemeToggle() {
  const { darkMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();

  return (
    <Tooltip 
      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      arrow
      placement="bottom"
    >
      <Box sx={{ position: 'relative' }}>
        <IconButton 
          onClick={toggleTheme}
          sx={{
            width: 48,
            height: 48,
            background: darkMode 
              ? `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`
              : `linear-gradient(135deg, ${muiTheme.palette.warning.main} 0%, ${muiTheme.palette.warning.light} 100%)`,
            color: 'white',
            border: `2px solid ${muiTheme.palette.divider}`,
            backdropFilter: 'blur(10px)',
            boxShadow: darkMode
              ? `0 8px 32px ${muiTheme.palette.primary.main}40`
              : `0 8px 32px ${muiTheme.palette.warning.main}40`,
            '&:hover': {
              background: darkMode
                ? `linear-gradient(135deg, ${muiTheme.palette.primary.light} 0%, ${muiTheme.palette.secondary.light} 100%)`
                : `linear-gradient(135deg, ${muiTheme.palette.warning.light} 0%, ${muiTheme.palette.warning.main} 100%)`,
              transform: 'scale(1.1) rotate(10deg)',
              boxShadow: darkMode
                ? `0 12px 40px ${muiTheme.palette.primary.main}60`
                : `0 12px 40px ${muiTheme.palette.warning.main}60`
            },
            '&:active': {
              transform: 'scale(0.95)'
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '& .MuiSvgIcon-root': {
              fontSize: '1.5rem',
              transition: 'all 0.3s ease',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }
          }}
        >
          {darkMode ? (
            <LightMode sx={{ 
              animation: 'spin 0.5s ease-in-out',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(180deg)' }
              }
            }} />
          ) : (
            <DarkMode sx={{
              animation: 'spin 0.5s ease-in-out',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(180deg)' }
              }
            }} />
          )}
        </IconButton>
        
        {/* Glow effect */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: darkMode
              ? `radial-gradient(circle, ${muiTheme.palette.primary.main}20 0%, transparent 70%)`
              : `radial-gradient(circle, ${muiTheme.palette.warning.main}20 0%, transparent 70%)`,
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.5 },
              '50%': { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 0.8 }
            },
            pointerEvents: 'none',
            zIndex: -1
          }}
        />
      </Box>
    </Tooltip>
  );
}

export default ThemeToggle;