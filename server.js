import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import moodRoutes from "./routes/moodRoutes.js";
import tagsRoutes from "./routes/tagsRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

// Import database initialization
import { initDatabase } from "./config/database.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    //origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    origin: true,
    credentials: true,
  }),
);

app.options('*', cors({
  origin: true,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/tags", tagsRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.redirect("/api");
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    await initDatabase();
    console.log("✅ Database initialized successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Uma barreira de segurança para erros que "passaram batido".
// Isso evita que a aplicação quebre de forma inesperada e silenciosa.
process.on("uncaughtException", (error) => {
  console.error(
    "❌ Opa! Um erro inesperado ocorreu. Por segurança, a aplicação será encerrada:",
    error,
  );
  process.exit(1); // Força a saída para evitar um estado corrompido.
});

// O mesmo que o de cima, mas para Promises que não tiveram seu erro tratado (sem um .catch()).
process.on("unhandledRejection", (error) => {
  console.error(
    "Alerta! Uma operação assíncrona falhou sem tratamento. Encerrando a aplicação:",
    error,
  );
  process.exit(1);
});

startServer();
