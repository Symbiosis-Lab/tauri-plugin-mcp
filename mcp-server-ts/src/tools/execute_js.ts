import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { logger } from '../logger.js';
import { socketClient } from "./client.js";
import { createErrorResponse, createSuccessResponse, formatResultAsText, logCommandParams } from "./response-helpers.js";

export function registerExecuteJsTool(server: McpServer) {
  server.tool(
    "execute_js",
    "Executes JavaScript code in the Tauri app shell webview and RETURNS THE RESULT. Use this for inspecting or manipulating the app shell UI (toolbar, settings panel, navigation sidebar, etc.). The return value is the result of the last expression or resolved promise, serialized as text.\n\nWhen to use this vs Playwright browser_evaluate:\n- Use execute_js for the APP SHELL (Tauri webview): toolbar buttons, settings, navigation, app-level state.\n- Use Playwright browser_evaluate for PREVIEW CONTENT: the document preview is served at localhost:8080 and is directly accessible to Playwright.\n\nReturns: The serialized result of the JavaScript execution (strings, numbers, objects, arrays). Errors are returned as error messages.\n\nExamples:\n- `document.querySelector('.toolbar-btn').textContent` - read a toolbar button label\n- `document.querySelectorAll('.nav-item').length` - count navigation items\n- `getComputedStyle(document.body).backgroundColor` - check app theme color",
    {
      code: z.string().describe("Required. The string of JavaScript code to be executed in the target window's webview context. Ensure the code is safe and achieves the intended purpose. Malformed or malicious code can lead to errors or unwanted behavior."),
      window_label: z.string().default("main").describe("The identifier (e.g., visible title or internal label) of the application window where the JavaScript code will be executed. Defaults to 'main' if not specified."),
      timeout_ms: z.number().int().positive().optional().describe("The maximum time in milliseconds to allow for the JavaScript execution. If the script exceeds this timeout, its execution will be terminated, and an error may be returned."),
    },
    {
      title: "Execute JavaScript Code in Specified Application Window",
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: false,
    },
    async ({ code, window_label, timeout_ms }) => {
      try {
        // Validate required parameters
        if (!code || code.trim() === '') {
          return createErrorResponse("The code parameter is required and cannot be empty");
        }
        
        const params = { code, window_label, timeout_ms };
        logCommandParams('execute_js', params);
        
        // Use default window label if not provided
        const effectiveWindowLabel = window_label || 'main';
        
        const result = await socketClient.sendCommand('execute_js', {
          code,
          window_label: effectiveWindowLabel,
          timeout_ms
        });
        
        logger.debug(`Got JS execution result type: ${typeof result}`);
        
        return createSuccessResponse(formatResultAsText(result));
      } catch (error) {
        logger.error('JS execution error:', error);
        return createErrorResponse(`Failed to execute JavaScript: ${(error as Error).message}`);
      }
    },
  );
} 