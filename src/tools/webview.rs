use serde::{Deserialize, Serialize, Serializer}; // Add Deserialize for parsing payload
use serde_json::Value;
use std::fmt;
use std::sync::mpsc;
use std::time::Duration;
use tauri::{AppHandle, Error as TauriError, Emitter, Listener, Manager, Runtime, WebviewWindow};

use crate::desktop::resolve_webview;

// Custom error enum for the get_dom_text command
#[derive(Debug)] // Add Serialize for the enum itself if it needs to be directly serialized
// For now, we serialize its string representation
pub enum GetDomError {
    WebviewOperation(String),
    JavaScriptError(String),
    DomIsEmpty,
}

// Implement Display for GetDomError to allow.to_string()
impl fmt::Display for GetDomError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            GetDomError::WebviewOperation(s) => write!(f, "Webview operation error: {}", s),
            GetDomError::JavaScriptError(s) => write!(f, "JavaScript execution error: {}", s),
            GetDomError::DomIsEmpty => write!(f, "Retrieved DOM string is empty"),
        }
    }
}

// Implement Serialize for GetDomError so it can be returned to the frontend
impl Serialize for GetDomError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

// Automatically convert tauri::Error into GetDomError::WebviewOperation or JavaScriptError
impl From<TauriError> for GetDomError {
    fn from(err: TauriError) -> Self {
        // Basic differentiation, could be more sophisticated if TauriError variants allow
        match err {
            _ => GetDomError::JavaScriptError(err.to_string()), // Default to JS error as eval is involved
        }
    }
}

// Handler function for the getDom command, following the take_screenshot pattern
pub async fn handle_get_dom<R: Runtime>(
    app: &AppHandle<R>,
    payload: Value,
) -> Result<crate::socket_server::SocketResponse, crate::error::Error> {
    // Parse the window label from the payload - handle both string and object formats
    let window_label = if payload.is_string() {
        // Direct string format
        payload
            .as_str()
            .ok_or_else(|| {
                crate::error::Error::Anyhow("Invalid string payload for getDom".to_string())
            })?
            .to_string()
    } else if payload.is_object() {
        // Object with window_label property
        payload
            .get("window_label")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .ok_or_else(|| {
                crate::error::Error::Anyhow(
                    "Missing or invalid window_label in payload object".to_string(),
                )
            })?
    } else {
        return Err(crate::error::Error::Anyhow(format!(
            "Invalid payload format for getDom: expected string or object with window_label, got {}",
            payload
        )));
    };

    // Use resolve_webview to support both single and multi-webview architectures
    let (resolved_label, _webview) = resolve_webview(app, &window_label)?;

    // Get DOM content using the resolved webview label
    let result = get_dom_text_for_label(app.clone(), &resolved_label).await;
    match result {
        Ok(dom_text) => {
            let data = serde_json::to_value(dom_text).map_err(|e| {
                crate::error::Error::Anyhow(format!("Failed to serialize response: {}", e))
            })?;
            Ok(crate::socket_server::SocketResponse {
                success: true,
                data: Some(data),
                error: None,
            })
        }
        Err(e) => Ok(crate::socket_server::SocketResponse {
            success: false,
            data: None,
            error: Some(e.to_string()),
        }),
    }
}

/// Get DOM text from a specific webview by label (supports multi-webview architecture)
pub async fn get_dom_text_for_label<R: Runtime>(
    app: AppHandle<R>,
    webview_label: &str,
) -> Result<String, GetDomError> {
    eprintln!("[TAURI_MCP] Getting DOM from webview: {}", webview_label);
    app.emit_to(webview_label, "got-dom-content", "test")
        .map_err(|e| GetDomError::WebviewOperation(format!("Failed to emit to {}: {}", webview_label, e)))?;

    let (tx, rx) = mpsc::channel();

    app.once("got-dom-content-response", move |event| {
        let payload = event.payload().to_string();
        let _ = tx.send(payload);
    });

    // Wait for the content
    match rx.recv_timeout(std::time::Duration::from_secs(5)) {
        Ok(dom_string) => {
            if dom_string.is_empty() {
                Err(GetDomError::DomIsEmpty)
            } else {
                Ok(dom_string)
            }
        }
        Err(e) => {
            Err(GetDomError::from(e))
        }
    }
}

