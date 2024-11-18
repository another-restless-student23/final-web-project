const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const router = express.Router();

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email from environment variables
    pass: process.env.EMAIL_PASS  // Your email password
  }
});

// Registration Route
router.post('/register', async (req, res) => {
  try {
    const { username, password, firstName, lastName, age, gender } = req.body;

    // Create and save the new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, firstName, lastName, age, gender });
    await user.save();

    // Send Welcome Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.username,
      subject: 'Welcome to Game Portfolio',
      text: `Welcome, ${firstName} ${lastName}! Thank you for registering.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
        // Inform the user that registration was successful but email failed
        res.status(201).send('User registered successfully, but there was an issue sending the welcome email.');
      } else {
        console.log('Email sent:', info.response);
        res.status(201).send('User registered successfully! Please check your email.');
      }
    });
    

    res.status(201).send('User registered successfully! Please check your email.');
  } catch (err) {
    res.status(500).send('Error registering user: ' + err.message);
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('Invalid credentials');
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Store the token in a cookie (for simplicity)
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/'); // Redirect to the home page
  } catch (err) {
    res.status(500).send('Error logging in: ' + err.message);
  }
});



module.exports = router;