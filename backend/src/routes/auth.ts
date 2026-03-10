import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generateToken } from '../utils/generateToken';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// POST /api/v1/auth/register - Register a new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/v1/auth/login - Authenticate a user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Need to explicitly select password because it's hidden by default in the schema
    const user = await User.findOne({ email }).select('+password');

    if (user && (await bcrypt.compare(password, user.password!))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/v1/auth/me - Get current user profile
router.get('/me', protect, async (req: Request, res: Response) => {
  try {
    // The protect middleware handles verifying the token and attaching the user object
    res.json((req as any).user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