#[tauri::command]
pub async fn get_dom_text<R: Runtime>(
    app: AppHandle<R>,
    _window: WebviewWindow<R>,
) -> Result<String, GetDomError> {
    // Legacy function - calls the new implementation with "main" label
    get_dom_text_for_label(app, "main").await
}

// Second fix: add From implementation for RecvTimeoutError
impl From<mpsc::RecvTimeoutError> for GetDomError {
    fn from(err: mpsc::RecvTimeoutError) -> Self {
        GetDomError::WebviewOperation(format!("Timeout waiting for DOM: {}", err))
    }
}

// Define the structure for get_element_position payload
#[derive(Debug, Deserialize)]
struct GetElementPositionPayload {
    window_label: String,
    selector_type: String,
    selector_value: String,
    #[serde(default)]
    should_click: bool,
    #[serde(default)]
    raw_coordinates: bool,
}

// Handle getting element position
pub async fn handle_get_element_position<R: Runtime>(
    app: &AppHandle<R>,
    payload: Value,
) -> Result<crate::socket_server::SocketResponse, crate::error::Error> {
    // Parse the payload
    let payload = serde_json::from_value::<GetElementPositionPayload>(payload).map_err(|e| {
        crate::error::Error::Anyhow(format!("Invalid payload for get_element_position: {}", e))
    })?;

    // Resolve webview label (supports multi-webview architecture, e.g. "main" -> "preview")
    let (resolved_label, _webview) = resolve_webview(app, &payload.window_label)?;

    // Create a channel to receive the result
    let (tx, rx) = mpsc::channel();

    // Event name for the response
    let event_name = "get-element-position-response";

    // Set up the listener for the response
    app.once(event_name, move |event| {
        let payload = event.payload().to_string();
        let _ = tx.send(payload);
    });

    // Prepare the request payload with selector information
    let js_payload = serde_json::json!({
        "windowLabel": resolved_label,
        "selectorType": payload.selector_type,
        "selectorValue": payload.selector_value,
        "shouldClick": payload.should_click,
        "rawCoordinates": payload.raw_coordinates
    });

    // Emit the event to the resolved webview
    app.emit_to(&resolved_label, "get-element-position", js_payload)
        .map_err(|e| {
            crate::error::Error::Anyhow(format!("Failed to emit get-element-position event: {}", e))
        })?;

    // Wait for the response with a timeout
    match rx.recv_timeout(std::time::Duration::from_secs(5)) {
        Ok(result) => {
            // Parse the result
            let result_value: Value = serde_json::from_str(&result).map_err(|e| {
                crate::error::Error::Anyhow(format!("Failed to parse result: {}", e))
            })?;

            let success = result_value
                .get("success")
                .and_then(|v| v.as_bool())
                .unwrap_or(false);

            if success {
                Ok(crate::socket_server::SocketResponse {
                    success: true,
                    data: Some(result_value.get("data").cloned().unwrap_or(Value::Null)),
                    error: None,
                })
            } else {
                let error = result_value
                    .get("error")
                    .and_then(|v| v.as_str())
                    .unwrap_or("Unknown error occurred");

                Ok(crate::socket_server::SocketResponse {
                    success: false,
                    data: None,
                    error: Some(error.to_string()),
                })
            }
        }
        Err(e) => Ok(crate::socket_server::SocketResponse {
            success: false,
            data: None,
            error: Some(format!(
                "Timeout waiting for element position result: {}",
                e
            )),
        }),
    }
}

// Define the structure for send_text_to_element payload
#[derive(Debug, Deserialize)]
struct SendTextToElementPayload {
    window_label: String,
    selector_type: String,
    selector_value: String,
    text: String,
    #[serde(default = "default_delay_ms")]
    delay_ms: u32,
}

// Default delay_ms value
fn default_delay_ms() -> u32 {
    20
}

