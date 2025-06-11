const handleServiceError = (err, res) => {
    const errorMessages = {
        'Invalid list ID format for filtering': 400,
        'Task topic is required': 400,
        'Description must be a string': 400,
        'Invalid list ID format provided': 400,
        'Invalid task ID format': 400,
        'Task topic cannot be empty': 400,
        'Description must be a string or null': 400,
        'Invalid status value': 400,
        'No update data provided': 400,
        'Invalid or missing status value': 400,
        'List not found or does not belong to the user': 404,
        'Task not found or user not authorized': 404
    };

    const statusCode = errorMessages[err.message];
    if (statusCode) {
        return res.status(statusCode).json({ error: err.message });
    }

    throw err;
};

module.exports = {
    handleServiceError
};