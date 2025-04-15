
const express = require('express');
const Todo = require('../models/Todo');
const router = express.Router();

// Get all todo list
router.get('/', async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    if (!userId) {
       return res.status(401).json({ error: 'User not authenticated' });
    }
    const todos = await Todo.find({ userId: userId }).sort({ createdAt: -1 }); 
    res.status(200).json(todos);
  } catch (err) {
     next(err); 
  }
});

// Add new todo
router.post('/', async (req, res, next) => {
  try {
    const userId = req.auth.userId;
     if (!userId) {
       return res.status(401).json({ error: 'User not authenticated' });
    }
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Todo text is required' });
    }

    const newTodo = new Todo({
      text: text,
      userId: userId, 
      status: "Pending"
    });

    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
     next(err);
  }
});

// Update todo status
router.put('/:id', async (req, res, next) => {
  try {
    const userId = req.auth.userId;
     if (!userId) {
       return res.status(401).json({ error: 'User not authenticated' });
    }
    const { id } = req.params;
    const { status } = req.body; 

    if (!status || !['Pending', 'In Progress', 'Done'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status provided.' });
    }

    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: id, userId: userId }, 
      { status: status },         
      { new: true, runValidators: true } 
    );

    if (!updatedTodo) {
      return res.status(404).json({ error: 'Todo not found or user not authorized' });
    }

    res.status(200).json(updatedTodo);
  } catch (err) {
     next(err);
  }
});

// Delete todo 
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.auth.userId;
     if (!userId) {
       return res.status(401).json({ error: 'User not authenticated' });
    }
    const { id } = req.params;

    const deletedTodo = await Todo.findOneAndDelete({ _id: id, userId: userId });

    if (!deletedTodo) {
      return res.status(404).json({ error: 'Todo not found or user not authorized' });
    }

    res.status(200).json({ message: 'Todo deleted successfully', deletedId: id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;