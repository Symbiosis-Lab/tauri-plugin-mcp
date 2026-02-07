import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { logger } from '../logger.js';
import { socketClient } from "./client.js";
import { createErrorResponse, createSuccessResponse, formatResultAsText, logCommandParams } from "./response-helpers.js";

export function registerIframeRpcTool(server: McpServer) {
  server.tool(
    "iframe_rpc",
    "Calls an RPC method on the preview iframe from within the Tauri app shell context. This bridges the app shell and the embedded preview iframe using a predefined RPC interface (the app shell listens for 'iframe-rpc' events, forwards the call to the iframe, and returns the result via 'iframe-rpc-response').\n\nWhen to use this vs Playwright:\n- Use iframe_rpc when you need to call application-defined RPC methods that the preview iframe exposes (e.g., custom query APIs, state inspection methods specific to the app).\n- Use Playwright directly on localhost:8080 for most preview testing: DOM inspection, clicking elements, reading text content, taking screenshots. Playwright is simpler and more reliable for standard DOM interactions.\n\nReturns: The serialized result from the iframe's RPC method handler. The exact shape depends on the RPC method called.",
    {
      method: z.string().describe("Required. The name of the RPC method to call on the iframe. This must match a method exposed by the iframe's RPC interface."),
      args: z.array(z.any()).default([]).describe("Optional. An array of arguments to pass to the RPC method. Defaults to an empty array if not specified."),
      window_label: z.string().default("main").describe("The identifier of the application window containing the iframe. Defaults to 'main' if not specified."),
      timeout_ms: z.number().int().positive().optional().describe("The maximum time in milliseconds to wait for the RPC response. Defaults to 10000ms (10 seconds) if not specified."),
    },
    {
      title: "Call RPC Method on Preview Iframe",
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: false,
    },
    async ({ method, args, window_label, timeout_ms }) => {
      try {
        // Validate required parameters
        if (!method || method.trim() === '') {
          return createErrorResponse("The method parameter is required and cannot be empty");
        }

        const params = { method, args, window_label, timeout_ms };
        logCommandParams('iframe_rpc', params);

        // Use default window label if not provided
        const effectiveWindowLabel = window_label || 'main';

        const result = await socketClient.sendCommand('iframe_rpc', {
          method,
          args: args || [],
          window_label: effectiveWindowLabel,
          timeout_ms
        });

        logger.debug(`Got iframe RPC result type: ${typeof result}`);

        return createSuccessResponse(formatResultAsText(result));
      } catch (error) {
        logger.error('Iframe RPC error:', error);
        return createErrorResponse(`Failed to execute iframe RPC: ${(error as Error).message}`);
      }
    },
  );
}