// Handle sending text to an element
pub async fn handle_send_text_to_element<R: Runtime>(
    app: &AppHandle<R>,
    payload: Value,
) -> Result<crate::socket_server::SocketResponse, crate::error::Error> {
    // Parse the payload
    let payload = serde_json::from_value::<SendTextToElementPayload>(payload).map_err(|e| {
        crate::error::Error::Anyhow(format!("Invalid payload for send_text_to_element: {}", e))
    })?;

    // Resolve webview label (supports multi-webview architecture, e.g. "main" -> "preview")
    let (resolved_label, _webview) = resolve_webview(app, &payload.window_label)?;

    // Create a channel to receive the result
    let (tx, rx) = mpsc::channel();

    // Event name for the response
    let event_name = "send-text-to-element-response";

    // Set up the listener for the response
    app.once(event_name, move |event| {
        let payload = event.payload().to_string();
        let _ = tx.send(payload);
    });

    // Prepare the request payload
    let js_payload = serde_json::json!({
        "selectorType": payload.selector_type,
        "selectorValue": payload.selector_value,
        "text": payload.text,
        "delayMs": payload.delay_ms
    });

    // Emit the event to the resolved webview
    app.emit_to(&resolved_label, "send-text-to-element", js_payload)
        .map_err(|e| {
            crate::error::Error::Anyhow(format!("Failed to emit send-text-to-element event: {}", e))
        })?;

    // Wait for the response with a timeout
    match rx.recv_timeout(std::time::Duration::from_secs(30)) {
        // Longer timeout for typing text
        Ok(result) => {
            // Parse the result
            let result_value: Value = serde_json::from_str(&result).map_err(|e| {
                crate::error::Error::Anyhow(format!("Failed to parse result: {}", e))
            })?;

            let success = result_value
                .get("success")
                .and_then(|v| v.as_bool())
                .unwrap_or(false);

            if success {
                Ok(crate::socket_server::SocketResponse {
                    success: true,
                    data: Some(result_value.get("data").cloned().unwrap_or(Value::Null)),
                    error: None,
                })
            } else {
                let error = result_value
                    .get("error")
                    .and_then(|v| v.as_str())
                    .unwrap_or("Unknown error occurred");

                Ok(crate::socket_server::SocketResponse {
                    success: false,
                    data: None,
                    error: Some(error.to_string()),
                })
            }
        }
        Err(e) => Ok(crate::socket_server::SocketResponse {
            success: false,
            data: None,
            error: Some(format!("Timeout waiting for text input completion: {}", e)),
        }),
    }
}

// ========== JS-Based Screenshot Capture ==========
// This captures the webview's content using JavaScript (similar to Playwright).
// It doesn't require Screen Recording permissions or window focus.

/// Payload structure for JS-based screenshot capture
#[derive(Debug, Deserialize)]
pub struct CaptureScreenshotPayload {
    window_label: Option<String>,
    quality: Option<u8>,
    max_width: Option<u32>,
}

