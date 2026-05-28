import createApp from "./app";
import { prisma } from "./config/database";
import { redis } from "./config/redis";
import { logger } from "./shared/utils/logger";

const PORT = Number(process.env.PORT) || 3000;
const SHUTDOWN_TIMEOUT_MS = 10_000;

// DB connection
const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info("PostgreSQL connected");
  } catch (err) {
    logger.fatal({ err }, "PostgreSQL connection failed — cannot start server");
    process.exit(1);
  }
};

// Redis Connection
const connectRedis = async (): Promise<void> => {
  try {
    await redis.ping();
    logger.info("Redis connected");
  } catch (err) {
    logger.fatal({ err }, "Redis connection failed — cannot start server");
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown =
  (server: import("http").Server) =>
  async (signal: string): Promise<void> => {
    logger.info(`${signal} received — shutting down`);

    const forceExit = setTimeout(() => {
      logger.fatal("Graceful shutdown timed out — forcing exit");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    forceExit.unref();

    server.close(async () => {
      await prisma.$disconnect();
      redis.disconnect();
      logger.info("Shutdown complete");
      process.exit(0);
    });
  };

// Start server
const start = async (): Promise<void> => {
  await connectDatabase();
  await connectRedis();

  const app = createApp();

  const server = app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });

  // Port conflict handler
  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      logger.fatal(`Port ${PORT} is already in use`);
    } else {
      logger.fatal({ err }, "HTTP server error");
    }
    process.exit(1);
  });

  //Process signals
  process.on("SIGTERM", shutdown(server));
  process.on("SIGINT", shutdown(server));
};

start();
