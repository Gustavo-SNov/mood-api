import express from "express";
import { body } from "express-validator";
import {
  refreshToken,
  logout,
  verifyToken,
  getProfile,
  updateProfile,
  deleteAccount,
} from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Validation rules
const profileUpdateValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Nome deve ter entre 2 e 50 caracteres"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("E-mail inválido"),
];

// Routes
router.get("/", authenticateToken, getProfile);
router.put("/", authenticateToken, profileUpdateValidation, updateProfile);
router.delete("/", authenticateToken, deleteAccount);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/verify", authenticateToken, verifyToken);

export default router;
