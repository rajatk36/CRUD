import express from 'express';
import bcrypt from 'bcryptjs';
import { authRequired } from '../middleware/auth.js';
import { changePasswordSchema } from '../validators/authValidators.js';

const router = express.Router();

router.get('/me', authRequired, async (req, res, next) => {
  try {
    res.json({ user: req.user.toJSON() });
  } catch (err) {
    next(err);
  }
});

router.put('/me', authRequired, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }
    req.user.name = name.trim();
    await req.user.save();
    res.json({ user: req.user.toJSON() });
  } catch (err) {
    next(err);
  }
});

router.post('/me/password', authRequired, async (req, res, next) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { currentPassword, newPassword } = value;

    const isMatch = await bcrypt.compare(currentPassword, req.user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    req.user.passwordHash = await bcrypt.hash(newPassword, salt);
    await req.user.save();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
