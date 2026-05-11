import React from 'react';
import { Box, Typography, IconButton, Divider, Tooltip, useTheme } from '@mui/material';
import { GitHub, LinkedIn, Language, FolderSpecial } from '@mui/icons-material';

const socialLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/anirudhhbehera',
    icon: <GitHub fontSize="small" />,
    color: '#6e7681'
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/anirudhhbehera/',
    icon: <LinkedIn fontSize="small" />,
    color: '#0a66c2'
  },
  {
    label: 'Portfolio',
    href: 'https://anirudhh.vercel.app/',
    icon: <Language fontSize="small" />,
    color: '#6366f1'
  },
  {
    label: 'Projects',
    href: 'https://github.com/anirudhhbehera?tab=repositories',
    icon: <FolderSpecial fontSize="small" />,
    color: '#10b981'
  }
];

function Footer() {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        pt: 3,
        pb: { xs: 2.5, sm: 2 },
        px: { xs: 2, sm: 4 },
        borderTop: `1px solid ${theme.palette.divider}`,
        background: isDark
          ? 'linear-gradient(135deg, rgba(15,23,42,0.8) 0%, rgba(30,41,59,0.9) 100%)'
          : 'linear-gradient(135deg, rgba(248,250,252,0.9) 0%, rgba(241,245,249,1) 100%)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Top row: branding + social icons */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2
        }}
      >
        {/* Branding */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '0.85rem', lineHeight: 1 }}>
              IP
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                lineHeight: 1.2
              }}
            >
              InventoryPro
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
              Built by Anirudhh Behera
            </Typography>
          </Box>
        </Box>

        {/* Social Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {socialLinks.map((link) => (
            <Tooltip key={link.label} title={link.label} arrow>
              <IconButton
                component="a"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: link.color,
                    bgcolor: `${link.color}15`,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {link.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </Box>

      <Divider sx={{ mb: 2, opacity: 0.5 }} />

      {/* Bottom row: links + copyright */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 1.5, sm: 0 }
        }}
      >
        {/* Quick links */}
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 2, sm: 3 },
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}
        >
          {socialLinks.map((link) => (
            <Typography
              key={link.label}
              component="a"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.2s ease',
                '&:hover': { color: link.color }
              }}
            >
              {link.label}
            </Typography>
          ))}
        </Box>

        {/* Copyright */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: { xs: 'center', sm: 'right' }, flexShrink: 0 }}
        >
          © {currentYear} Anirudhh Behera. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}

export default Footer;
