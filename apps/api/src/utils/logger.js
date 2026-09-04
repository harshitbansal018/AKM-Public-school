import { env } from '../config/env.js';

const LEVEL_COLOR = {
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  success: '\x1b[32m',
};
const RESET = '\x1b[0m';

function write(level, args) {
  const time = new Date().toISOString().slice(11, 19);
  const tag = `${LEVEL_COLOR[level] ?? ''}[${level.toUpperCase()}]${RESET}`;
  const stream = level === 'error' ? console.error : console.log;
  stream(`${time} ${tag}`, ...args);
}

export const logger = {
  info: (...args) => write('info', args),
  warn: (...args) => write('warn', args),
  error: (...args) => write('error', args),
  success: (...args) => write('success', args),
  /** Verbose output that would only be noise in production. */
  debug: (...args) => {
    if (!env.isProduction) write('info', args);
  },
};

export default logger;
