const Task = require('../models/task');

exports.createTask = async (req, res) => {
    try {
        const { title, description, assignedTo, dueDate, priority } = req.body;
        const task = await Task.create({
            title,
            description,
            assignedTo,
            assignedBy: req.user._id,
            dueDate,
            priority
        });
        res.status(201).json({ success: true, task });
    } catch (error) {
        console.error('Create Task Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getMyTasks = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { assignedTo: req.user._id };
        if (status) filter.status = status;

        const tasks = await Task.find(filter)
            .populate('assignedBy', 'name role')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: tasks.length, tasks });
    } catch (error) {
        console.error('Get My Tasks Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const update = { status };
        if (status === 'Completed') update.completedAt = new Date();

        const task = await Task.findOneAndUpdate(
            { _id: id, assignedTo: req.user._id },
            { $set: update },
            { new: true }
        );
        if (!task) return res.status(404).json({ message: 'Task not found or not authorized' });
        res.status(200).json({ success: true, task });
    } catch (error) {
        console.error('Update Task Status Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
