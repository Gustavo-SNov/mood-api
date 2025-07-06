import { generateTokens } from "../config/jwt.js";
import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { validationResult } from "express-validator";

// Register new user
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0]?.msg || "A validação falhou",
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        message: "Não é possível criar um usuário com esse e-mail",
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
      user: user.toJSON(),
      token: accessToken,
      refreshToken,
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
        message: errors.array()[0]?.msg || "A validação falhou",
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        message: "Credenciais inválidas",
      });
    }

    // Verify password
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Credenciais inválidas",
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Clean up old refresh tokens and save new one
    await RefreshToken.deleteByUserId(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await RefreshToken.create(user.id, refreshToken, expiresAt);

    res.json({
      user: user.toJSON(),
      token: accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};
