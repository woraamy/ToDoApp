const mongoose = require('mongoose');

const validateObjectId = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: `Invalid ${paramName} format` });
        }
        next();
    };
};

const validateTaskInput = (req, res, next) => {
    const { topic, description } = req.body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
        return res.status(400).json({ error: 'Task topic is required' });
    }

    if (description && typeof description !== 'string') {
        return res.status(400).json({ error: 'Description must be a string' });
    }

    next();
};

const validateStatusInput = (req, res, next) => {
    const { status } = req.body;
    
    if (!status || !['To Do', 'In Progress', 'Done'].includes(status)) {
        return res.status(400).json({ error: 'Invalid or missing status value' });
    }

    next();
};

module.exports = {
    validateObjectId,
    validateTaskInput,
    validateStatusInput
};