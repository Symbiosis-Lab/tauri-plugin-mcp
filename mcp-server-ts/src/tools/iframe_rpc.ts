import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { logger } from '../logger.js';
import { socketClient } from "./client.js";
import { createErrorResponse, createSuccessResponse, formatResultAsText, logCommandParams } from "./response-helpers.js";

export function registerIframeRpcTool(server: McpServer) {
  server.tool(
    "iframe_rpc",
    "Calls an RPC method on the preview iframe within the application window. This allows communication with embedded iframe content through a predefined RPC interface. The frontend must have an event listener for 'iframe-rpc' that forwards the call to the iframe and emits 'iframe-rpc-response' with the result.",
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
