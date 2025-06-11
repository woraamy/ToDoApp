const Task = require('../models/Task');
const List = require('../models/List');
const mongoose = require('mongoose');

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

class TaskService {
    static async getAllTasks(userId, listId = null) {
        const query = { userId };

        if (listId) {
            if (listId === 'null') {
                query.listId = null;
            } else if (mongoose.Types.ObjectId.isValid(listId)) {
                const listExists = await List.findOne({ _id: listId, userId });
                if (!listExists) {
                    return [];
                }
                query.listId = listId;
            } else {
                throw new Error('Invalid list ID format for filtering');
            }
        }

        const tasks = await Task.find(query)
                                .populate('listId', 'name')
                                .sort({ createdAt: -1 });

        return tasks.map(formatTaskResponse);
    }

    static async createTask(userId, { topic, description, listId }) {
        if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
            throw new Error('Task topic is required');
        }
        if (description && typeof description !== 'string') {
            throw new Error('Description must be a string');
        }

        let validListId = null;

        if (listId && listId !== "No List") {
            if (!mongoose.Types.ObjectId.isValid(listId)) {
                throw new Error('Invalid list ID format provided');
            }

            const list = await List.findOne({ _id: listId, userId });
            if (!list) {
                throw new Error('List not found or does not belong to the user');
            }
            validListId = listId;
        }

        const newTask = new Task({
            topic: topic.trim(),
            description: description ? description.trim() : null,
            userId,
            listId: validListId,
        });

        const savedTask = await newTask.save();
        const populatedTask = await Task.findById(savedTask._id).populate('listId', 'name');
        return formatTaskResponse(populatedTask);
    }

    static async updateTask(userId, taskId, updateData) {
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            throw new Error('Invalid task ID format');
        }

        const processedUpdateData = {};
        let requiresListValidation = false;

        if (updateData.topic !== undefined) {
            if (typeof updateData.topic !== 'string' || updateData.topic.trim().length === 0) {
                throw new Error('Task topic cannot be empty');
            }
            processedUpdateData.topic = updateData.topic.trim();
        }

        if (updateData.description !== undefined) {
            if (updateData.description !== null && typeof updateData.description !== 'string') {
                throw new Error('Description must be a string or null');
            }
            processedUpdateData.description = updateData.description === null ? null : updateData.description.trim();
        }

        if (updateData.status !== undefined) {
            if (!['To Do', 'In Progress', 'Done'].includes(updateData.status)) {
                throw new Error('Invalid status value');
            }
            processedUpdateData.status = updateData.status;
        }

        if (updateData.listId !== undefined) {
            requiresListValidation = true;
            if (updateData.listId === null || updateData.listId === '') {
                processedUpdateData.listId = null;
            } else {
                if (!mongoose.Types.ObjectId.isValid(updateData.listId)) {
                    throw new Error('Invalid list ID format provided');
                }
                processedUpdateData.listId = updateData.listId;
            }
        }

        if (Object.keys(processedUpdateData).length === 0) {
            throw new Error('No update data provided');
        }

        if (requiresListValidation && processedUpdateData.listId !== null) {
            const list = await List.findOne({ _id: processedUpdateData.listId, userId });
            if (!list) {
                throw new Error('List not found or does not belong to the user');
            }
        }

        const updatedTask = await Task.findOneAndUpdate(
            { _id: taskId, userId },
            { $set: processedUpdateData },
            { new: true, runValidators: true }
        ).populate('listId', 'name');

        if (!updatedTask) {
            throw new Error('Task not found or user not authorized');
        }

        return formatTaskResponse(updatedTask);
    }

    static async updateTaskStatus(userId, taskId, status) {
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            throw new Error('Invalid task ID format');
        }

        if (!status || !['To Do', 'In Progress', 'Done'].includes(status)) {
            throw new Error('Invalid or missing status value');
        }

        const updatedTask = await Task.findOneAndUpdate(
            { _id: taskId, userId },
            { $set: { status } },
            { new: true, runValidators: true }
        ).populate('listId', 'name');

        if (!updatedTask) {
            throw new Error('Task not found or user not authorized');
        }

        return formatTaskResponse(updatedTask);
    }

    static async deleteTask(userId, taskId) {
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            throw new Error('Invalid task ID format');
        }

        const result = await Task.deleteOne({ _id: taskId, userId });

        if (result.deletedCount === 0) {
            throw new Error('Task not found or user not authorized');
        }

        return { message: 'Task deleted successfully', deletedTaskId: taskId };
    }
}

module.exports = TaskService;