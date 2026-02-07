import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { logger } from '../logger.js';
import { socketClient } from "./client.js";

export function registerGetDomTool(server: McpServer) {
  server.tool(
    "get_dom",
    "Retrieves the full HTML DOM of the Tauri APP SHELL webview as a string. This returns the outer application chrome (toolbar, sidebar, settings, navigation), NOT the preview/document content.\n\nWhen to use this vs Playwright browser_snapshot:\n- Use get_dom for the APP SHELL: to inspect toolbar state, navigation structure, settings panels, modal dialogs in the Tauri webview.\n- Use Playwright browser_snapshot on localhost:8080 for PREVIEW CONTENT: to inspect the rendered document/article being previewed.\n\nReturns: The complete HTML string of the app shell webview's document. This can be large; consider using execute_js with a targeted querySelector if you only need a specific element.",
    {
      window_label: z.string().default("main").describe("The identifier (e.g., visible title or internal label) of the application window from which to retrieve the DOM content. Defaults to 'main' if not specified."),
    },
    {
      title: "Retrieve HTML DOM Content from Application Window",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    async ({ window_label }) => {
      try {
        logger.debug(`Getting DOM with params: ${JSON.stringify({
          window_label
        })}`);
        
        // The server expects just a string, not an object
        const result = await socketClient.sendCommand('get_dom', window_label);
        
        logger.debug(`Got DOM result type: ${typeof result}, length: ${
          typeof result === 'string' ? result.length : 'unknown'
        }`);
        
        // Ensure we have a string result
        let domContent;
        if (typeof result === 'string') {
          domContent = result;
        } else if (result && typeof result === 'object') {
          if (typeof result.data === 'string') {
            domContent = result.data;
          } else {
            domContent = JSON.stringify(result);
          }
        } else {
          domContent = String(result);
        }
        
        return {
          content: [
            {
              type: "text",
              text: domContent,
            },
          ],
        };
      } catch (error) {
        logger.error('DOM retrieval error:', error);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to get DOM: ${(error as Error).message}`,
            },
          ],
        };
      }
    },
  );
} 