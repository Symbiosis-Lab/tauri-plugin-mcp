import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Logger', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    originalEnv = { ...process.env };
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Clear module cache to re-evaluate environment variables
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
    consoleSpy.mockRestore();
  });

  it('defaults to info level when MOSS_LOG_LEVEL is not set', async () => {
    delete process.env.MOSS_LOG_LEVEL;
    const { logger } = await import('./logger.js');

    logger.debug('debug message');
    logger.info('info message');
    logger.warn('warn message');
    logger.error('error message');

    // debug should be suppressed, info/warn/error should show
    expect(consoleSpy).toHaveBeenCalledTimes(3);
    expect(consoleSpy.mock.calls[0][0]).toContain('[INFO]');
    expect(consoleSpy.mock.calls[1][0]).toContain('[WARN]');
    expect(consoleSpy.mock.calls[2][0]).toContain('[ERROR]');
  });

  it('respects MOSS_LOG_LEVEL=error (suppresses info, warn, debug)', async () => {
    process.env.MOSS_LOG_LEVEL = 'error';
    const { logger } = await import('./logger.js');

    logger.debug('debug message');
    logger.info('info message');
    logger.warn('warn message');
    logger.error('error message');

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy.mock.calls[0][0]).toContain('[ERROR]');
    expect(consoleSpy.mock.calls[0][0]).toContain('error message');
  });

  it('respects MOSS_LOG_LEVEL=warn (suppresses info, debug)', async () => {
    process.env.MOSS_LOG_LEVEL = 'warn';
    const { logger } = await import('./logger.js');

    logger.debug('debug message');
    logger.info('info message');
    logger.warn('warn message');
    logger.error('error message');

    expect(consoleSpy).toHaveBeenCalledTimes(2);
    expect(consoleSpy.mock.calls[0][0]).toContain('[WARN]');
    expect(consoleSpy.mock.calls[1][0]).toContain('[ERROR]');
  });

  it('respects MOSS_LOG_LEVEL=debug (shows all messages)', async () => {
    process.env.MOSS_LOG_LEVEL = 'debug';
    const { logger } = await import('./logger.js');

    logger.debug('debug message');
    logger.info('info message');
    logger.warn('warn message');
    logger.error('error message');

    expect(consoleSpy).toHaveBeenCalledTimes(4);
    expect(consoleSpy.mock.calls[0][0]).toContain('[DEBUG]');
    expect(consoleSpy.mock.calls[1][0]).toContain('[INFO]');
    expect(consoleSpy.mock.calls[2][0]).toContain('[WARN]');
    expect(consoleSpy.mock.calls[3][0]).toContain('[ERROR]');
  });

  it('handles invalid MOSS_LOG_LEVEL gracefully (defaults to info)', async () => {
    process.env.MOSS_LOG_LEVEL = 'invalid_level';
    const { logger } = await import('./logger.js');

    logger.debug('debug message');
    logger.info('info message');

    // Should behave like info level
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy.mock.calls[0][0]).toContain('[INFO]');
  });

  it('handles case-insensitive log levels', async () => {
    process.env.MOSS_LOG_LEVEL = 'DEBUG';
    const { logger } = await import('./logger.js');

    logger.debug('debug message');

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy.mock.calls[0][0]).toContain('[DEBUG]');
  });

  it('includes ISO timestamp in log messages', async () => {
    delete process.env.MOSS_LOG_LEVEL;
    const { logger } = await import('./logger.js');

    logger.info('test message');

    // Check for ISO timestamp format: YYYY-MM-DDTHH:MM:SS
    expect(consoleSpy.mock.calls[0][0]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('passes additional arguments through', async () => {
    delete process.env.MOSS_LOG_LEVEL;
    const { logger } = await import('./logger.js');

    const extraData = { key: 'value' };
    logger.info('test message', extraData);

    expect(consoleSpy).toHaveBeenCalledWith(expect.any(String), extraData);
  });

  it('respects MOSS_LOG_LEVEL=silent (suppresses all)', async () => {
    process.env.MOSS_LOG_LEVEL = 'silent';
    const { logger } = await import('./logger.js');

    logger.debug('debug message');
    logger.info('info message');
    logger.warn('warn message');
    logger.error('error message');

    expect(consoleSpy).not.toHaveBeenCalled();
  });
});
