import express from 'express';
import { body } from 'express-validator';
import {getMoods, getMood, createMood, updateMood, deleteMood, getAnalytics} from '../controllers/moodController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all mood routes
router.use(authenticateToken);

// Validation rules
const moodValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('O valor do mood deve ser entre 1 e 5'),
  body('emotions')
    .optional()
    .isArray()
    .withMessage('Emoções devem ser um array'),
  body('note')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Nota não pode ultrapassar 1000 letras'),
  body('activities')
    .optional()
    .isArray()
    .withMessage('Atividades precisa ser um array '),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Data deve estar no formato ISO (YYYY-MM-DD)')
];

const moodUpdateValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('O valor do mood deve ser entre 1 e 5'),
  body('emotions')
    .optional()
    .isArray()
    .withMessage('Emoções devem ser um array'),
  body('note')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Nota não pode ultrapassar 1000 letras'),
  body('activities')
    .optional()
    .isArray()
    .withMessage('Atividades precisa ser um array')
];

router.get('/', getMoods);
router.post('/', moodValidation, createMood);
router.get('/analytics', getAnalytics);
router.get('/:id', getMood);
router.put('/:id', moodUpdateValidation, updateMood);
router.delete('/:id', deleteMood);

export default router;