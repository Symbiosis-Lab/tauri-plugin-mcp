# Tauri Plugin: Model Context Protocol (MCP)

A Tauri plugin and MCP server that allow AI Agents such as Cursor and Claude Code to debug within your tauri application.

### Features

The Tauri MCP Plugin provides a comprehensive set of tools that allow AI models and external applications to interact with Tauri applications:

#### Window Interaction
- **Take Screenshot**: Capture images of any Tauri window with configurable quality and size
- **Window Management**: Control window position, size, focus, minimize/maximize state
- **DOM Access**: Retrieve the HTML DOM content from webviews windows

#### User Input Simulation
- **Mouse Movement**: Simulate mouse clicks, movements, and scrolling
- **Text Input**: Programmatically input text into focused elements
- **Execute JavaScript**: Run arbitrary JavaScript code in the application context

#### Data & Storage
- **Local Storage Management**: Get, set, remove, and clear localStorage entries
- **Ping**: Simple connectivity testing to verify the plugin is responsive

## Architecture: Screenshot Capture Strategy

The plugin provides two screenshot tools with complementary approaches:

### take_screenshot (Native)
Uses native OS screenshot APIs (via `xcap`) to capture window pixels directly. Requires screen recording permissions and window focus, but produces pixel-perfect captures.

### capture_screenshot (JavaScript-based)
Uses a layered fallback approach for permission-free, focus-free captures:

1. **Primary: SVG foreignObject → Canvas**
   - Clones DOM tree and embeds in SVG foreignObject
   - Renders via canvas drawImage
   - Most accurate HTML rendering
   - Works on non-WebKit browsers

2. **Secondary: DOM-walking renderer** (`renderSimplifiedSnapshot`)
   - Activated when SVG foreignObject taints canvas (WebKit security policy)
   - Walks DOM tree and renders backgrounds, borders, images, text via Canvas 2D API
   - Not pixel-perfect (no gradients/shadows/transforms) but sufficient for AI/LLM consumption
   - Runs in PARENT WINDOW (app shell/main webview)

3. **Tertiary: Iframe composition via postMessage**
   - For cross-origin iframes, sends `moss-capture-preview` message
   - Each iframe renders itself and returns JPEG data URL
   - Composited into final screenshot
   - **Requires iframe to implement handler** (see implementation notes below)

### Why Not Use html2canvas?

Popular libraries like `html2canvas` (45KB gzipped) and `html-to-image` (13-15KB gzipped) still use SVG foreignObject internally, so they don't solve WebKit canvas tainting. The custom DOM walker is:
- **Lighter**: Zero external dependencies, ~70 lines of code
- **CORS-safe**: No cross-origin restrictions
- **Sufficient**: Good enough quality for AI/LLM screenshot consumption
- **Fallback-only**: Only runs when SVG method fails

### For App Developers: Iframe Screenshot Support

If your Tauri app has iframes that need screenshot capture, implement the `moss-capture-preview` message handler in your iframe scripts. Example implementation:

```typescript
window.addEventListener("message", async (e: MessageEvent) => {
  if (e.data?.type !== "moss-capture-preview") return;

  const { id, quality = 85, maxWidth = 1920 } = e.data;

  try {
    // Wait for renders
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Create canvas and walk DOM to render backgrounds, borders, images, text
    // (Similar to renderSimplifiedSnapshot but runs inside iframe)

    const dataUrl = canvas.toDataURL("image/jpeg", quality / 100);

    window.parent.postMessage({
      type: "moss-capture-preview-result",
      id,
      success: true,
      data: dataUrl
    }, "*");
  } catch (err) {
    window.parent.postMessage({
      type: "moss-capture-preview-result",
      id,
      success: false,
      error: String(err)
    }, "*");
  }
});
```

