import express from 'express';
import { body } from 'express-validator';
import {getMoods, getMood, createMood, updateMood, deleteMood, getAnalytics, getTrends} from '../controllers/moodController.js';
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
 *     summary: Listar registros de humor do usuário
 *     tags: [Humor]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial para filtro (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final para filtro (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Número máximo de registros
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de registros para pular
 *     responses:
 *       200:
 *         description: Lista de registros de humor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MoodListResponse'
 *   post:
 *     summary: Criar novo registro de humor
 *     tags: [Humor]
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
 *                 example: "Dia produtivo no trabalho"
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
 *         description: Registro de humor criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MoodResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Já existe registro para esta data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getMoods);
router.post('/', moodValidation, createMood);

/**
 * @swagger
 * /api/moods/analytics:
 *   get:
 *     summary: Obter análises de humor
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           default: "30d"
 *         description: "Período para análise (ex: 30d, 60d, 90d)"
 *     responses:
 *       200:
 *         description: Análises de humor
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
 *                       $ref: '#/components/schemas/Analytics'
 */
router.get('/analytics', getAnalytics);

/**
 * @swagger
 * /api/moods/trends:
 *   get:
 *     summary: Obter tendências de humor
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *           default: "week"
 *         description: Período para agrupamento das tendências
 *     responses:
 *       200:
 *         description: Tendências de humor
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
 *                             example: "2023-12"
 *                           avg_mood:
 *                             type: number
 *                             example: 7.5
 *                           entries:
 *                             type: integer
 *                             example: 15
 */
router.get('/trends', getTrends);

/**
 * @swagger
 * /api/moods/{id}:
 *   get:
 *     summary: Obter registro de humor específico
 *     tags: [Humor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do registro de humor
 *     responses:
 *       200:
 *         description: Registro de humor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MoodResponse'
 *       404:
 *         description: Registro não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Atualizar registro de humor
 *     tags: [Humor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do registro de humor
 *     requestBody:
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
 *                 example: ["feliz", "relaxado"]
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Dia ainda melhor"
 *               activities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["meditação", "caminhada"]
 *     responses:
 *       200:
 *         description: Registro atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MoodResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Registro não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Deletar registro de humor
 *     tags: [Humor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do registro de humor
 *     responses:
 *       200:
 *         description: Registro deletado com sucesso
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
 *                   example: Mood entry deleted successfully
 *       404:
 *         description: Registro não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getMood);
router.put('/:id', moodUpdateValidation, updateMood);
router.delete('/:id', deleteMood);

export default router;