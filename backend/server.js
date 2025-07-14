const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Get MongoDB URI based on environment
const MONGO_URI = process.env.NODE_ENV === 'production' 
  ? process.env.MONGODB_URI_PRODUCTION 
  : process.env.MONGODB_URI;

// Get Frontend URL based on environment
const frontendUrl = process.env.NODE_ENV === 'production'
  ? process.env.FRONTEND_URL_PRODUCTION
  : process.env.FRONTEND_URL;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware
app.use(cors({
  origin: frontendUrl,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
require('./config/passport-setup')();
app.use(passport.initialize());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
// Add other routes as needed

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'Error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Environment indicator
app.get('/api/status', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    server: 'E-Commerce API',
    status: 'active'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`));