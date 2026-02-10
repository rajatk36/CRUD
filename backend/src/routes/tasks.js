import express from 'express';
import Task from '../models/Task.js';
import { authRequired } from '../middleware/auth.js';
import { createTaskSchema, updateTaskSchema } from '../validators/taskValidators.js';

const router = express.Router();

router.get('/', authRequired, async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filter = { owner: req.user._id };

    if (status === 'completed') {
      filter.completed = true;
    } else if (status === 'pending') {
      filter.completed = false;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: regex }, { description: regex }];
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
});

router.post('/', authRequired, async (req, res, next) => {
  try {
    const { error, value } = createTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const task = await Task.create({ ...value, owner: req.user._id });
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authRequired, async (req, res, next) => {
  try {
    const { error, value } = updateTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: value },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ task });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;



