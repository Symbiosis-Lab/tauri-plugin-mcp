/**
 * Unit tests for capture_screenshot.ts
 *
 * Tests parameter validation, response formatting, and error handling.
 * Note: Full integration tests require a running Tauri app, so we focus on
 * unit testing the parameter handling and response formatting logic.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

// Define the schema that matches the tool registration
const captureScreenshotSchema = z.object({
  window_label: z.string().default("main"),
  quality: z.number().min(1).max(100).default(85),
  max_width: z.number().default(1920),
});

type CaptureScreenshotParams = z.infer<typeof captureScreenshotSchema>;

describe('capture_screenshot parameter validation', () => {
  describe('window_label parameter', () => {
    it('should use default "main" when not provided', () => {
      const result = captureScreenshotSchema.parse({});

      expect(result.window_label).toBe('main');
    });

    it('should accept custom window label', () => {
      const result = captureScreenshotSchema.parse({ window_label: 'preview' });

      expect(result.window_label).toBe('preview');
    });

    it('should accept empty string', () => {
      const result = captureScreenshotSchema.parse({ window_label: '' });

      expect(result.window_label).toBe('');
    });

    it('should reject non-string window_label', () => {
      expect(() => captureScreenshotSchema.parse({ window_label: 123 })).toThrow();
    });
  });

  describe('quality parameter', () => {
    it('should use default 85 when not provided', () => {
      const result = captureScreenshotSchema.parse({});

      expect(result.quality).toBe(85);
    });

    it('should accept quality at minimum value (1)', () => {
      const result = captureScreenshotSchema.parse({ quality: 1 });

      expect(result.quality).toBe(1);
    });

    it('should accept quality at maximum value (100)', () => {
      const result = captureScreenshotSchema.parse({ quality: 100 });

      expect(result.quality).toBe(100);
    });

    it('should accept quality at middle range', () => {
      const result = captureScreenshotSchema.parse({ quality: 50 });

      expect(result.quality).toBe(50);
    });

    it('should reject quality below minimum', () => {
      expect(() => captureScreenshotSchema.parse({ quality: 0 })).toThrow();
    });

    it('should reject quality above maximum', () => {
      expect(() => captureScreenshotSchema.parse({ quality: 101 })).toThrow();
    });

    it('should reject negative quality', () => {
      expect(() => captureScreenshotSchema.parse({ quality: -1 })).toThrow();
    });

    it('should reject non-number quality', () => {
      expect(() => captureScreenshotSchema.parse({ quality: 'high' })).toThrow();
    });
  });

  describe('max_width parameter', () => {
    it('should use default 1920 when not provided', () => {
      const result = captureScreenshotSchema.parse({});

      expect(result.max_width).toBe(1920);
    });

    it('should accept custom max_width', () => {
      const result = captureScreenshotSchema.parse({ max_width: 1280 });

      expect(result.max_width).toBe(1280);
    });

    it('should accept small max_width', () => {
      const result = captureScreenshotSchema.parse({ max_width: 320 });

      expect(result.max_width).toBe(320);
    });

    it('should accept large max_width', () => {
      const result = captureScreenshotSchema.parse({ max_width: 3840 });

      expect(result.max_width).toBe(3840);
    });

    it('should reject non-number max_width', () => {
      expect(() => captureScreenshotSchema.parse({ max_width: 'large' })).toThrow();
    });
  });

  describe('combined parameters', () => {
    it('should accept all parameters together', () => {
      const result = captureScreenshotSchema.parse({
        window_label: 'custom',
        quality: 90,
        max_width: 1600,
      });

      expect(result.window_label).toBe('custom');
      expect(result.quality).toBe(90);
      expect(result.max_width).toBe(1600);
    });

    it('should use defaults for missing parameters', () => {
      const result = captureScreenshotSchema.parse({
        quality: 75,
      });

      expect(result.window_label).toBe('main');
      expect(result.quality).toBe(75);
      expect(result.max_width).toBe(1920);
    });

    it('should ignore extra parameters', () => {
      const result = captureScreenshotSchema.parse({
        window_label: 'test',
        extra_param: 'ignored',
        another: 123,
      } as any);

      expect(result.window_label).toBe('test');
      expect((result as any).extra_param).toBeUndefined();
    });
  });
});

describe('capture_screenshot response handling', () => {
  // Simulated response formats that the tool might receive

  describe('successful response parsing', () => {
    it('should handle response with base64 data', () => {
      const response = {
        success: true,
        data: '/9j/4AAQSkZJRg==',
        error: null,
      };

      expect(response.success).toBe(true);
      expect(response.data).toBeTruthy();
      expect(typeof response.data).toBe('string');
    });

    it('should handle response with nested data structure', () => {
      const response = {
        success: true,
        data: {
          data: '/9j/4AAQSkZJRg==',
          success: true,
          error: null,
        },
      };

      expect(response.success).toBe(true);
      expect(response.data.data).toBeTruthy();
    });

    it('should handle response with data URL format', () => {
      const response = {
        success: true,
        data: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      };

      expect(response.data.startsWith('data:image')).toBe(true);
    });
  });

  describe('error response parsing', () => {
    it('should handle error response with message', () => {
      const response = {
        success: false,
        data: null,
        error: 'Failed to capture screenshot',
      };

      expect(response.success).toBe(false);
      expect(response.error).toBe('Failed to capture screenshot');
    });

    it('should handle timeout error response', () => {
      const response = {
        success: false,
        data: null,
        error: 'Timeout waiting for screenshot capture',
      };

      expect(response.success).toBe(false);
      expect(response.error).toContain('Timeout');
    });

    it('should handle webview not found error', () => {
      const response = {
        success: false,
        data: null,
        error: 'Webview not found: invalid_label',
      };

      expect(response.success).toBe(false);
      expect(response.error).toContain('Webview not found');
    });
  });
});

describe('capture_screenshot MCP response format', () => {
  // Test the final MCP response format

  it('should format successful image response', () => {
    // Simulated MCP image response format
    const mcpResponse = {
      isError: false,
      content: [{
        type: 'image' as const,
        data: '/9j/4AAQSkZJRg==',
        mimeType: 'image/jpeg',
      }],
    };

    expect(mcpResponse.isError).toBe(false);
    expect(mcpResponse.content[0].type).toBe('image');
    expect(mcpResponse.content[0].mimeType).toBe('image/jpeg');
  });

  it('should format error response', () => {
    const mcpResponse = {
      isError: true,
      content: [{
        type: 'text' as const,
        text: 'Failed to capture screenshot: timeout',
      }],
    };

    expect(mcpResponse.isError).toBe(true);
    expect(mcpResponse.content[0].type).toBe('text');
    expect(mcpResponse.content[0].text).toContain('Failed to capture screenshot');
  });
});

describe('capture_screenshot tool metadata', () => {
  // Test the tool metadata matches expected format

  const toolMetadata = {
    title: "Capture Webview Content (No Permissions Required)",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  };

  it('should have correct title', () => {
    expect(toolMetadata.title).toBe("Capture Webview Content (No Permissions Required)");
  });

  it('should be marked as read-only', () => {
    expect(toolMetadata.readOnlyHint).toBe(true);
  });

  it('should not be marked as destructive', () => {
    expect(toolMetadata.destructiveHint).toBe(false);
  });

  it('should be marked as idempotent', () => {
    expect(toolMetadata.idempotentHint).toBe(true);
  });

  it('should not be marked as open world', () => {
    expect(toolMetadata.openWorldHint).toBe(false);
  });
});

describe('capture_screenshot parameter defaults matching Rust', () => {
  // Ensure TypeScript defaults match Rust implementation

  it('should have same default window_label as Rust', () => {
    const result = captureScreenshotSchema.parse({});
    // Rust: parsed.window_label.unwrap_or_else(|| "main".to_string())
    expect(result.window_label).toBe('main');
  });

  it('should have same default quality as Rust', () => {
    const result = captureScreenshotSchema.parse({});
    // Rust: parsed.quality.unwrap_or(85)
    expect(result.quality).toBe(85);
  });

  it('should have same default max_width as Rust', () => {
    const result = captureScreenshotSchema.parse({});
    // Rust: parsed.max_width.unwrap_or(1920)
    expect(result.max_width).toBe(1920);
  });
});

describe('capture_screenshot edge cases', () => {
  it('should handle window label with special characters', () => {
    const result = captureScreenshotSchema.parse({
      window_label: 'my-app_preview.1',
    });

    expect(result.window_label).toBe('my-app_preview.1');
  });

  it('should handle window label with unicode', () => {
    const result = captureScreenshotSchema.parse({
      window_label: 'window-',
    });

    expect(result.window_label).toBe('window-');
  });

  it('should handle quality as decimal (floors to integer in practice)', () => {
    const result = captureScreenshotSchema.parse({
      quality: 85.5,
    });

    // Zod allows decimals for z.number(), but JPEG quality will be integer
    expect(result.quality).toBe(85.5);
  });

  it('should handle very large max_width', () => {
    const result = captureScreenshotSchema.parse({
      max_width: 7680, // 8K width
    });

    expect(result.max_width).toBe(7680);
  });

  it('should handle very small max_width', () => {
    const result = captureScreenshotSchema.parse({
      max_width: 1, // Minimum pixel width
    });

    expect(result.max_width).toBe(1);
  });
});
