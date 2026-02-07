/**
 * Tests for the execute_js result stringification logic.
 *
 * The guest-js handler (guest-js/index.ts) stringifies JavaScript execution
 * results before sending them to the Rust side (which expects `r.as_str()`).
 * This test validates the exact stringification algorithm used there.
 */

import { describe, it, expect } from 'vitest';

/**
 * Mirrors the stringification logic in guest-js/index.ts handleJsExecutionRequest().
 * This is the exact algorithm — if the guest-js implementation changes, this
 * function should be updated to match so the tests stay meaningful.
 */
function stringifyResult(result: any): { result: string; type: string } {
  let resultStr: string;
  if (result === undefined) {
    resultStr = 'undefined';
  } else if (result === null) {
    resultStr = 'null';
  } else if (typeof result === 'object') {
    resultStr = JSON.stringify(result);
  } else {
    resultStr = String(result);
  }
  return {
    result: resultStr,
    type: typeof result,
  };
}

describe('execute_js result stringification', () => {
  describe('primitive values', () => {
    it('should stringify undefined', () => {
      const { result, type } = stringifyResult(undefined);
      expect(result).toBe('undefined');
      expect(type).toBe('undefined');
    });

    it('should stringify null', () => {
      const { result, type } = stringifyResult(null);
      expect(result).toBe('null');
      expect(type).toBe('object'); // typeof null === 'object' in JS
    });

    it('should stringify strings as-is', () => {
      const { result, type } = stringifyResult('hello');
      expect(result).toBe('hello');
      expect(type).toBe('string');
    });

    it('should stringify empty string', () => {
      const { result, type } = stringifyResult('');
      expect(result).toBe('');
      expect(type).toBe('string');
    });

    it('should stringify numbers', () => {
      const { result, type } = stringifyResult(42);
      expect(result).toBe('42');
      expect(type).toBe('number');
    });

    it('should stringify zero', () => {
      const { result, type } = stringifyResult(0);
      expect(result).toBe('0');
      expect(type).toBe('number');
    });

    it('should stringify NaN', () => {
      const { result, type } = stringifyResult(NaN);
      expect(result).toBe('NaN');
      expect(type).toBe('number');
    });

    it('should stringify Infinity', () => {
      const { result, type } = stringifyResult(Infinity);
      expect(result).toBe('Infinity');
      expect(type).toBe('number');
    });

    it('should stringify booleans', () => {
      expect(stringifyResult(true).result).toBe('true');
      expect(stringifyResult(false).result).toBe('false');
      expect(stringifyResult(true).type).toBe('boolean');
    });
  });

  describe('objects', () => {
    it('should JSON.stringify plain objects', () => {
      const { result, type } = stringifyResult({ a: 1, b: 2 });
      expect(result).toBe('{"a":1,"b":2}');
      expect(type).toBe('object');
    });

    it('should JSON.stringify arrays', () => {
      const { result, type } = stringifyResult([1, 2, 3]);
      expect(result).toBe('[1,2,3]');
      expect(type).toBe('object');
    });

    it('should JSON.stringify nested objects', () => {
      const { result } = stringifyResult({ nested: { deep: true } });
      expect(result).toBe('{"nested":{"deep":true}}');
    });

    it('should JSON.stringify empty object', () => {
      const { result } = stringifyResult({});
      expect(result).toBe('{}');
    });

    it('should JSON.stringify empty array', () => {
      const { result } = stringifyResult([]);
      expect(result).toBe('[]');
    });
  });

  describe('edge cases that previously caused [Result could not be stringified]', () => {
    it('should handle undefined (the most common case from void statements)', () => {
      // `console.log("hi")` returns undefined
      const { result } = stringifyResult(undefined);
      expect(result).toBe('undefined');
      expect(result).not.toContain('could not be stringified');
    });

    it('should handle null results', () => {
      // `document.querySelector(".nonexistent")` returns null
      const { result } = stringifyResult(null);
      expect(result).toBe('null');
      expect(result).not.toContain('could not be stringified');
    });

    it('should handle numeric results', () => {
      // `1 + 1` returns 2
      const { result } = stringifyResult(2);
      expect(result).toBe('2');
    });

    it('should handle DOM-like objects', () => {
      // Simulates what a querySelector result might serialize to
      const { result } = stringifyResult({ tagName: 'DIV', id: 'app' });
      expect(JSON.parse(result)).toEqual({ tagName: 'DIV', id: 'app' });
    });
  });

  describe('consistency with Rust side expectations', () => {
    it('should always return a string result (Rust uses r.as_str())', () => {
      const testValues = [
        undefined, null, 0, 1, '', 'text', true, false,
        {}, [], { key: 'value' }, [1, 2],
        NaN, Infinity, -Infinity,
      ];
      for (const val of testValues) {
        const { result } = stringifyResult(val);
        expect(typeof result).toBe('string');
      }
    });

    it('should always return a type string', () => {
      const testValues = [undefined, null, 42, 'text', true, {}, []];
      for (const val of testValues) {
        const { type } = stringifyResult(val);
        expect(typeof type).toBe('string');
        expect(['undefined', 'object', 'number', 'string', 'boolean']).toContain(type);
      }
    });
  });
});
