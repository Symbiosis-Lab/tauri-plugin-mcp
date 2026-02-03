import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { socketClient } from "./client.js";
import { createErrorResponse, createImageResponse, extractBase64Data, logCommandParams } from "./response-helpers.js";

/**
 * JS-based screenshot capture tool.
 *
 * Unlike take_screenshot which uses native OS screen capture (requires permissions),
 * this tool captures the webview's content using JavaScript - similar to how
 * Playwright captures screenshots via CDP.
 *
 * Benefits:
 * - Does NOT require Screen Recording permissions on macOS
 * - Does NOT require the window to be focused or visible
 * - Works even when the app is minimized or behind other windows
 *
 * Limitations:
 * - Only captures the webview content, not the native window decorations
 * - May not capture certain CSS effects (e.g., complex filters, backdrop-filter)
 * - Canvas/WebGL elements may have CORS restrictions
 */
export function registerCaptureScreenshotTool(server: McpServer) {
  server.tool(
    "capture_screenshot",
    "Captures the webview's content using JavaScript-based rendering. Unlike take_screenshot, this does NOT require Screen Recording permissions or window focus. Best for capturing web content when the app may be minimized or obscured. Returns a JPEG image.",
    {
      window_label: z.string().default("main").describe("The webview label to capture. Defaults to 'main'. For moss, this resolves to 'preview' automatically."),
      quality: z.number().min(1).max(100).default(85).describe("JPEG quality (1-100). Higher = better quality but larger size."),
      max_width: z.number().default(1920).describe("Maximum width in pixels. Images wider than this will be scaled down."),
    },
    {
      title: "Capture Webview Content (No Permissions Required)",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    async ({ window_label, quality, max_width }) => {
      try {
        const params = {
          window_label: window_label || "main",
          quality: quality || 85,
          max_width: max_width || 1920
        };
        logCommandParams('capture_screenshot', params);

        const result = await socketClient.sendCommand('capture_screenshot', params);

        console.error(`Got JS-based screenshot result type: ${typeof result}`);

        // Use our shared utility to extract base64 data
        const base64Data = extractBase64Data(result);

        if (!base64Data) {
          console.error('Failed to extract base64 data from response:', JSON.stringify(result));
          return createErrorResponse(`Failed to extract image data from response: ${JSON.stringify(result).substring(0, 100)}...`);
        }

        return createImageResponse(base64Data, 'image/jpeg');
      } catch (error) {
        console.error('JS-based screenshot error:', error);
        return createErrorResponse(`Failed to capture screenshot: ${(error as Error).message}`);
      }
    },
  );
}
