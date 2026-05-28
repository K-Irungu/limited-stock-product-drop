import pinoHttp from "pino-http";
import { logger } from "../utils/logger";

export const requestLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === "/health",
  },

  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },

  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      remoteAddress: req.remoteAddress,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});
