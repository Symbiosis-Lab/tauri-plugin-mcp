import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools, initializeSocket } from "./tools/index.js";
import { logger } from './logger.js';

// Create server instance
// Note: capabilities are inferred from registered tools/resources in MCP SDK 1.25+
const server = new McpServer({
  name: "tauri-mcp",
  version: "1.0.0",
});

async function main() {
  try {
    // Connect to the Tauri socket server at startup
    await initializeSocket();
    
    // Register all tools with the server
    registerAllTools(server);
    
    // Connect the server to stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info("Tauri MCP Server running on stdio");
  } catch (error) {
    logger.error("Fatal error in main():", error);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error("Fatal error in main():", error);
  process.exit(1);
});
