import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { logger } from '../logger.js';
import { socketClient } from "./client.js";

export function registerManageWindowTool(server: McpServer) {
  server.tool(
    "manage_window",
    "Manages the state and geometry of native Tauri application windows. This is one of the few tauri-mcp tools with NO Playwright equivalent -- Playwright cannot control native window state.\n\nOperations: focus, minimize, maximize, unmaximize, close, show, hide, setPosition, setSize, center, toggleFullscreen.\n\nUse cases:\n- Resize the app window to test responsive layouts: setSize with width/height.\n- Move the window to a specific position: setPosition with x/y.\n- Minimize/maximize to test window state transitions.\n- Show/hide to test visibility behavior.\n- Close to shut down the app (destructive, cannot be undone).\n\nReturns: A text confirmation that the operation completed successfully.",
    {
      operation: z.enum(["focus", "minimize", "maximize", "unmaximize", "close", "show", "hide", "setPosition", "setSize", "center", "toggleFullscreen"]).describe("Required. The window management operation to perform. Valid values are: focus, minimize, maximize, unmaximize, close, show, hide, setPosition, setSize, center, toggleFullscreen."),
      window_label: z.string().default("main").describe("The identifier (e.g., visible title or internal label) of the application window to control. Defaults to 'main' if not specified."),
      x: z.number().int().optional().describe("The X-coordinate (in screen pixels) for the window's top-left corner. Required and used only for the 'setPosition' operation."),
      y: z.number().int().optional().describe("The Y-coordinate (in screen pixels) for the window's top-left corner. Required and used only for the 'setPosition' operation."),
      width: z.number().int().positive().optional().describe("The desired width of the window in pixels. Required and used only for the 'setSize' operation."),
      height: z.number().int().positive().optional().describe("The desired height of the window in pixels. Required and used only for the 'setSize' operation."),
    },
    {
      title: "Control Application Window State and Geometry",
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: false,
    },
    async ({ operation, window_label, x, y, width, height }) => {
      try {
        logger.debug(`Managing window with params: ${JSON.stringify({
          operation,
          window_label,
          x,
          y,
          width,
          height
        })}`);
        
        await socketClient.sendCommand('manage_window', {
          operation,
          window_label,
          x,
          y,
          width,
          height
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Window operation '${operation}' completed successfully`,
            },
          ],
        };
      } catch (error) {
        logger.error('Window management error:', error);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to manage window: ${(error as Error).message}`,
            },
          ],
        };
      }
    },
  );
} 