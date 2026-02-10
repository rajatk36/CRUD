import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

export const authRequired = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const signJwtForUser = (user) => {
  const payload = {
    sub: user._id.toString(),
    email: user.email,
  };
  const options = {
    expiresIn: '7d',
  };
  return jwt.sign(payload, JWT_SECRET, options);
};





