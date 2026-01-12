/**
 * Production-safe logger abstraction
 * 
 * In production: no-ops all console calls to reduce bundle size and eliminate debug noise
 * In development: delegates to console for full debugging
 * 
 * Usage:
 *   import logger from '@/utils/logger';
 *   logger.warn('Something went wrong', { context });
 *   logger.error('Critical error', error);
 */

const isDev = import.meta.env.DEV;

interface Logger {
  debug: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

const devLogger: Logger = {
  debug: (...args: any[]) => console.debug('[DEBUG]', ...args),
  info: (...args: any[]) => console.info('[INFO]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
};

const prodLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {}, // In production, could send to external service (e.g., Sentry)
};

const logger: Logger = isDev ? devLogger : prodLogger;

export default logger;
