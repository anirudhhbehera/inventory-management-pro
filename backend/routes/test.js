const express = require('express');
const router = express.Router();

// Test endpoint
router.get('/ping', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date() });
});

module.exports = router;