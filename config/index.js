import dotenv from "dotenv";
dotenv.config();

// Centralizando as configurações

export default {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",

  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
  },

  authRateLimit: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // More strict limit for auth routes
    message: "Too many authentication attempts, please try again later.",
  },

  swaggerOptions: {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #8B4513; }
      .swagger-ui .scheme-container { background: #F5F5DC; }
    `,
    customSiteTitle: "Mood Tracker API Documentation",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: "none",
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
    },
  },
};
