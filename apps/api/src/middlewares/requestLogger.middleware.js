import morgan from 'morgan';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const stream = {
  write: (line) => logger.info(line.trim()),
};

export const requestLogger = morgan(env.isProduction ? 'combined' : 'dev', {
  stream,
  // Health checks would otherwise flood the log.
  skip: (req) => req.originalUrl === '/health',
});

export default requestLogger;
