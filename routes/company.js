const express = require('express');
const axios = require('axios');
const Company = require('../models/company');
const checkRole = require('../middleware/middleware');

const router = express.Router();


// Create a new company
router.post('/company', async (req, res) => {
  try {
    const { name, founded, headquarters, stockSymbol } = req.body;
    const newCompany = new Company({ name, founded, headquarters, stockSymbol });
    await newCompany.save();
    res.status(201).json(newCompany);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all companies
router.get('/company', async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a company
router.put('/company/:id', checkRole('admin'), async (req, res) => {
  try {
    const updatedCompany = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedCompany);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch stock value for a company
router.get('/company/:id/stock', async (req, res) => {
    try {
      const company = await Company.findById(req.params.id);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
  
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      const stockSymbol = company.stockSymbol;
      const apiUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${apiKey}`;
  
      const response = await axios.get(apiUrl);
      console.log(response.data);  // Log the entire response to inspect it
      const stockData = response.data['Global Quote'];

  
      if (!stockData) {
        return res.status(404).json({ error: 'Stock data not found' });
      }
  
      res.status(200).json({
        symbol: stockData['01. symbol'],
        price: stockData['05. price'],
        change: stockData['09. change'],
        changePercent: stockData['10. change percent']
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

// Fetch and visualize stock data
router.get('/company/:id/visualize', async (req, res) => {
    try {
      const company = await Company.findById(req.params.id);
      if (!company) {
        return res.status(404).send('Company not found');
      }
  
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      const stockSymbol = company.stockSymbol;
      const apiUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${apiKey}`;
  
      const response = await axios.get(apiUrl);
      const stockData = response.data['Global Quote'];
  
      if (!stockData) {
        return res.status(404).send('Stock data not found');
      }
  
      res.render('stock', {
        company,
        stockData: {
          price: stockData['05. price'],
          change: stockData['09. change']
        }
      });
    } catch (err) {
      res.status(500).send('Error fetching stock data: ' + err.message);
    }
});

// Delete a company
router.delete('/company/:id', checkRole('admin'), async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.id);
    res.status(200).send('Company deleted successfully');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
