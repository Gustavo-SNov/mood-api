import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { validationResult } from 'express-validator';

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

// Register new user
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Falha na validação',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Já existe um usuário com este email'
      });
    }

    // Create new user
    const user = await User.create({ name, email, password });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Save refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await RefreshToken.create(user.id, refreshToken, expiresAt);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        token: accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Falha na validação',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verify password
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Clean up old refresh tokens and save new one
    await RefreshToken.deleteByUserId(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await RefreshToken.create(user.id, refreshToken, expiresAt);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token: accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token é obrigatório'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find refresh token in database
    const storedToken = await RefreshToken.findByToken(refreshToken);
    if (!storedToken || storedToken.isExpired()) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido ou expirado'
      });
    }

    // Generate new access token
    const { accessToken } = generateTokens(decoded.userId);

    res.json({
      success: true,
      message: 'Token atualizado com sucesso',
      data: {
        token: accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const storedToken = await RefreshToken.findByToken(refreshToken);
      if (storedToken) {
        await storedToken.delete();
      }
    }

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

// Verify token
export const verifyToken = async (req, res, next) => {
  try {
    // Token is already verified by auth middleware
    res.json({
      success: true,
      message: 'Token válido',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Perfil obtido com sucesso',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Falha na validação',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const updatedUser = await user.update(req.body);

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        user: updatedUser.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete user account
export const deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Delete all refresh tokens associated with the user
    await RefreshToken.deleteByUserId(req.user.id);
    
    // Delete the user
    await user.delete();

    res.json({
      success: true,
      message: 'Conta deletada com sucesso'
    });
  } catch (error) {
    next(error);
  }
};