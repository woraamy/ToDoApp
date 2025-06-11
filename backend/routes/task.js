const express = require('express');
const TaskService = require('../services/taskService');
const { validateObjectId, validateTaskInput, validateStatusInput } = require('../middleware/validation');
const { handleServiceError } = require('../middleware/errorHandler');
const router = express.Router();


// GET /api/tasks - Get all tasks for the user (optionally filter by list)
router.get('/', async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { listId } = req.query;

    const tasks = await TaskService.getAllTasks(userId, listId);
    res.status(200).json(tasks);
  } catch (err) {
    try {
      handleServiceError(err, res);
    } catch (handlerErr) {
      next(handlerErr);
    }
  }
});

// POST /api/tasks - Add a new task
router.post('/', async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { topic, description, listId } = req.body;

    const newTask = await TaskService.createTask(userId, { topic, description, listId });
    res.status(201).json(newTask);
  } catch (err) {
    try {
      handleServiceError(err, res);
    } catch (handlerErr) {
      next(handlerErr);
    }
  }
});

// PUT /api/tasks/:id - Edit a task (topic, description, listId, status)
router.put('/:id', validateObjectId('id'), async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const taskId = req.params.id;
    const { topic, description, listId, status } = req.body;

    const updatedTask = await TaskService.updateTask(userId, taskId, { topic, description, listId, status });
    res.status(200).json(updatedTask);
  } catch (err) {
    try {
      handleServiceError(err, res);
    } catch (handlerErr) {
      next(handlerErr);
    }
  }
});

// PATCH /api/tasks/:id/status - Change task status
router.patch('/:id/status', validateObjectId('id'), validateStatusInput, async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const taskId = req.params.id;
    const { status } = req.body;

    const updatedTask = await TaskService.updateTaskStatus(userId, taskId, status);
    res.status(200).json(updatedTask);
  } catch (err) {
    try {
      handleServiceError(err, res);
    } catch (handlerErr) {
      next(handlerErr);
    }
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', validateObjectId('id'), async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const taskId = req.params.id;

    const result = await TaskService.deleteTask(userId, taskId);
    res.status(200).json(result);
  } catch (err) {
    try {
      handleServiceError(err, res);
    } catch (handlerErr) {
      next(handlerErr);
    }
  }
});


module.exports = router;