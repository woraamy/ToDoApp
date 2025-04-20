
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: [true, 'Task topic is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Done'], 
    default: 'To Do',
    required: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  listId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    default: null,
  },
}, { timestamps: true }); 

taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ userId: 1, listId: 1 });
taskSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);