/// Handler for JS-based screenshot capture
pub async fn handle_capture_screenshot<R: Runtime>(
    app: &AppHandle<R>,
    payload: Value,
) -> Result<crate::socket_server::SocketResponse, crate::error::Error> {
    // Parse payload
    let parsed: CaptureScreenshotPayload = if payload.is_object() {
        serde_json::from_value(payload.clone()).unwrap_or(CaptureScreenshotPayload {
            window_label: None,
            quality: None,
            max_width: None,
        })
    } else {
        CaptureScreenshotPayload {
            window_label: payload.as_str().map(|s| s.to_string()),
            quality: None,
            max_width: None,
        }
    };

    let window_label = parsed.window_label.unwrap_or_else(|| "main".to_string());
    let quality = parsed.quality.unwrap_or(85);
    let max_width = parsed.max_width.unwrap_or(1920);

    eprintln!("[TAURI_MCP] JS-based screenshot capture for window: {}", window_label);

    // Resolve the webview label for multi-webview architectures
    let (resolved_label, _webview) = resolve_webview(app, &window_label)?;

    eprintln!("[TAURI_MCP] Resolved to webview: {}", resolved_label);

    // Create channel to receive the result
    let (tx, rx) = mpsc::channel();

    // Set up listener for the response
    app.once("capture-screenshot-response", move |event| {
        let payload = event.payload().to_string();
        let _ = tx.send(payload);
    });

    // Prepare the payload for the JS handler
    let js_payload = serde_json::json!({
        "quality": quality,
        "maxWidth": max_width
    });

    // Emit the event to the webview
    // Note: Using emit() broadcast since emit_to may not work reliably for webview events
    eprintln!("[TAURI_MCP] Emitting capture-screenshot event to webview: {}", resolved_label);

    // First try emit_to to the resolved webview label
    if let Err(e) = app.emit_to(&resolved_label, "capture-screenshot", js_payload.clone()) {
        eprintln!("[TAURI_MCP] emit_to failed, trying broadcast: {}", e);
    }

    // Also broadcast as fallback in case emit_to doesn't reach the webview
    app.emit("capture-screenshot", js_payload)
        .map_err(|e| {
            crate::error::Error::Anyhow(format!("Failed to emit capture-screenshot event: {}", e))
        })?;

    // Wait for the response with a timeout (longer timeout for rendering)
    match rx.recv_timeout(Duration::from_secs(30)) {
        Ok(result_string) => {
            // Parse the result
            let result: Value = serde_json::from_str(&result_string).map_err(|e| {
                crate::error::Error::Anyhow(format!("Failed to parse screenshot result: {}", e))
            })?;

            let success = result.get("success").and_then(|v| v.as_bool()).unwrap_or(false);

            if success {
                // Extract the data URL
                let data = result.get("data").cloned().unwrap_or(Value::Null);

                eprintln!("[TAURI_MCP] JS-based screenshot capture successful");

                // Return in the same format as the native screenshot
                Ok(crate::socket_server::SocketResponse {
                    success: true,
                    data: Some(serde_json::json!({
                        "data": data,
                        "success": true,
                        "error": null
                    })),
                    error: None,
                })
            } else {
                let error = result
                    .get("error")
                    .and_then(|v| v.as_str())
                    .unwrap_or("Unknown error during JS screenshot capture");

                eprintln!("[TAURI_MCP] JS-based screenshot capture failed: {}", error);

                Ok(crate::socket_server::SocketResponse {
                    success: false,
                    data: None,
                    error: Some(error.to_string()),
                })
            }
        }
        Err(e) => {
            eprintln!("[TAURI_MCP] Timeout waiting for JS screenshot: {}", e);
            Ok(crate::socket_server::SocketResponse {
                success: false,
                data: None,
                error: Some(format!("Timeout waiting for screenshot capture: {}", e)),
            })
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    // ========== CaptureScreenshotPayload Parsing Tests ==========

    #[test]
    fn test_capture_screenshot_payload_full_object() {
        // Test parsing a complete payload with all fields
        let payload = json!({
            "window_label": "preview",
            "quality": 90,
            "max_width": 1280
        });

        let parsed: CaptureScreenshotPayload = serde_json::from_value(payload).unwrap();
        assert_eq!(parsed.window_label, Some("preview".to_string()));
        assert_eq!(parsed.quality, Some(90));
        assert_eq!(parsed.max_width, Some(1280));
    }

    #[test]
    fn test_capture_screenshot_payload_partial_object() {
        // Test parsing with only window_label
        let payload = json!({
            "window_label": "main"
        });

        let parsed: CaptureScreenshotPayload = serde_json::from_value(payload).unwrap();
        assert_eq!(parsed.window_label, Some("main".to_string()));
        assert_eq!(parsed.quality, None);
        assert_eq!(parsed.max_width, None);
    }

    #[test]
    fn test_capture_screenshot_payload_empty_object() {
        // Test parsing an empty object (all fields are optional)
        let payload = json!({});

        let parsed: CaptureScreenshotPayload = serde_json::from_value(payload).unwrap();
        assert_eq!(parsed.window_label, None);
        assert_eq!(parsed.quality, None);
        assert_eq!(parsed.max_width, None);
    }

    #[test]
    fn test_capture_screenshot_payload_quality_bounds() {
        // Test quality at minimum value
        let payload_min = json!({
            "quality": 1
        });
        let parsed_min: CaptureScreenshotPayload = serde_json::from_value(payload_min).unwrap();
        assert_eq!(parsed_min.quality, Some(1));

        // Test quality at maximum value
        let payload_max = json!({
            "quality": 100
        });
        let parsed_max: CaptureScreenshotPayload = serde_json::from_value(payload_max).unwrap();
        assert_eq!(parsed_max.quality, Some(100));
    }

    #[test]
    fn test_capture_screenshot_payload_max_width_values() {
        // Test various max_width values
        let payload = json!({
            "max_width": 3840
        });
        let parsed: CaptureScreenshotPayload = serde_json::from_value(payload).unwrap();
        assert_eq!(parsed.max_width, Some(3840));

        // Test small max_width
        let payload_small = json!({
            "max_width": 320
        });
        let parsed_small: CaptureScreenshotPayload = serde_json::from_value(payload_small).unwrap();
        assert_eq!(parsed_small.max_width, Some(320));
    }

    // ========== Payload Parsing Logic Tests ==========

    #[test]
    fn test_parse_payload_as_object() {
        // Simulate the parsing logic from handle_capture_screenshot for object payloads
        let payload = json!({
            "window_label": "test_window",
            "quality": 75,
            "max_width": 1600
        });

        let parsed: CaptureScreenshotPayload = if payload.is_object() {
            serde_json::from_value(payload.clone()).unwrap_or(CaptureScreenshotPayload {
                window_label: None,
                quality: None,
                max_width: None,
            })
        } else {
            CaptureScreenshotPayload {
                window_label: payload.as_str().map(|s| s.to_string()),
                quality: None,
                max_width: None,
            }
        };

        assert_eq!(parsed.window_label, Some("test_window".to_string()));
        assert_eq!(parsed.quality, Some(75));
        assert_eq!(parsed.max_width, Some(1600));
    }

    #[test]
    fn test_parse_payload_as_string() {
        // Simulate the parsing logic from handle_capture_screenshot for string payloads
        let payload = json!("my_window");

        let parsed: CaptureScreenshotPayload = if payload.is_object() {
            serde_json::from_value(payload.clone()).unwrap_or(CaptureScreenshotPayload {
                window_label: None,
                quality: None,
                max_width: None,
            })
        } else {
            CaptureScreenshotPayload {
                window_label: payload.as_str().map(|s| s.to_string()),
                quality: None,
                max_width: None,
            }
        };

        assert_eq!(parsed.window_label, Some("my_window".to_string()));
        assert_eq!(parsed.quality, None);
        assert_eq!(parsed.max_width, None);
    }

    #[test]
    fn test_parse_payload_null() {
        // Test parsing null payload (edge case)
        let payload = json!(null);

        let parsed: CaptureScreenshotPayload = if payload.is_object() {
            serde_json::from_value(payload.clone()).unwrap_or(CaptureScreenshotPayload {
                window_label: None,
                quality: None,
                max_width: None,
            })
        } else {
            CaptureScreenshotPayload {
                window_label: payload.as_str().map(|s| s.to_string()),
                quality: None,
                max_width: None,
            }
        };

        assert_eq!(parsed.window_label, None);
        assert_eq!(parsed.quality, None);
        assert_eq!(parsed.max_width, None);
    }

    // ========== Default Value Tests ==========

    #[test]
    fn test_default_values_applied() {
        // Test that default values are applied correctly in the handler logic
        let parsed = CaptureScreenshotPayload {
            window_label: None,
            quality: None,
            max_width: None,
        };

        let window_label = parsed.window_label.unwrap_or_else(|| "main".to_string());
        let quality = parsed.quality.unwrap_or(85);
        let max_width = parsed.max_width.unwrap_or(1920);

        assert_eq!(window_label, "main");
        assert_eq!(quality, 85);
        assert_eq!(max_width, 1920);
    }

    #[test]
    fn test_custom_values_override_defaults() {
        // Test that custom values override defaults
        let parsed = CaptureScreenshotPayload {
            window_label: Some("custom".to_string()),
            quality: Some(50),
            max_width: Some(800),
        };

        let window_label = parsed.window_label.unwrap_or_else(|| "main".to_string());
        let quality = parsed.quality.unwrap_or(85);
        let max_width = parsed.max_width.unwrap_or(1920);

        assert_eq!(window_label, "custom");
        assert_eq!(quality, 50);
        assert_eq!(max_width, 800);
    }

    // ========== JS Payload Generation Tests ==========

    #[test]
    fn test_js_payload_generation() {
        // Test that the JS payload is generated correctly
        let quality: u8 = 90;
        let max_width: u32 = 1280;

        let js_payload = serde_json::json!({
            "quality": quality,
            "maxWidth": max_width
        });

        assert_eq!(js_payload.get("quality").and_then(|v| v.as_u64()), Some(90));
        assert_eq!(js_payload.get("maxWidth").and_then(|v| v.as_u64()), Some(1280));
    }

    // ========== Response Format Tests ==========

    #[test]
    fn test_success_response_format() {
        // Test the success response format
        let data = json!({
            "data": "base64_image_data_here",
            "success": true,
            "error": null
        });

        let response = crate::socket_server::SocketResponse {
            success: true,
            data: Some(data.clone()),
            error: None,
        };

        assert!(response.success);
        assert!(response.error.is_none());
        assert!(response.data.is_some());

        let response_data = response.data.unwrap();
        assert_eq!(response_data.get("success").and_then(|v| v.as_bool()), Some(true));
        assert_eq!(response_data.get("data").and_then(|v| v.as_str()), Some("base64_image_data_here"));
        assert!(response_data.get("error").and_then(|v| v.as_null()).is_some());
    }

    #[test]
    fn test_error_response_format() {
        // Test the error response format
        let response = crate::socket_server::SocketResponse {
            success: false,
            data: None,
            error: Some("Failed to capture screenshot".to_string()),
        };

        assert!(!response.success);
        assert!(response.data.is_none());
        assert_eq!(response.error, Some("Failed to capture screenshot".to_string()));
    }

    #[test]
    fn test_timeout_error_response() {
        // Test timeout error response format
        let error_msg = format!("Timeout waiting for screenshot capture: {}", "channel is empty and sending half is closed");

        let response = crate::socket_server::SocketResponse {
            success: false,
            data: None,
            error: Some(error_msg.clone()),
        };

        assert!(!response.success);
        assert!(response.error.as_ref().unwrap().contains("Timeout"));
    }

    // ========== GetDomError Tests ==========

    #[test]
    fn test_get_dom_error_display() {
        let webview_err = GetDomError::WebviewOperation("test error".to_string());
        assert_eq!(webview_err.to_string(), "Webview operation error: test error");

        let js_err = GetDomError::JavaScriptError("js error".to_string());
        assert_eq!(js_err.to_string(), "JavaScript execution error: js error");

        let empty_err = GetDomError::DomIsEmpty;
        assert_eq!(empty_err.to_string(), "Retrieved DOM string is empty");
    }

    #[test]
    fn test_get_dom_error_serialize() {
        let err = GetDomError::DomIsEmpty;
        let serialized = serde_json::to_string(&err).unwrap();
        assert_eq!(serialized, "\"Retrieved DOM string is empty\"");
    }

    // ========== GetElementPositionPayload Tests ==========

    #[test]
    fn test_get_element_position_payload_full() {
        let payload = json!({
            "window_label": "main",
            "selector_type": "css",
            "selector_value": "#my-button",
            "should_click": true,
            "raw_coordinates": false
        });

        let parsed: GetElementPositionPayload = serde_json::from_value(payload).unwrap();
        assert_eq!(parsed.window_label, "main");
        assert_eq!(parsed.selector_type, "css");
        assert_eq!(parsed.selector_value, "#my-button");
        assert!(parsed.should_click);
        assert!(!parsed.raw_coordinates);
    }

    #[test]
    fn test_get_element_position_payload_defaults() {
        let payload = json!({
            "window_label": "main",
            "selector_type": "xpath",
            "selector_value": "//button"
        });

        let parsed: GetElementPositionPayload = serde_json::from_value(payload).unwrap();
        assert_eq!(parsed.window_label, "main");
        assert_eq!(parsed.selector_type, "xpath");
        assert_eq!(parsed.selector_value, "//button");
        // Default values for optional boolean fields
        assert!(!parsed.should_click);
        assert!(!parsed.raw_coordinates);
    }

    // ========== SendTextToElementPayload Tests ==========

    #[test]
    fn test_send_text_to_element_payload_full() {
        let payload = json!({
            "window_label": "main",
            "selector_type": "css",
            "selector_value": "#input-field",
            "text": "Hello World",
            "delay_ms": 50
        });

        let parsed: SendTextToElementPayload = serde_json::from_value(payload).unwrap();
        assert_eq!(parsed.window_label, "main");
        assert_eq!(parsed.selector_type, "css");
        assert_eq!(parsed.selector_value, "#input-field");
        assert_eq!(parsed.text, "Hello World");
        assert_eq!(parsed.delay_ms, 50);
    }

    #[test]
    fn test_send_text_to_element_payload_default_delay() {
        let payload = json!({
            "window_label": "main",
            "selector_type": "css",
            "selector_value": "#input-field",
            "text": "Test"
        });

        let parsed: SendTextToElementPayload = serde_json::from_value(payload).unwrap();
        assert_eq!(parsed.delay_ms, 20); // Default value from default_delay_ms()
    }
}
