import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import Configs/Swagger
import config from './config/index.js';
import { specs, swaggerUi } from './config/swagger.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import moodRoutes from './routes/moodRoutes.js';
import tagsRoutes from './routes/tagsRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// Import database initialization
import { initDatabase } from './config/database.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const generalLimiter = rateLimit(
    {
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      message: config.rateLimit.message,
      standardHeaders: true,
      legacyHeaders: false,
    }
)

const authLimiter = rateLimit({
  windowMs: config.authRateLimit.windowMs,
  max: config.authRateLimit.max,
  message: config.authRateLimit.message,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);


// CORS configuration
app.use(cors({
  //origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  origin: config.corsOrigin,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Documentação do Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, config.swaggerOptions));


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    documentation: '/api-docs'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/user', userRoutes);

// Redirect root to documentation
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    await initDatabase();
    console.log('✅ Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Uma barreira de segurança para erros que "passaram batido".
// Isso evita que a aplicação quebre de forma inesperada e silenciosa.
process.on('uncaughtException', (error) => {
  console.error('❌ Opa! Um erro inesperado ocorreu. Por segurança, a aplicação será encerrada:', error);
  process.exit(1); // Força a saída para evitar um estado corrompido.
});

// O mesmo que o de cima, mas para Promises que não tiveram seu erro tratado (sem um .catch()).
process.on('unhandledRejection', (error) => {
  console.error('Alerta! Uma operação assíncrona falhou sem tratamento. Encerrando a aplicação:', error);
  process.exit(1);
});

startServer();