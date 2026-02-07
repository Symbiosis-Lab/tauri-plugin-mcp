import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { logger } from '../logger.js';
import { socketClient } from "./client.js";

export function registerTextInputTool(server: McpServer) {
  server.tool(
    "simulate_text_input",
    "Simulates keyboard input by typing text character-by-character into the currently focused element in the Tauri app shell. Uses OS-level key simulation, so the target element must already have focus.\n\nWhen to use this vs Playwright browser_type:\n- Use simulate_text_input for typing into APP SHELL elements (toolbar search, settings fields, navigation inputs) that are inside the Tauri webview.\n- Use Playwright browser_type on localhost:8080 for typing into PREVIEW CONTENT elements. Playwright is more reliable for preview content because it handles focus, element targeting, and React state updates automatically.\n\nLimitation: Requires an element to already be focused. Does not target elements by selector -- use get_element_position with should_click=true first, or use send_text_to_element instead.\n\nReturns: A confirmation message with the number of characters typed.",
    {
      text: z.string().describe("Required. The string of text content to be typed out by the simulated keyboard input."),
      delay_ms: z.number().int().nonnegative().optional().describe("The delay in milliseconds between each simulated keystroke. Adjusts the typing speed."),
      initial_delay_ms: z.number().int().nonnegative().optional().describe("An initial delay in milliseconds before the simulation of typing begins. Useful for ensuring the target field is ready."),
    },
    {
      title: "Simulate Keyboard Text Input into Focused Field",
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: false,
    },
    async ({ text, delay_ms, initial_delay_ms }) => {
      try {
        // Validate required parameters
        if (!text) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: "The text parameter is required and cannot be empty",
              },
            ],
          };
        }
        
        logger.debug(`Simulating text input with params: ${JSON.stringify({
          text: text.length > 50 ? `${text.substring(0, 50)}...` : text,
          delay_ms,
          initial_delay_ms
        })}`);
        
        await socketClient.sendCommand('simulate_text_input', {
          text,
          delay_ms,
          initial_delay_ms
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Successfully simulated typing of ${text.length} characters`,
            },
          ],
        };
      } catch (error) {
        logger.error('Text input simulation error:', error);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to simulate text input: ${(error as Error).message}`,
            },
          ],
        };
      }
    },
  );
} 