See [moss's iframe-bridge.ts](https://github.com/Symbiosis-Lab/moss/blob/main/src-tauri/src/preview/ts/iframe-bridge.ts#L260-L373) for a complete reference implementation.

## How to build
```bash
pnpm i 
pnpm run build && pnpm run build-plugin
```

Follow instructions at https://v2.tauri.app/start/create-project/

in src-tauri/cargo.toml add
```toml
tauri-plugin-mcp = { path = "../../tauri-plugin-mcp" }
```

In package.json
```json
    "tauri-plugin-mcp": "file:../tauri-mcp",
```

Then, register the plugin in your Tauri application:

## Only include the MCP plugin in development builds
### Take care to set the Application name correctly, this is how it identifies the window to screenshot
```rust
    #[cfg(debug_assertions)]
    {
        info!("Development build detected, enabling MCP plugin");
        tauri::Builder::default()
        .plugin(tauri_mcp::init_with_config(
         tauri_mcp::PluginConfig::new(String::new("APPLICATION_NAME")) 
                .start_socket_server(true)
                // For IPC socket (default)
                .socket_path("/tmp/tauri-mcp.sock")
                // Or for TCP socket
                // .tcp("127.0.0.1", 9999)
        ));
    }
```

## Setting up MCP Server

First, build the MCP server:
```bash
cd mcp-server-ts
pnpm i
pnpm build
```

### Configuration Examples

#### IPC Mode (Default)
This is the default mode using platform-specific local sockets:

```json
{
  "mcpServers": {
    "tauri-mcp": {
      "command": "node",
      "args": ["C:\\Users\\Pegleg\\workspace\\tauri-plugin-mcp\\mcp-server-ts\\build\\index.js"]
    }
  }
}
```

Or with a custom socket path:
```json
{
  "mcpServers": {
    "tauri-mcp": {
      "command": "node",
      "args": ["C:\\Users\\Pegleg\\workspace\\tauri-plugin-mcp\\mcp-server-ts\\build\\index.js"],
      "env": {
        "TAURI_MCP_IPC_PATH": "/custom/path/to/socket"
      }
    }
  }
}
```

#### TCP Mode
For TCP connections (useful for Docker, remote debugging, or when IPC doesn't work):

```json
{
  "mcpServers": {
    "tauri-mcp": {
      "command": "node",
      "args": ["C:\\Users\\Pegleg\\workspace\\tauri-plugin-mcp\\mcp-server-ts\\build\\index.js"],
      "env": {
        "TAURI_MCP_CONNECTION_TYPE": "tcp",
        "TAURI_MCP_TCP_HOST": "127.0.0.1",
        "TAURI_MCP_TCP_PORT": "4000"
      }
    }
  }
}
```

**Important**: Make sure your Tauri app is configured to use the same connection mode and settings:
```rust
// For TCP mode in your Tauri app
.plugin(tauri_mcp::init_with_config(
    PluginConfig::new("MyApp".to_string())
        .tcp("127.0.0.1".to_string(), 4000)
))
```

## Communication Between Tauri Plugin MCP Components

The Tauri MCP plugin supports both IPC and TCP socket communication to expose Tauri application functionality to external clients:

### Socket Server (Rust)

The `socket_server.rs` component:

- Creates either an IPC socket (Unix socket on macOS/Linux, named pipe on Windows) or TCP socket
- Listens for client connections on the configured socket
- Processes incoming JSON commands
- Executes Tauri API calls based on the commands
- Returns results as JSON responses

### Socket Client (TypeScript)

The `client.ts` component:

- Connects to either IPC or TCP socket based on environment configuration
- Provides a Promise-based API for sending commands
- Handles reconnection logic and error management
- Parses JSON responses from the server

## Troubleshooting

### Common Issues

1. **"Connection refused" error**
   - Ensure your Tauri app is running and the socket server started successfully
   - Check that both sides are using the same connection mode (IPC or TCP)
   - For TCP, verify the port number matches on both sides

2. **"Socket file not found" (IPC mode)**
   - Check the socket path exists (look in `/tmp` on macOS/Linux)
   - Ensure proper permissions to create/access the socket file
   - Try using TCP mode as an alternative

3. **"Permission denied" errors**
   - On Windows, ensure the named pipe path is correct
   - On Unix systems, check file permissions for the socket
   - Consider using TCP mode which avoids file permission issues

4. **Connection drops after each request**
   - Update to the latest version which includes persistent connection support
   - Check for any errors in the Tauri app console

### Testing Your Setup

You can test your MCP server configuration using the MCP Inspector:

```bash
# For IPC mode (default)
cd mcp-server-ts
npx @modelcontextprotocol/inspector node build/index.js

# For TCP mode
cd mcp-server-ts
set TAURI_MCP_CONNECTION_TYPE=tcp&& set TAURI_MCP_TCP_HOST=127.0.0.1&& set TAURI_MCP_TCP_PORT=4000&& npx @modelcontextprotocol/inspector node build\index.js
```