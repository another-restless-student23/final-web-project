const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const isAuthenticated = require('./middleware/isAuthenticated'); // Corrected path

const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/company');
const gameRoutes = require('./routes/game');

// Initialize app and dotenv
dotenv.config();
const app = express();

// Use EJS Layouts
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layout'); // Correctly specify the layout file

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  const role = req.user ? req.user.role : 'guest'; // Default to 'guest' if no user
  res.render('index', { role });
});

app.get('/company/add', isAuthenticated, (req, res) => {
  const role = req.user ? req.user.role : 'guest';
  res.render('addCompany', { role });
});

app.get('/game/add', isAuthenticated, (req, res) => {
  const role = req.user ? req.user.role : 'guest';
  res.render('addGame', { role });
});

app.get('/login', (req, res) => {
  const role = 'guest'; // Default role for unauthenticated users
  res.render('login', { role });
});


app.get('/register', (req, res) => {
  const role = 'guest'; // Default role for unauthenticated users
  res.render('register', { role });
});



// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

// Use routes
app.use('/', authRoutes);
app.use('/', companyRoutes);
app.use('/', gameRoutes);

// Listen on port 3000
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
