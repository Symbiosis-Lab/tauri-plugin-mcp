import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { logger } from '../logger.js';
import { socketClient } from "./client.js";

export function registerManageLocalStorageTool(server: McpServer) {
  server.tool(
    "manage_local_storage",
    "Reads and modifies localStorage in the Tauri app shell webview. This is unique to tauri-mcp -- Playwright cannot access the Tauri webview's localStorage directly (it can only access localStorage on localhost:8080 for preview content).\n\nUse this to inspect or modify app-level persisted state such as user preferences, theme settings, cached data, or session tokens stored in the Tauri webview's localStorage.\n\nActions: get (read a key), set (write a key-value pair), remove (delete a key), clear (delete all), keys (list all keys).\n\nReturns: For 'get', returns the value string (or null). For 'keys', returns a JSON array of key names. For 'set'/'remove'/'clear', returns a confirmation.",
    {
      action: z.enum(["get", "set", "remove", "clear", "keys"]).describe("Required. The operation to perform on localStorage. Valid values are: \n - get: Retrieve the value of a specified key. \n - set: Store a key-value pair. \n - remove: Delete a specified key and its value. \n - clear: Remove all key-value pairs. \n - keys: Retrieve a list of all keys currently stored."),
      key: z.string().optional().describe("The key (name) of the localStorage item to operate on. Required for 'get', 'set', and 'remove' actions. Ignored for 'clear' and 'keys' actions."),
      value: z.string().optional().describe("The string value to store in localStorage. Required only for the 'set' action. Ignored for other actions."),
      window_label: z.string().optional().describe("The identifier (e.g., visible title or internal label) of the application window whose localStorage is to be managed."),
    },
    {
      title: "Manage Browser LocalStorage for Application Window",
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    async ({ action, key, value, window_label }) => {
      try {
        // Validate required parameters
        if (!action) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: "The action parameter is required (get, set, remove, clear, or keys)",
              },
            ],
          };
        }
        
        // Validate actions that require a key
        if ((action === 'set' || action === 'remove') && !key) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `The key parameter is required for the '${action}' action`,
              },
            ],
          };
        }
        
        // Validate set action requires a value
        if (action === 'set' && value === undefined) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: "The value parameter is required for the 'set' action",
              },
            ],
          };
        }
        
        // Use default window label if not provided
        const effectiveWindowLabel = window_label || 'main';
        
        logger.debug(`Managing localStorage with params: ${JSON.stringify({
          action,
          key,
          value: value?.substring(0, 50) + (value && value.length > 50 ? '...' : ''),
          window_label: effectiveWindowLabel
        })}`);
        
        const result = await socketClient.sendCommand('manage_local_storage', {
          action,
          key,
          value,
          window_label: effectiveWindowLabel
        });
        
        logger.debug(`Got localStorage result type: ${typeof result}`);
        
        // Format the result as a string based on the type
        let resultText;
        if (typeof result === 'string') {
          resultText = result;
        } else if (Array.isArray(result)) {
          resultText = JSON.stringify(result);
        } else if (result === null || result === undefined) {
          resultText = String(result);
        } else {
          resultText = JSON.stringify(result, null, 2);
        }
        
        return {
          content: [
            {
              type: "text",
              text: resultText,
            },
          ],
        };
      } catch (error) {
        logger.error('localStorage management error:', error);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to manage localStorage: ${(error as Error).message}`,
            },
          ],
        };
      }
    },
  );
} 