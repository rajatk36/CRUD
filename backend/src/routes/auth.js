import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signJwtForUser } from '../middleware/auth.js';
import { registerSchema, loginSchema } from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password } = value;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, passwordHash });
    const token = signJwtForUser(user);

    res.status(201).json({ token, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = value;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signJwtForUser(user);
    res.json({ token, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
});

export default router;





