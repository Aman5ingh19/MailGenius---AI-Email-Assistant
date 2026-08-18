import winston from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// ─── Log directory (relative to project root) ─────────────────────────────────
const LOG_DIR = path.join(process.cwd(), 'logs');

// ─── Custom format for console (readable) ────────────────────────────────────
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
    return `${timestamp} [${level}] ${message}${metaStr}${stack ? '\n' + stack : ''}`;
  })
);

// ─── Format for log files (structured JSON) ──────────────────────────────────
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// ─── Transports ───────────────────────────────────────────────────────────────
const transports = [
  // Console — always on in development
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format: consoleFormat,
    silent: process.env.NODE_ENV === 'test',
  }),
];

// File transports only on server (not during static generation / edge)
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  transports.push(
    // All logs
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'combined.log'),
      level: 'info',
      format: fileFormat,
      maxsize: 5 * 1024 * 1024, // 5 MB
      maxFiles: 5,
      tailable: true,
    }),
    // Errors only
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    })
  );
}

// ─── Logger instance ─────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'mailgenius' },
  transports,
  exitOnError: false,
});

// ─── HTTP request logger helper (Morgan-style, Next.js compatible) ────────────
/**
 * Call at the start of any API route handler.
 * @param {Request} req - The incoming Next.js request
 * @param {string} routeName - e.g. 'POST /api/generate'
 */
export function logRequest(req, routeName) {
  logger.http(`→ ${routeName}`, {
    method: req.method,
    url: req.url,
    userAgent: req.headers?.get?.('user-agent') || req.headers?.['user-agent'] || 'unknown',
  });
}

/**
 * Call at the end of any API route handler.
 * @param {string} routeName
 * @param {number} status - HTTP status code
 * @param {number} durationMs - Time taken in ms
 */
export function logResponse(routeName, status, durationMs) {
  const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'http';
  logger[level](`← ${routeName}`, { status, durationMs: `${durationMs}ms` });
}

export default logger;
