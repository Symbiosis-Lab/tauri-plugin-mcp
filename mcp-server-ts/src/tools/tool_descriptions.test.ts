/**
 * Tests that all MCP tool descriptions are enriched with actionable guidance.
 *
 * Each tool should have a description that:
 * - Is sufficiently detailed (not just a one-liner)
 * - Explains when to use this tool vs Playwright (where applicable)
 * - Documents what the tool returns
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock the socket client to prevent actual connection attempts
vi.mock('./client.js', () => ({
  socketClient: {
    sendCommand: vi.fn(),
    connect: vi.fn(),
  },
}));

// Capture tool registrations via a mock McpServer
interface RegisteredTool {
  name: string;
  description: string;
  schema: Record<string, any>;
  metadata: Record<string, any>;
}

const registeredTools: RegisteredTool[] = [];

const mockServer = {
  tool: (name: string, description: string, schema: any, metadata: any, _handler: any) => {
    registeredTools.push({ name, description, schema, metadata });
  },
} as any;

beforeAll(async () => {
  // Import and register all tools against our mock server
  const { registerAllTools } = await import('./index.js');
  registerAllTools(mockServer);
});

// Actual tool names as registered in the MCP server
const allToolNames = [
  'take_screenshot',
  'capture_screenshot',
  'execute_js',
  'get_dom',
  'iframe_rpc',
  'manage_window',
  'manage_local_storage',
  'simulate_text_input',
  'simulate_mouse_movement',
  'get_element_position',
  'send_text_to_element',
];

describe('tool registration completeness', () => {
  it('should register all 11 tools', () => {
    expect(registeredTools).toHaveLength(11);
  });

  it.each(allToolNames)('should register %s', (toolName) => {
    const tool = registeredTools.find(t => t.name === toolName);
    expect(tool).toBeDefined();
  });
});

describe('tool description quality', () => {
  it.each(allToolNames)('%s should have a detailed description (>100 chars)', (toolName) => {
    const tool = registeredTools.find(t => t.name === toolName);
    expect(tool).toBeDefined();
    expect(tool!.description.length).toBeGreaterThan(100);
  });

  // Tools that interact with preview content should mention Playwright alternative
  it.each([
    'take_screenshot',
    'capture_screenshot',
    'execute_js',
    'get_dom',
    'iframe_rpc',
  ])('%s should mention Playwright in description', (toolName) => {
    const tool = registeredTools.find(t => t.name === toolName);
    expect(tool).toBeDefined();
    expect(tool!.description.toLowerCase()).toContain('playwright');
  });

  it.each([
    'execute_js',
    'get_dom',
    'capture_screenshot',
    'take_screenshot',
  ])('%s should document what it returns', (toolName) => {
    const tool = registeredTools.find(t => t.name === toolName);
    expect(tool).toBeDefined();
    expect(tool!.description.toLowerCase()).toMatch(/return/i);
  });
});

describe('tool metadata', () => {
  it('read-only tools should be marked correctly', () => {
    const readOnlyTools = ['get_dom', 'capture_screenshot', 'take_screenshot'];
    for (const toolName of readOnlyTools) {
      const tool = registeredTools.find(t => t.name === toolName);
      expect(tool, `${toolName} should be registered`).toBeDefined();
      expect(tool!.metadata.readOnlyHint, `${toolName} should be readOnly`).toBe(true);
    }
  });

  it('mutating tools should not be marked read-only', () => {
    const mutatingTools = ['execute_js', 'simulate_text_input', 'simulate_mouse_movement', 'send_text_to_element'];
    for (const toolName of mutatingTools) {
      const tool = registeredTools.find(t => t.name === toolName);
      expect(tool, `${toolName} should be registered`).toBeDefined();
      expect(tool!.metadata.readOnlyHint, `${toolName} should not be readOnly`).toBe(false);
    }
  });

  it('all tools should have a title', () => {
    for (const tool of registeredTools) {
      expect(tool.metadata.title, `${tool.name} should have a title`).toBeTruthy();
      expect(typeof tool.metadata.title).toBe('string');
    }
  });
});
