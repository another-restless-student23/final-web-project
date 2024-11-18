const express = require('express');
const axios = require('axios');
const Company = require('../models/company');
const checkRole = require('../middleware/middleware');
const Game = require('../models/game'); // Import the Game model

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
    const role = req.user ? req.user.role : 'guest'; // Set role to 'guest' if no user
    const companies = await Company.find();
    res.render('companyList', { companies, role }); // Pass both companies and role
  } catch (err) {
    res.status(500).send('Error fetching companies: ' + err.message);
  }
});



router.get('/company/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).send('Company not found');
    }

    // Fetch games associated with the company
    const games = await Game.find({ company: company._id });

    // Collect images from all games
    let images = [];
    games.forEach(game => {
      if (Array.isArray(game.images)) {
        images = images.concat(game.images);
      }
    });

    // Fetch stock data (same as before)
    let stockData = { labels: [], prices: [] };
    if (company.stockSymbol) {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${company.stockSymbol}&apikey=${apiKey}`;
      const response = await axios.get(apiUrl);
      const timeSeries = response.data['Time Series (Daily)'];

      if (timeSeries) {
        stockData.labels = Object.keys(timeSeries).slice(0, 10).reverse();
        stockData.prices = Object.values(timeSeries).slice(0, 10).map(day => parseFloat(day['4. close'])).reverse();
      }
    }

    // Render the view and pass the images and stock data
    res.render('companyDetails', { company, stockData, images });
  } catch (err) {
    res.status(500).send('Error fetching company details: ' + err.message);
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

      if (!company.stockSymbol) {
        stockData = null; // Or provide a fallback
      }
  
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
