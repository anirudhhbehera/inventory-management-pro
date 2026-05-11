const express = require('express');
const Supplier = require('../models/Supplier');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find().populate('products');
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;