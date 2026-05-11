import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, useTheme
} from '@mui/material';
import { WarningAmber } from '@mui/icons-material';

function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmText = 'Confirm', confirmColor = 'error' }) {
  const theme = useTheme();
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmber sx={{ color: theme.palette[confirmColor]?.main || theme.palette.error.main }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onCancel} variant="outlined" sx={{ borderRadius: 2, flex: 1 }}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor} sx={{ borderRadius: 2, flex: 1 }}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;
