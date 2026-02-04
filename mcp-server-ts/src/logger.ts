/**
 * Unified logging module for MCP server.
 * Reads MOSS_LOG_LEVEL environment variable for verbosity control.
 *
 * Levels (from most to least verbose):
 * - debug: Show all messages
 * - info: Show info, warn, error (default)
 * - warn: Show warn, error
 * - error: Show only errors
 * - silent: Suppress all output
 */

type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

const LEVELS: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

class Logger {
  private level: number;

  constructor() {
    const levelStr = (process.env.MOSS_LOG_LEVEL || 'info').toLowerCase() as LogLevel;
    this.level = LEVELS[levelStr] ?? LEVELS.info;
  }

  private format(level: string, msg: string): string {
    return `${new Date().toISOString()} [${level}] ${msg}`;
  }

  error(msg: string, ...args: unknown[]): void {
    if (this.level >= LEVELS.error) {
      console.error(this.format('ERROR', msg), ...args);
    }
  }

  warn(msg: string, ...args: unknown[]): void {
    if (this.level >= LEVELS.warn) {
      console.error(this.format('WARN', msg), ...args);
    }
  }

  info(msg: string, ...args: unknown[]): void {
    if (this.level >= LEVELS.info) {
      console.error(this.format('INFO', msg), ...args);
    }
  }

  debug(msg: string, ...args: unknown[]): void {
    if (this.level >= LEVELS.debug) {
      console.error(this.format('DEBUG', msg), ...args);
    }
  }
}

export const logger = new Logger();
