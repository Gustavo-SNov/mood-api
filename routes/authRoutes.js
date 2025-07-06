import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  refreshToken,
  logout,
  verifyToken,
  getProfile,
  updateProfile
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('O e-mail precisa ser válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha precisa ter ao minímo 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha precisa conter ao menos uma letra maiúscula, uma minúscula, e um número')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('E-mail inválido'),
  body('password')
    .notEmpty()
    .withMessage('Senha não informada')
];

const profileUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/verify', authenticateToken, verifyToken);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, profileUpdateValidation, updateProfile);

export default router;