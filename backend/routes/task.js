const express = require('express');
const Task = require('../models/Task');
const List = require('../models/List');
const mongoose = require('mongoose');
const router = express.Router();

const formatTaskResponse = (task) => {
    if (!task) return null;
    const listInfo = task.listId ? (task.listId.name !== undefined ? task.listId : null) : null;
    return {
        _id: task._id,
        topic: task.topic,
        description: task.description,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        status: task.status,
        userId: task.userId,
        listId: listInfo ? listInfo._id : null,
        listName: listInfo ? listInfo.name : null,
    };
};


// GET /api/tasks - Get all tasks for the user (optionally filter by list)
router.get('/', async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { listId } = req.query;

    const query = { userId: userId };

    if (listId) {
        if (listId === 'null') { // Special value to find tasks without a list
            query.listId = null;
        } else if (mongoose.Types.ObjectId.isValid(listId)) {
            // Optional: Verify user owns the list they are filtering by
             const listExists = await List.findOne({ _id: listId, userId: userId });
             if (!listExists) {
                 // Decide behaviour: error, or return empty list? Returning empty is safer.
                  return res.status(200).json([]);
                 // return res.status(404).json({ error: 'List not found or not owned by user' });
             }
            query.listId = listId;
        } else {
             return res.status(400).json({ error: 'Invalid list ID format for filtering' });
        }
    }

    const tasks = await Task.find(query)
                            .populate('listId', 'name') // Populate list name if listId exists
                            .sort({ createdAt: -1 });

    res.status(200).json(tasks.map(formatTaskResponse));
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks - Add a new task
// POST /api/tasks - Add a new task
router.post('/', async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { topic, description, listId } = req.body; // listId can be ObjectId string, "No List", null, or ""

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Task topic is required' });
    }
    if (description && typeof description !== 'string') {
       return res.status(400).json({ error: 'Description must be a string' });
    }

    let validListId = null;

    if (listId && listId !== "No List") {
        if (!mongoose.Types.ObjectId.isValid(listId)) {
             return res.status(400).json({ error: 'Invalid list ID format provided' });
        }

        const list = await List.findOne({ _id: listId, userId: userId });
        if (!list) {
            return res.status(404).json({ error: 'List not found or does not belong to the user' });
        }
        validListId = listId;
    }

    const newTask = new Task({
      topic: topic.trim(),
      description: description ? description.trim() : null,
      userId: userId,
      listId: validListId, 
    });

    const savedTask = await newTask.save();
    const populatedTask = await Task.findById(savedTask._id).populate('listId', 'name'); 
    res.status(201).json(formatTaskResponse(populatedTask)); 
  } catch (err) {
    next(err);
  }
});

// PUT /api/tasks/:id - Edit a task (topic, description, listId, status)
router.put('/:id', async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({ error: 'Invalid task ID format' });
    }

    const { topic, description, listId, status } = req.body;
    const updateData = {};
    let requiresListValidation = false;

    // Build update object and validate inputs
    if (topic !== undefined) {
        if (typeof topic !== 'string' || topic.trim().length === 0) return res.status(400).json({ error: 'Task topic cannot be empty' });
        updateData.topic = topic.trim();
    }
    if (description !== undefined) {
        if (description !== null && typeof description !== 'string') return res.status(400).json({ error: 'Description must be a string or null' });
        updateData.description = description === null ? null : description.trim();
    }
    if (status !== undefined) {
        if (!['To Do', 'In Progress', 'Done'].includes(status)) return res.status(400).json({ error: 'Invalid status value' });
        updateData.status = status;
    }
     if (listId !== undefined) {
        requiresListValidation = true; // Need to check listId validity below
        if (listId === null || listId === '') {
            updateData.listId = null;
        } else {
            if (!mongoose.Types.ObjectId.isValid(listId)) return res.status(400).json({ error: 'Invalid list ID format provided' });
            updateData.listId = listId; // Temporarily set, will validate next
        }
    }

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No update data provided' });
    }

     // Validate listId ownership if it's being changed to a non-null value
    if (requiresListValidation && updateData.listId !== null) {
        const list = await List.findOne({ _id: updateData.listId, userId: userId });
        if (!list) {
            return res.status(404).json({ error: 'List not found or does not belong to the user' });
        }
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, userId: userId }, // Verify ownership
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('listId', 'name');

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found or user not authorized' });
    }

    res.status(200).json(formatTaskResponse(updatedTask));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tasks/:id/status - Change task status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({ error: 'Invalid task ID format' });
    }

    const { status } = req.body;
    if (!status || !['To Do', 'In Progress', 'Done'].includes(status)) {
       return res.status(400).json({ error: 'Invalid or missing status value.' });
    }

     const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, userId: userId }, // Verify ownership
      { $set: { status: status } },
      { new: true, runValidators: true }
    ).populate('listId', 'name');

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found or user not authorized' });
    }

    res.status(200).json(formatTaskResponse(updatedTask));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({ error: 'Invalid task ID format' });
    }

    const result = await Task.deleteOne({ _id: taskId, userId: userId }); // Verify ownership

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Task not found or user not authorized' });
    }

    res.status(200).json({ message: 'Task deleted successfully', deletedTaskId: taskId });
  } catch (err) {
    next(err);
  }
});


module.exports = router;