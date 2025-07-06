import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login
} from '../controllers/authController.js';

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

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

export default router;