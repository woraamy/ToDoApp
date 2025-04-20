const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: [true, 'Todo text is required'],
    trim: true,
  },
  description: {
    type: String,
    required: false,
    trim: true,
  },
  listName: {
    type: String,
    require: false
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Done'],
    default: 'Pending',
  },
  userId: { 
    type: String,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
   }
});

TodoSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

 TodoSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: new Date() });
    next();
});


module.exports = mongoose.model('Todo', TodoSchema);