import express from 'express';
import { body } from 'express-validator';
import {
  getMoods,
  getMood,
  createMood,
  updateMood,
  deleteMood,
  getAnalytics,
  getTrends
} from '../controllers/moodController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all mood routes
router.use(authenticateToken);

// Validation rules
const moodValidation = [
  body('mood_value')
    .isInt({ min: 1, max: 10 })
    .withMessage('Mood value must be between 1 and 10'),
  body('emotions')
    .optional()
    .isArray()
    .withMessage('Emotions must be an array'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
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
  body('mood_value')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Mood value must be between 1 and 10'),
  body('emotions')
    .optional()
    .isArray()
    .withMessage('Emotions must be an array'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('activities')
    .optional()
    .isArray()
    .withMessage('Activities must be an array')
];

/**
 * @swagger
 * /api/moods:
 *   get:
 *     summary: Get all mood entries for the authenticated user
 *     tags: [Moods]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter moods from this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter moods until this date (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 100
 *         description: Number of entries to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
 *         description: Number of entries to skip
 *     responses:
 *       200:
 *         description: Mood entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     moods:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Mood'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         limit:
 *                           type: integer
 *                         offset:
 *                           type: integer
 *                         total:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     summary: Create a new mood entry
 *     tags: [Moods]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mood_value
 *             properties:
 *               mood_value:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 8
 *               emotions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["feliz", "motivado", "energético"]
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Dia produtivo no trabalho, consegui finalizar o projeto"
 *               activities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["trabalho", "exercício", "leitura"]
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2023-12-01"
 *     responses:
 *       201:
 *         description: Mood entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Mood entry created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     mood:
 *                       $ref: '#/components/schemas/Mood'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Mood entry already exists for this date
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getMoods);
router.post('/', moodValidation, createMood);

/**
 * @swagger
 * /api/moods/analytics:
 *   get:
 *     summary: Get mood analytics for the authenticated user
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           default: "30d"
 *           enum: ["7d", "30d", "90d", "365d"]
 *         description: Time range for analytics
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     analytics:
 *                       $ref: '#/components/schemas/MoodAnalytics'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/analytics', getAnalytics);

/**
 * @swagger
 * /api/moods/trends:
 *   get:
 *     summary: Get mood trends for the authenticated user
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           default: "week"
 *           enum: ["week", "month", "year"]
 *         description: Period for trend analysis
 *     responses:
 *       200:
 *         description: Trends retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     trends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           period:
 *                             type: string
 *                             description: Time period identifier
 *                           avg_mood:
 *                             type: number
 *                             format: float
 *                             description: Average mood for the period
 *                           entries:
 *                             type: integer
 *                             description: Number of entries in the period
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/trends', getTrends);

/**
 * @swagger
 * /api/moods/{id}:
 *   get:
 *     summary: Get a specific mood entry
 *     tags: [Moods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Mood entry ID
 *     responses:
 *       200:
 *         description: Mood entry retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     mood:
 *                       $ref: '#/components/schemas/Mood'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Mood entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     summary: Update a mood entry
 *     tags: [Moods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Mood entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mood_value:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 9
 *               emotions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["feliz", "realizado"]
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Atualizando as notas do dia"
 *               activities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["trabalho", "família", "descanso"]
 *     responses:
 *       200:
 *         description: Mood entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Mood entry updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     mood:
 *                       $ref: '#/components/schemas/Mood'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Mood entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Delete a mood entry
 *     tags: [Moods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Mood entry ID
 *     responses:
 *       200:
 *         description: Mood entry deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Mood entry deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Mood entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', getMood);
router.put('/:id', moodUpdateValidation, updateMood);
router.delete('/:id', deleteMood);

export default router;