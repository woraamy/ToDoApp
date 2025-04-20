
const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'List name is required'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Clerk User ID is a string
  userId: {
    type: String,
    required: true,
    index: true, // Index for faster lookups by user
  },
});
listSchema.index({ userId: 1, name: 1 }, { unique: true })

module.exports = mongoose.model('List', listSchema);