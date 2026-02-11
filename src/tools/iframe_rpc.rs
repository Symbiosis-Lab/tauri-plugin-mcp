use serde::{Serialize, Serializer};
use serde_json::Value;
use std::fmt;
use std::sync::mpsc;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Listener, Runtime};

use crate::desktop::resolve_webview;
use crate::error::Error;
use crate::socket_server::SocketResponse;

// Define a custom error type for iframe RPC operations
#[derive(Debug)]
pub enum IframeRpcError {
    WebviewOperation(String),
    RpcError(String),
    Timeout(String),
}

// Implement Display for the error
impl fmt::Display for IframeRpcError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            IframeRpcError::WebviewOperation(s) => write!(f, "Iframe RPC error: {}", s),
            IframeRpcError::RpcError(s) => write!(f, "RPC error: {}", s),
            IframeRpcError::Timeout(s) => write!(f, "Operation timed out: {}", s),
        }
    }
}

// Make the error serializable
impl Serialize for IframeRpcError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

// Support conversion from timeout error
impl From<mpsc::RecvTimeoutError> for IframeRpcError {
    fn from(err: mpsc::RecvTimeoutError) -> Self {
        IframeRpcError::Timeout(format!(
            "Timeout waiting for iframe RPC response: {}",
            err
        ))
    }
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct IframeRpcRequest {
    /// The RPC method to call on the iframe
    pub method: String,
    /// Arguments to pass to the RPC method
    #[serde(default)]
    pub args: Vec<Value>,
    /// Optional window label (defaults to "main")
    pub window_label: Option<String>,
    /// Optional timeout in milliseconds (defaults to 10000ms)
    pub timeout_ms: Option<u64>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct IframeRpcResponse {
    pub success: bool,
    pub result: Option<Value>,
    pub error: Option<String>,
}

pub async fn handle_iframe_rpc<R: Runtime>(
    app: &AppHandle<R>,
    payload: Value,
) -> Result<SocketResponse, Error> {
    let request: IframeRpcRequest = serde_json::from_value(payload)
        .map_err(|e| Error::Anyhow(format!("Invalid payload for iframe_rpc: {}", e)))?;

    // Get the window label or use "main" as default
    let window_label = request
        .window_label
        .clone()
        .unwrap_or_else(|| "main".to_string());

    // Verify the webview exists using resolve_webview (supports multi-webview architecture)
    let (resolved_label, _webview) = resolve_webview(app, &window_label)?;

    // Update request with resolved label for emit_to
    let mut resolved_request = request.clone();
    resolved_request.window_label = Some(resolved_label);

    // Execute the iframe RPC and get the result
    let result = execute_iframe_rpc(app.clone(), resolved_request).await;

    // Handle the result
    match result {
        Ok(response) => {
            // Serialize the response
            let data = serde_json::to_value(response)
                .map_err(|e| Error::Anyhow(format!("Failed to serialize response: {}", e)))?;

            Ok(SocketResponse {
                success: true,
                data: Some(data),
                error: None,
            })
        }
        Err(e) => Ok(SocketResponse {
            success: false,
            data: None,
            error: Some(e.to_string()),
        }),
    }
}

// Helper function to execute iframe RPC and await response
async fn execute_iframe_rpc<R: Runtime>(
    app: AppHandle<R>,
    params: IframeRpcRequest,
) -> Result<IframeRpcResponse, IframeRpcError> {
    // Get window label
    let window_label = params
        .window_label
        .clone()
        .unwrap_or_else(|| "main".to_string());

    // Get timeout or use default (10 seconds)
    let timeout = Duration::from_millis(params.timeout_ms.unwrap_or(10000));

    // Create the RPC payload
    let rpc_payload = serde_json::json!({
        "method": params.method,
        "args": params.args
    });

    // Set up a channel to receive the response BEFORE emitting (avoid race condition)
    let (tx, rx) = mpsc::channel();

    // Listen for response
    app.once("iframe-rpc-response", move |event| {
        let payload = event.payload().to_string();
        let _ = tx.send(payload);
    });

    eprintln!("[TAURI_MCP] Emitting iframe-rpc event to webview: {}", window_label);

    app.emit_to(&window_label, "iframe-rpc", &rpc_payload)
        .map_err(|e| {
            IframeRpcError::WebviewOperation(format!("Failed to emit iframe-rpc event: {}", e))
        })?;

    // Wait for the response with timeout
    match rx.recv_timeout(timeout) {
        Ok(result_string) => {
            // Parse the response JSON
            let response: Value = serde_json::from_str(&result_string).map_err(|e| {
                IframeRpcError::RpcError(format!("Failed to parse response: {}", e))
            })?;

            // Check if result contains a real error (ignore null/empty values)
            if let Some(error) = response.get("error") {
                let is_real_error = match error {
                    Value::Null => false,
                    Value::Bool(false) => false,
                    Value::String(s) => !s.is_empty(),
                    _ => true,
                };
                if is_real_error {
                    let error_str = if let Some(s) = error.as_str() {
                        s.to_string()
                    } else {
                        serde_json::to_string(error).unwrap_or_else(|_| "Unknown error".to_string())
                    };
                    return Ok(IframeRpcResponse {
                        success: false,
                        result: None,
                        error: Some(error_str),
                    });
                }
            }

            // Return successful response with result
            Ok(IframeRpcResponse {
                success: true,
                result: response.get("result").cloned(),
                error: None,
            })
        }
        Err(e) => Err(e.into()),
    }
}
