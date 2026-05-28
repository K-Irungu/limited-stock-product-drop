import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import { requestLogger } from "./shared/middleware/requestLogger.middleware";
import { errorHandler } from "./shared/middleware/errorHandler.middleware";
import { registerRoutes } from "./routes";
import { healthCheck } from "./observability/health";

const createApp = (): Application => {
  const app = express();

  // Security headers
  app.use(helmet());

  // Origin settings
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(","),
      methods: ["GET", "POST", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging
  app.use(requestLogger);

  // Health check
  app.get("/health", healthCheck);

  // Routes
  registerRoutes(app);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: "Route not found",
    });
  });

  app.use(errorHandler);

  return app;
};

export default createApp;
