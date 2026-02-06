/**
 * Auto-initialization entry point for the Tauri MCP plugin.
 *
 * This file is compiled to an IIFE by rollup and injected into every webview
 * via Builder::js_init_script(). It uses window.__TAURI__ globals (available
 * when withGlobalTauri is true in tauri.conf.json).
 */
import { setupPluginListeners } from './index';

setupPluginListeners().catch(err =>
  console.error('TAURI-PLUGIN-MCP: Failed to auto-initialize event listeners:', err)
);
