import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { logger } from '../logger.js';
import { socketClient } from "./client.js";
import { createErrorResponse, createImageResponse, extractBase64Data, logCommandParams } from "./response-helpers.js";

export function registerTakeScreenshotTool(server: McpServer) {
  server.tool(
    "take_screenshot",
    "Captures a native OS-level screenshot of the Tauri application window, including window decorations. This uses the operating system's screen capture API, producing a pixel-perfect image of exactly what the user sees.\n\nREQUIREMENTS: Requires macOS Screen Recording permission (System Settings > Privacy & Security > Screen Recording). The window must be visible and not fully obscured. If permissions are missing, the screenshot will fail or return a blank image.\n\nWhen to use this vs alternatives:\n- Use take_screenshot when you need a native-fidelity capture of the FULL Tauri window (including title bar). Rarely needed.\n- Use capture_screenshot (html2canvas) for app shell content without needing OS permissions.\n- Use Playwright browser_take_screenshot on localhost:8080 for PREVIEW CONTENT screenshots -- more reliable and no OS permissions needed.\n\nReturns: A JPEG image of the native window capture.",
    {
      window_label: z.string().default("main").describe("The identifier for the window to capture. This could be the window's visible title text or a unique internal label if available. Ensure this label accurately targets the desired window. Defaults to 'main' if not specified."),
    },
    {
      title: "Capture Screenshot of a Specific Application Window",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    async ({ window_label }) => {
      try {
        // The window_label now has a default value in the schema, so this check is redundant
        // But we'll keep it for extra safety
        if (!window_label) {
          window_label = "main";
        }
        
        const params = { window_label };
        logCommandParams('take_screenshot', params);
        
        const result = await socketClient.sendCommand('take_screenshot', params);
        
        logger.debug(`Got screenshot result type: ${typeof result}`);
        
        // Use our shared utility to extract base64 data
        const base64Data = extractBase64Data(result);
        
        if (!base64Data) {
          logger.error('Failed to extract base64 data from response:', JSON.stringify(result));
          return createErrorResponse(`Failed to extract image data from response: ${JSON.stringify(result).substring(0, 100)}...`);
        }
        
        return createImageResponse(base64Data, 'image/jpeg');
      } catch (error) {
        logger.error('Screenshot error:', error);
        return createErrorResponse(`Failed to take screenshot: ${(error as Error).message}`);
      }
    },
  );
} 