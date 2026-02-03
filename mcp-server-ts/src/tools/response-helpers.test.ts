/**
 * Unit tests for response-helpers.ts
 *
 * Tests the utility functions used for creating MCP responses and extracting data.
 */

import { describe, it, expect } from 'vitest';
import {
  createErrorResponse,
  createSuccessResponse,
  createImageResponse,
  extractBase64Data,
  formatResultAsText,
} from './response-helpers.js';

describe('createErrorResponse', () => {
  it('should create an error response with the given message', () => {
    const response = createErrorResponse('Something went wrong');

    expect(response.isError).toBe(true);
    expect(response.content).toHaveLength(1);
    expect(response.content[0].type).toBe('text');
    expect(response.content[0].text).toBe('Something went wrong');
  });

  it('should handle empty error message', () => {
    const response = createErrorResponse('');

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toBe('');
  });

  it('should handle special characters in error message', () => {
    const response = createErrorResponse('Error: "quotes" and <html> & special chars');

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toBe('Error: "quotes" and <html> & special chars');
  });
});

describe('createSuccessResponse', () => {
  it('should create a success response with the given text', () => {
    const response = createSuccessResponse('Operation completed successfully');

    expect(response.isError).toBe(false);
    expect(response.content).toHaveLength(1);
    expect(response.content[0].type).toBe('text');
    expect(response.content[0].text).toBe('Operation completed successfully');
  });

  it('should handle empty success message', () => {
    const response = createSuccessResponse('');

    expect(response.isError).toBe(false);
    expect(response.content[0].text).toBe('');
  });

  it('should handle JSON string content', () => {
    const jsonContent = JSON.stringify({ result: 'data', count: 42 });
    const response = createSuccessResponse(jsonContent);

    expect(response.isError).toBe(false);
    expect(response.content[0].text).toBe(jsonContent);
  });
});

describe('createImageResponse', () => {
  it('should create an image response with default JPEG mime type', () => {
    const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const response = createImageResponse(base64Data);

    expect(response.isError).toBe(false);
    expect(response.content).toHaveLength(1);
    expect(response.content[0].type).toBe('image');
    expect(response.content[0].data).toBe(base64Data);
    expect(response.content[0].mimeType).toBe('image/jpeg');
  });

  it('should create an image response with custom mime type', () => {
    const base64Data = 'base64encodedpng';
    const response = createImageResponse(base64Data, 'image/png');

    expect(response.isError).toBe(false);
    expect(response.content[0].mimeType).toBe('image/png');
  });

  it('should handle various image formats', () => {
    const formats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    formats.forEach(format => {
      const response = createImageResponse('testdata', format);
      expect(response.content[0].mimeType).toBe(format);
    });
  });
});

describe('extractBase64Data', () => {
  describe('direct string input', () => {
    it('should return raw base64 string as-is', () => {
      const base64 = 'SGVsbG8gV29ybGQh';
      const result = extractBase64Data(base64);

      expect(result).toBe(base64);
    });

    it('should strip data URL prefix for JPEG', () => {
      const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
      const result = extractBase64Data(dataUrl);

      expect(result).toBe('/9j/4AAQSkZJRg==');
    });

    it('should strip data URL prefix for PNG', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
      const result = extractBase64Data(dataUrl);

      expect(result).toBe('iVBORw0KGgo=');
    });

    it('should handle data URL with different image types', () => {
      const dataUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      const result = extractBase64Data(dataUrl);

      expect(result).toBe('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    });
  });

  describe('object input with data field', () => {
    it('should extract from object with string data field', () => {
      const result = extractBase64Data({ data: 'base64string' });

      expect(result).toBe('base64string');
    });

    it('should extract from object with data URL in data field', () => {
      const result = extractBase64Data({ data: 'data:image/jpeg;base64,abc123' });

      expect(result).toBe('abc123');
    });

    it('should extract from nested data structure', () => {
      const result = extractBase64Data({
        data: {
          data: 'nestedbase64'
        }
      });

      expect(result).toBe('nestedbase64');
    });

    it('should extract from nested data structure with data URL', () => {
      const result = extractBase64Data({
        data: {
          data: 'data:image/png;base64,nested123'
        }
      });

      expect(result).toBe('nested123');
    });

    it('should handle object with other fields alongside data', () => {
      const result = extractBase64Data({
        success: true,
        data: 'imagebase64',
        error: null
      });

      expect(result).toBe('imagebase64');
    });
  });

  describe('invalid inputs', () => {
    it('should return null for null input', () => {
      const result = extractBase64Data(null);

      expect(result).toBeNull();
    });

    it('should return null for undefined input', () => {
      const result = extractBase64Data(undefined);

      expect(result).toBeNull();
    });

    it('should return null for number input', () => {
      const result = extractBase64Data(42);

      expect(result).toBeNull();
    });

    it('should return null for boolean input', () => {
      const result = extractBase64Data(true);

      expect(result).toBeNull();
    });

    it('should return null for object without data field', () => {
      const result = extractBase64Data({ image: 'base64', content: 'test' });

      expect(result).toBeNull();
    });

    it('should return null for empty object', () => {
      const result = extractBase64Data({});

      expect(result).toBeNull();
    });

    it('should return null for array input', () => {
      const result = extractBase64Data(['base64data']);

      expect(result).toBeNull();
    });

    it('should return null when data field is not a string', () => {
      const result = extractBase64Data({ data: 12345 });

      expect(result).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const result = extractBase64Data('');

      expect(result).toBe('');
    });

    it('should handle string that starts with data: but is not an image', () => {
      const result = extractBase64Data('data:text/plain;base64,SGVsbG8=');

      // This is not an image data URL, so it should be returned as-is
      expect(result).toBe('data:text/plain;base64,SGVsbG8=');
    });

    it('should handle deeply nested structure', () => {
      const result = extractBase64Data({
        data: {
          data: 'actualdata'
        }
      });

      expect(result).toBe('actualdata');
    });
  });
});

describe('formatResultAsText', () => {
  it('should return string as-is', () => {
    const result = formatResultAsText('Hello World');

    expect(result).toBe('Hello World');
  });

  it('should stringify objects', () => {
    const obj = { name: 'test', value: 42 };
    const result = formatResultAsText(obj);

    expect(result).toBe(JSON.stringify(obj, null, 2));
  });

  it('should stringify arrays', () => {
    const arr = [1, 2, 3];
    const result = formatResultAsText(arr);

    expect(result).toBe(JSON.stringify(arr, null, 2));
  });

  it('should stringify null', () => {
    const result = formatResultAsText(null);

    expect(result).toBe('null');
  });

  it('should stringify numbers', () => {
    const result = formatResultAsText(42);

    expect(result).toBe('42');
  });

  it('should stringify boolean', () => {
    const result = formatResultAsText(true);

    expect(result).toBe('true');
  });

  it('should stringify nested objects with proper indentation', () => {
    const nested = {
      level1: {
        level2: {
          value: 'deep'
        }
      }
    };
    const result = formatResultAsText(nested);

    expect(result).toContain('"level1"');
    expect(result).toContain('"level2"');
    expect(result).toContain('"deep"');
  });
});
