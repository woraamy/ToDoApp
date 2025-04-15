// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const todoRoutes = require('./routes/todos');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json()); 

app.use('/api/todos', ClerkExpressRequireAuth(), todoRoutes);

 app.use((err, req, res, next) => {
    console.error(err.stack);
    // Handle Clerk authentication errors specifically
    if (err.message && (err.message.includes('Unauthenticated') || err.message.includes('Unauthorized'))) {
        return res.status(401).json({ error: 'Authentication required.' });
    }
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    // Generic server error
    res.status(500).json({ error: 'Something went wrong!' });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    // Start server only after DB connection is successful
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if DB connection fails
  });