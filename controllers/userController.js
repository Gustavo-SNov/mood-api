import { generateTokens } from "../config/jwt.js";
import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { validationResult } from "express-validator";

// Refresh token
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token não informado",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find refresh token in database
    const storedToken = await RefreshToken.findByToken(refreshToken);
    if (!storedToken || storedToken.isExpired()) {
      return res.status(401).json({
        message: "Token de refresh inválido ou expirado",
      });
    }

    // Generate new access token
    const { accessToken } = generateTokens(decoded.userId);

    res.json({
      token: accessToken,
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

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

// Verify token
export const verifyToken = async (req, res, next) => {
  try {
    // Token is already verified by auth middleware
    res.json({
      user: req.user,
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
        message: "Usuário não encontrado",
      });
    }

    res.json(user.toJSON());
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
        message: errors.array()[0]?.msg || "A validação falhou",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado",
      });
    }

    await user.update(req.body);
    res.sendStatus(200);
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
        message: "Usuário não encontrado",
      });
    }

    // Delete the user from the database
    await user.delete();

    await RefreshToken.deleteByUserId(req.user.id);

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
