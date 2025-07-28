import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { generateToken } from '../middleware/auth';
import Joi from 'joi';

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

export const register = async (req: Request, res: Response) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const existingUser = await UserModel.findByUsername(value.username);
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const user = await UserModel.create(value);
    await UserModel.initializeStatistics(user.id);
    
    const token = generateToken(user);
    
    res.status(201).json({
      user: {
        id: user.id,
        username: user.username
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await UserModel.findByUsername(value.username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await UserModel.validatePassword(value.password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    
    res.json({
      user: {
        id: user.id,
        username: user.username
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
