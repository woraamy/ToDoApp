
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node'); // Import Clerk middleware

require('dotenv').config();

const listRoutes = require('./routes/lists');
const taskRoutes = require('./routes/tasks');

const app = express();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todoAppClerk';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(ClerkExpressRequireAuth());

app.use('/api/lists', listRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/api/hello', (req, res) => {
  res.json({ message: `Hello user ${req.auth.userId}` });
});

app.use((req, res, next) => {
  res.status(404).json({ error: 'Resource not found' });
});

app.use((err, req, res, next) => {
  console.error("Global Error Handler Caught:", err);

  // Handle Clerk errors specifically if needed
  if (err.name === 'ClerkAPIError') {
    return res.status(err.status || 500).json({ error: err.message, issues: err.errors });
  }
  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
  }
   // Handle Mongoose Cast Errors (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
     return res.status(400).json({ error: `Invalid ID format for field ${err.path}` });
  }
    // Handle Duplicate Key Errors (e.g., unique index violation)
  if (err.code === 11000) {
     return res.status(409).json({ error: `Duplicate key error: A record with this value already exists.` });
  }


  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Include stack trace in development
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Ensure CLERK_SECRET_KEY and MONGODB_URI are set in your environment.`);
});