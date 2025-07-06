import express from 'express';
import { body } from 'express-validator';
import {getMoods, getMood, createMood, updateMood, deleteMood, getAnalytics, getTrends} from '../controllers/moodController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all mood routes
router.use(authenticateToken);

// Validation rules
const moodValidation = [
  body('rating')
    .isInt({ min: 1, max: 10 })
    .withMessage('Mood value must be between 1 and 10'),
  body('emotions')
    .optional()
    .isArray()
    .withMessage('Emotions must be an array'),
  body('note')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('note cannot exceed 1000 characters'),
  body('activities')
    .optional()
    .isArray()
    .withMessage('Activities must be an array'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in ISO format (YYYY-MM-DD)')
];

const moodUpdateValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Mood value must be between 1 and 10'),
  body('emotions')
    .optional()
    .isArray()
    .withMessage('Emotions must be an array'),
  body('note')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('note cannot exceed 1000 characters'),
  body('activities')
    .optional()
    .isArray()
    .withMessage('Activities must be an array')
];

router.get('/', getMoods);
router.post('/', moodValidation, createMood);
router.get('/analytics', getAnalytics);
router.get('/trends', getTrends);
router.get('/:id', getMood);
router.put('/:id', moodUpdateValidation, updateMood);
router.delete('/:id', deleteMood);

export default router;