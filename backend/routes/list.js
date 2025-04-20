
const express = require('express');
const List = require('../models/List');
const Task = require('../models/Task');
const mongoose = require('mongoose'); 
const router = express.Router();

// Note: ClerkExpressRequireAuth is applied in server.js, so req.auth exists here

// GET /api/lists - Get all lists for the authenticated user
router.get('/', async (req, res, next) => {
  try {
    const userId = req.auth.userId; // Provided by Clerk middleware
    const lists = await List.find({ userId: userId }).sort({ name: 1 });
    res.status(200).json(lists);
  } catch (err) {
    next(err);
  }
});

// POST /api/lists - Add a new list
router.post('/', async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'List name is required' });
    }

    const newList = new List({
      name: name.trim(),
      userId: userId,
    });

    const savedList = await newList.save();

    res.status(201).json(savedList);
  } catch (err) {
    next(err); // Let global error handler catch validation/duplicate errors
  }
});

// PUT /api/lists/:id - Edit a list name
router.put('/:id', async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const listId = req.params.id;
    const { name } = req.body;

    if (!mongoose.Types.ObjectId.isValid(listId)) {
        return res.status(400).json({ error: 'Invalid list ID format' });
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'List name is required' });
    }

    const updatedList = await List.findOneAndUpdate(
      { _id: listId, userId: userId }, // Verify ownership
      { $set: { name: name.trim() } },
      { new: true, runValidators: true }
    );

    if (!updatedList) {
      return res.status(404).json({ error: 'List not found or user not authorized' });
    }

    res.status(200).json(updatedList);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/lists/:id - Delete a list
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const listId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(listId)) {
        return res.status(400).json({ error: 'Invalid list ID format' });
    }

    // 1. Verify ownership and delete the list
    const deletedList = await List.findOneAndDelete({ _id: listId, userId: userId });

    if (!deletedList) {
      return res.status(404).json({ error: 'List not found or user not authorized' });
    }

    // 2. Update tasks associated with the deleted list
    await Task.updateMany(
      { userId: userId, listId: listId },
      { $set: { listId: null } }
    );

    res.status(200).json({ message: 'List deleted successfully and associated tasks updated.', deletedListId: listId });
  } catch (err) {
    next(err);
  }
});

module.exports = router;