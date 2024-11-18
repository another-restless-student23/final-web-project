const express = require('express');
const Game = require('../models/game');
const checkRole = require('../middleware/middleware');

const router = express.Router();


// Create a new game
router.post('/game', async (req, res) => {
  try {
    const { title, releaseDate, genre, description, company, images } = req.body;
    const newGame = new Game({ title, releaseDate, genre, description, company, images });
    await newGame.save();
    res.status(201).json(newGame);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all games
router.get('/game', async (req, res) => {
  try {
    const games = await Game.find().populate('company');  // Populate company details
    res.status(200).json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a game
router.put('/game/:id', checkRole('admin'), async (req, res) => {
  try {
    const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedGame);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a game
router.delete('/game/:id', checkRole('admin'), async (req, res) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    res.status(200).send('Game deleted successfully');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;