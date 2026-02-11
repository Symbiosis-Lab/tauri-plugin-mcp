(function () {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */


    function __classPrivateFieldGet(receiver, state, kind, f) {
        if (typeof state === "function" ? receiver !== state || true : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    }

    function __classPrivateFieldSet(receiver, state, value, kind, f) {
        if (typeof state === "function" ? receiver !== state || true : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (state.set(receiver, value)), value;
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    // Copyright 2019-2024 Tauri Programme within The Commons Conservancy
    // SPDX-License-Identifier: Apache-2.0
    // SPDX-License-Identifier: MIT
    var _Resource_rid;
    /**
     * Invoke your custom commands.
     *
     * This package is also accessible with `window.__TAURI__.core` when [`app.withGlobalTauri`](https://v2.tauri.app/reference/config/#withglobaltauri) in `tauri.conf.json` is set to `true`.
     * @module
     */
    /**
     * A key to be used to implement a special function
     * on your types that define how your type should be serialized
     * when passing across the IPC.
     * @example
     * Given a type in Rust that looks like this
     * ```rs
     * #[derive(serde::Serialize, serde::Deserialize)
     * enum UserId {
     *   String(String),
     *   Number(u32),
     * }
     * ```
     * `UserId::String("id")` would be serialized into `{ String: "id" }`
     * and so we need to pass the same structure back to Rust
     * ```ts
     * import { SERIALIZE_TO_IPC_FN } from "@tauri-apps/api/core"
     *
     * class UserIdString {
     *   id
     *   constructor(id) {
     *     this.id = id
     *   }
     *
     *   [SERIALIZE_TO_IPC_FN]() {
     *     return { String: this.id }
     *   }
     * }
     *
     * class UserIdNumber {
     *   id
     *   constructor(id) {
     *     this.id = id
     *   }
     *
     *   [SERIALIZE_TO_IPC_FN]() {
     *     return { Number: this.id }
     *   }
     * }
     *
     * type UserId = UserIdString | UserIdNumber
     * ```
     *
     */
    // if this value changes, make sure to update it in:
    // 1. ipc.js
    // 2. process-ipc-message-fn.js
    const SERIALIZE_TO_IPC_FN = '__TAURI_TO_IPC_KEY__';
    /**
     * Transforms a callback function to a string identifier that can be passed to the backend.
     * The backend uses the identifier to `eval()` the callback.
     *
     * @return A unique identifier associated with the callback function.
     *
     * @since 1.0.0
     */
    function transformCallback(callback, once = false) {
        return window.__TAURI_INTERNALS__.transformCallback(callback, once);
    }
    /**
     * Sends a message to the backend.
     * @example
     * ```typescript
     * import { invoke } from '@tauri-apps/api/core';
     * await invoke('login', { user: 'tauri', password: 'poiwe3h4r5ip3yrhtew9ty' });
     * ```
     *
     * @param cmd The command name.
     * @param args The optional arguments to pass to the command.
     * @param options The request options.
     * @return A promise resolving or rejecting to the backend response.
     *
     * @since 1.0.0
     */
    async function invoke(cmd, args = {}, options) {
        return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
    }
    /**
     * A rust-backed resource stored through `tauri::Manager::resources_table` API.
     *
     * The resource lives in the main process and does not exist
     * in the Javascript world, and thus will not be cleaned up automatiacally
     * except on application exit. If you want to clean it up early, call {@linkcode Resource.close}
     *
     * @example
     * ```typescript
     * import { Resource, invoke } from '@tauri-apps/api/core';
     * export class DatabaseHandle extends Resource {
     *   static async open(path: string): Promise<DatabaseHandle> {
     *     const rid: number = await invoke('open_db', { path });
     *     return new DatabaseHandle(rid);
     *   }
     *
     *   async execute(sql: string): Promise<void> {
     *     await invoke('execute_sql', { rid: this.rid, sql });
     *   }
     * }
     * ```
     */
    class Resource {
        get rid() {
            return __classPrivateFieldGet(this, _Resource_rid, "f");
        }
        constructor(rid) {
            _Resource_rid.set(this, void 0);
            __classPrivateFieldSet(this, _Resource_rid, rid);
        }
        /**
         * Destroys and cleans up this resource from memory.
         * **You should not call any method on this object anymore and should drop any reference to it.**
         */
        async close() {
            return invoke('plugin:resources|close', {
                rid: this.rid
            });
        }
    }
    _Resource_rid = new WeakMap();

    // Copyright 2019-2024 Tauri Programme within The Commons Conservancy
    // SPDX-License-Identifier: Apache-2.0
    // SPDX-License-Identifier: MIT
    /**
     * The event system allows you to emit events to the backend and listen to events from it.
     *
     * This package is also accessible with `window.__TAURI__.event` when [`app.withGlobalTauri`](https://v2.tauri.app/reference/config/#withglobaltauri) in `tauri.conf.json` is set to `true`.
     * @module
     */
    /**
     * @since 1.1.0
     */
    var TauriEvent;
    (function (TauriEvent) {
        TauriEvent["WINDOW_RESIZED"] = "tauri://resize";
        TauriEvent["WINDOW_MOVED"] = "tauri://move";
        TauriEvent["WINDOW_CLOSE_REQUESTED"] = "tauri://close-requested";
        TauriEvent["WINDOW_DESTROYED"] = "tauri://destroyed";
        TauriEvent["WINDOW_FOCUS"] = "tauri://focus";
        TauriEvent["WINDOW_BLUR"] = "tauri://blur";
        TauriEvent["WINDOW_SCALE_FACTOR_CHANGED"] = "tauri://scale-change";
        TauriEvent["WINDOW_THEME_CHANGED"] = "tauri://theme-changed";
        TauriEvent["WINDOW_CREATED"] = "tauri://window-created";
        TauriEvent["WEBVIEW_CREATED"] = "tauri://webview-created";
        TauriEvent["DRAG_ENTER"] = "tauri://drag-enter";
        TauriEvent["DRAG_OVER"] = "tauri://drag-over";
        TauriEvent["DRAG_DROP"] = "tauri://drag-drop";
        TauriEvent["DRAG_LEAVE"] = "tauri://drag-leave";
    })(TauriEvent || (TauriEvent = {}));
    /**
     * Unregister the event listener associated with the given name and id.
     *
     * @ignore
     * @param event The event name
     * @param eventId Event identifier
     * @returns
     */
    async function _unlisten(event, eventId) {
        await invoke('plugin:event|unlisten', {
            event,
            eventId
        });
    }
    /**
     * Listen to an emitted event to any {@link EventTarget|target}.
     *
     * @example
     * ```typescript
     * import { listen } from '@tauri-apps/api/event';
     * const unlisten = await listen<string>('error', (event) => {
     *   console.log(`Got error, payload: ${event.payload}`);
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
     * @param handler Event handler callback.
     * @param options Event listening options.
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     *
     * @since 1.0.0
     */
    async function listen(event, handler, options) {
        var _a;
        const target = typeof (options === null || options === void 0 ? void 0 : options.target) === 'string'
            ? { kind: 'AnyLabel', label: options.target }
            : ((_a = options === null || options === void 0 ? void 0 : options.target) !== null && _a !== void 0 ? _a : { kind: 'Any' });
        return invoke('plugin:event|listen', {
            event,
            target,
            handler: transformCallback(handler)
        }).then((eventId) => {
            return async () => _unlisten(event, eventId);
        });
    }
    /**
     * Listens once to an emitted event to any {@link EventTarget|target}.
     *
     * @example
     * ```typescript
     * import { once } from '@tauri-apps/api/event';
     * interface LoadedPayload {
     *   loggedIn: boolean,
     *   token: string
     * }
     * const unlisten = await once<LoadedPayload>('loaded', (event) => {
     *   console.log(`App is loaded, loggedIn: ${event.payload.loggedIn}, token: ${event.payload.token}`);
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
     * @param handler Event handler callback.
     * @param options Event listening options.
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     *
     * @since 1.0.0
     */
    async function once(event, handler, options) {
        return listen(event, (eventData) => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            _unlisten(event, eventData.id);
            handler(eventData);
        }, options);
    }
    /**
     * Emits an event to all {@link EventTarget|targets}.
     *
     * @example
     * ```typescript
     * import { emit } from '@tauri-apps/api/event';
     * await emit('frontend-loaded', { loggedIn: true, token: 'authToken' });
     * ```
     *
     * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
     * @param payload Event payload.
     *
     * @since 1.0.0
     */
    async function emit(event, payload) {
        await invoke('plugin:event|emit', {
            event,
            payload
        });
    }
    /**
     * Emits an event to all {@link EventTarget|targets} matching the given target.
     *
     * @example
     * ```typescript
     * import { emitTo } from '@tauri-apps/api/event';
     * await emitTo('main', 'frontend-loaded', { loggedIn: true, token: 'authToken' });
     * ```
     *
     * @param target Label of the target Window/Webview/WebviewWindow or raw {@link EventTarget} object.
     * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
     * @param payload Event payload.
     *
     * @since 2.0.0
     */
    async function emitTo(target, event, payload) {
        const eventTarget = typeof target === 'string' ? { kind: 'AnyLabel', label: target } : target;
        await invoke('plugin:event|emit_to', {
            target: eventTarget,
            event,
            payload
        });
    }

    // Copyright 2019-2024 Tauri Programme within The Commons Conservancy
    // SPDX-License-Identifier: Apache-2.0
    // SPDX-License-Identifier: MIT
    /**
     * A size represented in logical pixels.
     *
     * @since 2.0.0
     */
    class LogicalSize {
        constructor(...args) {
            this.type = 'Logical';
            if (args.length === 1) {
                if ('Logical' in args[0]) {
                    this.width = args[0].Logical.width;
                    this.height = args[0].Logical.height;
                }
                else {
                    this.width = args[0].width;
                    this.height = args[0].height;
                }
            }
            else {
                this.width = args[0];
                this.height = args[1];
            }
        }
        /**
         * Converts the logical size to a physical one.
         * @example
         * ```typescript
         * import { LogicalSize } from '@tauri-apps/api/dpi';
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         *
         * const appWindow = getCurrentWindow();
         * const factor = await appWindow.scaleFactor();
         * const size = new LogicalSize(400, 500);
         * const physical = size.toPhysical(factor);
         * ```
         *
         * @since 2.0.0
         */
        toPhysical(scaleFactor) {
            return new PhysicalSize(this.width * scaleFactor, this.height * scaleFactor);
        }
        [SERIALIZE_TO_IPC_FN]() {
            return {
                width: this.width,
                height: this.height
            };
        }
        toJSON() {
            // eslint-disable-next-line security/detect-object-injection
            return this[SERIALIZE_TO_IPC_FN]();
        }
    }
    /**
     * A size represented in physical pixels.
     *
     * @since 2.0.0
     */
    class PhysicalSize {
        constructor(...args) {
            this.type = 'Physical';
            if (args.length === 1) {
                if ('Physical' in args[0]) {
                    this.width = args[0].Physical.width;
                    this.height = args[0].Physical.height;
                }
                else {
                    this.width = args[0].width;
                    this.height = args[0].height;
                }
            }
            else {
                this.width = args[0];
                this.height = args[1];
            }
        }
        /**
         * Converts the physical size to a logical one.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * const appWindow = getCurrentWindow();
         * const factor = await appWindow.scaleFactor();
         * const size = await appWindow.innerSize(); // PhysicalSize
         * const logical = size.toLogical(factor);
         * ```
         */
        toLogical(scaleFactor) {
            return new LogicalSize(this.width / scaleFactor, this.height / scaleFactor);
        }
        [SERIALIZE_TO_IPC_FN]() {
            return {
                width: this.width,
                height: this.height
            };
        }
        toJSON() {
            // eslint-disable-next-line security/detect-object-injection
            return this[SERIALIZE_TO_IPC_FN]();
        }
    }
    /**
     * A size represented either in physical or in logical pixels.
     *
     * This type is basically a union type of {@linkcode LogicalSize} and {@linkcode PhysicalSize}
     * but comes in handy when using `tauri::Size` in Rust as an argument to a command, as this class
     * automatically serializes into a valid format so it can be deserialized correctly into `tauri::Size`
     *
     * So instead of
     * ```typescript
     * import { invoke } from '@tauri-apps/api/core';
     * import { LogicalSize, PhysicalSize } from '@tauri-apps/api/dpi';
     *
     * const size: LogicalSize | PhysicalSize = someFunction(); // where someFunction returns either LogicalSize or PhysicalSize
     * const validSize = size instanceof LogicalSize
     *   ? { Logical: { width: size.width, height: size.height } }
     *   : { Physical: { width: size.width, height: size.height } }
     * await invoke("do_something_with_size", { size: validSize });
     * ```
     *
     * You can just use {@linkcode Size}
     * ```typescript
     * import { invoke } from '@tauri-apps/api/core';
     * import { LogicalSize, PhysicalSize, Size } from '@tauri-apps/api/dpi';
     *
     * const size: LogicalSize | PhysicalSize = someFunction(); // where someFunction returns either LogicalSize or PhysicalSize
     * const validSize = new Size(size);
     * await invoke("do_something_with_size", { size: validSize });
     * ```
     *
     * @since 2.1.0
     */
    class Size {
        constructor(size) {
            this.size = size;
        }
        toLogical(scaleFactor) {
            return this.size instanceof LogicalSize
                ? this.size
                : this.size.toLogical(scaleFactor);
        }
        toPhysical(scaleFactor) {
            return this.size instanceof PhysicalSize
                ? this.size
                : this.size.toPhysical(scaleFactor);
        }
        [SERIALIZE_TO_IPC_FN]() {
            return {
                [`${this.size.type}`]: {
                    width: this.size.width,
                    height: this.size.height
                }
            };
        }
        toJSON() {
            // eslint-disable-next-line security/detect-object-injection
            return this[SERIALIZE_TO_IPC_FN]();
        }
    }
    /**
     *  A position represented in logical pixels.
     *
     * @since 2.0.0
     */
    class LogicalPosition {
        constructor(...args) {
            this.type = 'Logical';
            if (args.length === 1) {
                if ('Logical' in args[0]) {
                    this.x = args[0].Logical.x;
                    this.y = args[0].Logical.y;
                }
                else {
                    this.x = args[0].x;
                    this.y = args[0].y;
                }
            }
            else {
                this.x = args[0];
                this.y = args[1];
            }
        }
        /**
         * Converts the logical position to a physical one.
         * @example
         * ```typescript
         * import { LogicalPosition } from '@tauri-apps/api/dpi';
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         *
         * const appWindow = getCurrentWindow();
         * const factor = await appWindow.scaleFactor();
         * const position = new LogicalPosition(400, 500);
         * const physical = position.toPhysical(factor);
         * ```
         *
         * @since 2.0.0
         */
        toPhysical(scaleFactor) {
            return new PhysicalPosition(this.x * scaleFactor, this.y * scaleFactor);
        }
        [SERIALIZE_TO_IPC_FN]() {
            return {
                x: this.x,
                y: this.y
            };
        }
        toJSON() {
            // eslint-disable-next-line security/detect-object-injection
            return this[SERIALIZE_TO_IPC_FN]();
        }
    }
    /**
     *  A position represented in physical pixels.
     *
     * @since 2.0.0
     */
    class PhysicalPosition {
        constructor(...args) {
            this.type = 'Physical';
            if (args.length === 1) {
                if ('Physical' in args[0]) {
                    this.x = args[0].Physical.x;
                    this.y = args[0].Physical.y;
                }
                else {
                    this.x = args[0].x;
                    this.y = args[0].y;
                }
            }
            else {
                this.x = args[0];
                this.y = args[1];
            }
        }
        /**
         * Converts the physical position to a logical one.
         * @example
         * ```typescript
         * import { PhysicalPosition } from '@tauri-apps/api/dpi';
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         *
         * const appWindow = getCurrentWindow();
         * const factor = await appWindow.scaleFactor();
         * const position = new PhysicalPosition(400, 500);
         * const physical = position.toLogical(factor);
         * ```
         *
         * @since 2.0.0
         */
        toLogical(scaleFactor) {
            return new LogicalPosition(this.x / scaleFactor, this.y / scaleFactor);
        }
        [SERIALIZE_TO_IPC_FN]() {
            return {
                x: this.x,
                y: this.y
            };
        }
        toJSON() {
            // eslint-disable-next-line security/detect-object-injection
            return this[SERIALIZE_TO_IPC_FN]();
        }
    }
    /**
     * A position represented either in physical or in logical pixels.
     *
     * This type is basically a union type of {@linkcode LogicalSize} and {@linkcode PhysicalSize}
     * but comes in handy when using `tauri::Position` in Rust as an argument to a command, as this class
     * automatically serializes into a valid format so it can be deserialized correctly into `tauri::Position`
     *
     * So instead of
     * ```typescript
     * import { invoke } from '@tauri-apps/api/core';
     * import { LogicalPosition, PhysicalPosition } from '@tauri-apps/api/dpi';
     *
     * const position: LogicalPosition | PhysicalPosition = someFunction(); // where someFunction returns either LogicalPosition or PhysicalPosition
     * const validPosition = position instanceof LogicalPosition
     *   ? { Logical: { x: position.x, y: position.y } }
     *   : { Physical: { x: position.x, y: position.y } }
     * await invoke("do_something_with_position", { position: validPosition });
     * ```
     *
     * You can just use {@linkcode Position}
     * ```typescript
     * import { invoke } from '@tauri-apps/api/core';
     * import { LogicalPosition, PhysicalPosition, Position } from '@tauri-apps/api/dpi';
     *
     * const position: LogicalPosition | PhysicalPosition = someFunction(); // where someFunction returns either LogicalPosition or PhysicalPosition
     * const validPosition = new Position(position);
     * await invoke("do_something_with_position", { position: validPosition });
     * ```
     *
     * @since 2.1.0
     */
    class Position {
        constructor(position) {
            this.position = position;
        }
        toLogical(scaleFactor) {
            return this.position instanceof LogicalPosition
                ? this.position
                : this.position.toLogical(scaleFactor);
        }
        toPhysical(scaleFactor) {
            return this.position instanceof PhysicalPosition
                ? this.position
                : this.position.toPhysical(scaleFactor);
        }
        [SERIALIZE_TO_IPC_FN]() {
            return {
                [`${this.position.type}`]: {
                    x: this.position.x,
                    y: this.position.y
                }
            };
        }
        toJSON() {
            // eslint-disable-next-line security/detect-object-injection
            return this[SERIALIZE_TO_IPC_FN]();
        }
    }

    // Copyright 2019-2024 Tauri Programme within The Commons Conservancy
    // SPDX-License-Identifier: Apache-2.0
    // SPDX-License-Identifier: MIT
    /** An RGBA Image in row-major order from top to bottom. */
    let Image$1 = class Image extends Resource {
        /**
         * Creates an Image from a resource ID. For internal use only.
         *
         * @ignore
         */
        constructor(rid) {
            super(rid);
        }
        /** Creates a new Image using RGBA data, in row-major order from top to bottom, and with specified width and height. */
        static async new(rgba, width, height) {
            return invoke('plugin:image|new', {
                rgba: transformImage(rgba),
                width,
                height
            }).then((rid) => new Image(rid));
        }
        /**
         * Creates a new image using the provided bytes by inferring the file format.
         * If the format is known, prefer [@link Image.fromPngBytes] or [@link Image.fromIcoBytes].
         *
         * Only `ico` and `png` are supported (based on activated feature flag).
         *
         * Note that you need the `image-ico` or `image-png` Cargo features to use this API.
         * To enable it, change your Cargo.toml file:
         * ```toml
         * [dependencies]
         * tauri = { version = "...", features = ["...", "image-png"] }
         * ```
         */
        static async fromBytes(bytes) {
            return invoke('plugin:image|from_bytes', {
                bytes: transformImage(bytes)
            }).then((rid) => new Image(rid));
        }
        /**
         * Creates a new image using the provided path.
         *
         * Only `ico` and `png` are supported (based on activated feature flag).
         *
         * Note that you need the `image-ico` or `image-png` Cargo features to use this API.
         * To enable it, change your Cargo.toml file:
         * ```toml
         * [dependencies]
         * tauri = { version = "...", features = ["...", "image-png"] }
         * ```
         */
        static async fromPath(path) {
            return invoke('plugin:image|from_path', { path }).then((rid) => new Image(rid));
        }
        /** Returns the RGBA data for this image, in row-major order from top to bottom.  */
        async rgba() {
            return invoke('plugin:image|rgba', {
                rid: this.rid
            }).then((buffer) => new Uint8Array(buffer));
        }
        /** Returns the size of this image.  */
        async size() {
            return invoke('plugin:image|size', { rid: this.rid });
        }
    };
    /**
     * Transforms image from various types into a type acceptable by Rust.
     *
     * See [tauri::image::JsImage](https://docs.rs/tauri/2/tauri/image/enum.JsImage.html) for more information.
     * Note the API signature is not stable and might change.
     */
    function transformImage(image) {
        const ret = image == null
            ? null
            : typeof image === 'string'
                ? image
                : image instanceof Image$1
                    ? image.rid
                    : image;
        return ret;
    }

    // Copyright 2019-2024 Tauri Programme within The Commons Conservancy
    // SPDX-License-Identifier: Apache-2.0
    // SPDX-License-Identifier: MIT
    /**
     * Provides APIs to create windows, communicate with other windows and manipulate the current window.
     *
     * #### Window events
     *
     * Events can be listened to using {@link Window.listen}:
     * ```typescript
     * import { getCurrentWindow } from "@tauri-apps/api/window";
     * getCurrentWindow().listen("my-window-event", ({ event, payload }) => { });
     * ```
     *
     * @module
     */
    /**
     * Attention type to request on a window.
     *
     * @since 1.0.0
     */
    var UserAttentionType;
    (function (UserAttentionType) {
        /**
         * #### Platform-specific
         * - **macOS:** Bounces the dock icon until the application is in focus.
         * - **Windows:** Flashes both the window and the taskbar button until the application is in focus.
         */
        UserAttentionType[UserAttentionType["Critical"] = 1] = "Critical";
        /**
         * #### Platform-specific
         * - **macOS:** Bounces the dock icon once.
         * - **Windows:** Flashes the taskbar button until the application is in focus.
         */
        UserAttentionType[UserAttentionType["Informational"] = 2] = "Informational";
    })(UserAttentionType || (UserAttentionType = {}));
    class CloseRequestedEvent {
        constructor(event) {
            this._preventDefault = false;
            this.event = event.event;
            this.id = event.id;
        }
        preventDefault() {
            this._preventDefault = true;
        }
        isPreventDefault() {
            return this._preventDefault;
        }
    }
    var ProgressBarStatus;
    (function (ProgressBarStatus) {
        /**
         * Hide progress bar.
         */
        ProgressBarStatus["None"] = "none";
        /**
         * Normal state.
         */
        ProgressBarStatus["Normal"] = "normal";
        /**
         * Indeterminate state. **Treated as Normal on Linux and macOS**
         */
        ProgressBarStatus["Indeterminate"] = "indeterminate";
        /**
         * Paused state. **Treated as Normal on Linux**
         */
        ProgressBarStatus["Paused"] = "paused";
        /**
         * Error state. **Treated as Normal on linux**
         */
        ProgressBarStatus["Error"] = "error";
    })(ProgressBarStatus || (ProgressBarStatus = {}));
    /**
     * Get an instance of `Window` for the current window.
     *
     * @since 1.0.0
     */
    function getCurrentWindow() {
        return new Window(window.__TAURI_INTERNALS__.metadata.currentWindow.label, {
            // @ts-expect-error `skip` is not defined in the public API but it is handled by the constructor
            skip: true
        });
    }
    /**
     * Gets a list of instances of `Window` for all available windows.
     *
     * @since 1.0.0
     */
    async function getAllWindows() {
        return invoke('plugin:window|get_all_windows').then((windows) => windows.map((w) => new Window(w, {
            // @ts-expect-error `skip` is not defined in the public API but it is handled by the constructor
            skip: true
        })));
    }
    /** @ignore */
    // events that are emitted right here instead of by the created window
    const localTauriEvents$1 = ['tauri://created', 'tauri://error'];
    /**
     * Create new window or get a handle to an existing one.
     *
     * Windows are identified by a *label*  a unique identifier that can be used to reference it later.
     * It may only contain alphanumeric characters `a-zA-Z` plus the following special characters `-`, `/`, `:` and `_`.
     *
     * @example
     * ```typescript
     * import { Window } from "@tauri-apps/api/window"
     *
     * const appWindow = new Window('theUniqueLabel');
     *
     * appWindow.once('tauri://created', function () {
     *  // window successfully created
     * });
     * appWindow.once('tauri://error', function (e) {
     *  // an error happened creating the window
     * });
     *
     * // emit an event to the backend
     * await appWindow.emit("some-event", "data");
     * // listen to an event from the backend
     * const unlisten = await appWindow.listen("event-name", e => {});
     * unlisten();
     * ```
     *
     * @since 2.0.0
     */
    class Window {
        /**
         * Creates a new Window.
         * @example
         * ```typescript
         * import { Window } from '@tauri-apps/api/window';
         * const appWindow = new Window('my-label');
         * appWindow.once('tauri://created', function () {
         *  // window successfully created
         * });
         * appWindow.once('tauri://error', function (e) {
         *  // an error happened creating the window
         * });
         * ```
         *
         * @param label The unique window label. Must be alphanumeric: `a-zA-Z-/:_`.
         * @returns The {@link Window} instance to communicate with the window.
         */
        constructor(label, options = {}) {
            var _a;
            this.label = label;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            this.listeners = Object.create(null);
            // @ts-expect-error `skip` is not a public API so it is not defined in WindowOptions
            if (!(options === null || options === void 0 ? void 0 : options.skip)) {
                invoke('plugin:window|create', {
                    options: {
                        ...options,
                        parent: typeof options.parent === 'string'
                            ? options.parent
                            : (_a = options.parent) === null || _a === void 0 ? void 0 : _a.label,
                        label
                    }
                })
                    .then(async () => this.emit('tauri://created'))
                    .catch(async (e) => this.emit('tauri://error', e));
            }
        }
        /**
         * Gets the Window associated with the given label.
         * @example
         * ```typescript
         * import { Window } from '@tauri-apps/api/window';
         * const mainWindow = Window.getByLabel('main');
         * ```
         *
         * @param label The window label.
         * @returns The Window instance to communicate with the window or null if the window doesn't exist.
         */
        static async getByLabel(label) {
            var _a;
            return (_a = (await getAllWindows()).find((w) => w.label === label)) !== null && _a !== void 0 ? _a : null;
        }
        /**
         * Get an instance of `Window` for the current window.
         */
        static getCurrent() {
            return getCurrentWindow();
        }
        /**
         * Gets a list of instances of `Window` for all available windows.
         */
        static async getAll() {
            return getAllWindows();
        }
        /**
         *  Gets the focused window.
         * @example
         * ```typescript
         * import { Window } from '@tauri-apps/api/window';
         * const focusedWindow = Window.getFocusedWindow();
         * ```
         *
         * @returns The Window instance or `undefined` if there is not any focused window.
         */
        static async getFocusedWindow() {
            for (const w of await getAllWindows()) {
                if (await w.isFocused()) {
                    return w;
                }
            }
            return null;
        }
        /**
         * Listen to an emitted event on this window.
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * const unlisten = await getCurrentWindow().listen<string>('state-changed', (event) => {
         *   console.log(`Got error: ${payload}`);
         * });
         *
         * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
         * unlisten();
         * ```
         *
         * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
         * @param handler Event handler.
         * @returns A promise resolving to a function to unlisten to the event.
         * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
         */
        async listen(event, handler) {
            if (this._handleTauriEvent(event, handler)) {
                return () => {
                    // eslint-disable-next-line security/detect-object-injection
                    const listeners = this.listeners[event];
                    listeners.splice(listeners.indexOf(handler), 1);
                };
            }
            return listen(event, handler, {
                target: { kind: 'Window', label: this.label }
            });
        }
        /**
         * Listen to an emitted event on this window only once.
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * const unlisten = await getCurrentWindow().once<null>('initialized', (event) => {
         *   console.log(`Window initialized!`);
         * });
         *
         * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
         * unlisten();
         * ```
         *
         * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
         * @param handler Event handler.
         * @returns A promise resolving to a function to unlisten to the event.
         * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
         */
        async once(event, handler) {
            if (this._handleTauriEvent(event, handler)) {
                return () => {
                    // eslint-disable-next-line security/detect-object-injection
                    const listeners = this.listeners[event];
                    listeners.splice(listeners.indexOf(handler), 1);
                };
            }
            return once(event, handler, {
                target: { kind: 'Window', label: this.label }
            });
        }
        /**
         * Emits an event to all {@link EventTarget|targets}.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().emit('window-loaded', { loggedIn: true, token: 'authToken' });
         * ```
         *
         * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
         * @param payload Event payload.
         */
        async emit(event, payload) {
            if (localTauriEvents$1.includes(event)) {
                // eslint-disable-next-line
                for (const handler of this.listeners[event] || []) {
                    handler({
                        event,
                        id: -1,
                        payload
                    });
                }
                return;
            }
            return emit(event, payload);
        }
        /**
         * Emits an event to all {@link EventTarget|targets} matching the given target.
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().emit('main', 'window-loaded', { loggedIn: true, token: 'authToken' });
         * ```
         * @param target Label of the target Window/Webview/WebviewWindow or raw {@link EventTarget} object.
         * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
         * @param payload Event payload.
         */
        async emitTo(target, event, payload) {
            if (localTauriEvents$1.includes(event)) {
                // eslint-disable-next-line security/detect-object-injection
                for (const handler of this.listeners[event] || []) {
                    handler({
                        event,
                        id: -1,
                        payload
                    });
                }
                return;
            }
            return emitTo(target, event, payload);
        }
        /** @ignore */
        _handleTauriEvent(event, handler) {
            if (localTauriEvents$1.includes(event)) {
                if (!(event in this.listeners)) {
                    // eslint-disable-next-line
                    this.listeners[event] = [handler];
                }
                else {
                    // eslint-disable-next-line
                    this.listeners[event].push(handler);
                }
                return true;
            }
            return false;
        }
        // Getters
        /**
         * The scale factor that can be used to map physical pixels to logical pixels.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * const factor = await getCurrentWindow().scaleFactor();
         * ```
         *
         * @returns The window's monitor scale factor.
         */
        async scaleFactor() {
            return invoke('plugin:window|scale_factor', {
                label: this.label
            });
        }
        /**
         * The position of the top-left hand corner of the window's client area relative to the top-left hand corner of the desktop.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * const position = await getCurrentWindow().innerPosition();
         * ```
         *
         * @returns The window's inner position.
         */
        async innerPosition() {
            return invoke('plugin:window|inner_position', {
                label: this.label
            }).then((p) => new PhysicalPosition(p));
        }
        /**
         * The position of the top-left hand corner of the window relative to the top-left hand corner of the desktop.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * const position = await getCurrentWindow().outerPosition();
         * ```
         *
         * @returns The window's outer position.
         */
        async outerPosition() {
            return invoke('plugin:window|outer_position', {
                label: this.label
            }).then((p) => new PhysicalPosition(p));
        }
        /**
         * The physical size of the window's client area.
         * The client area is the content of the window, excluding the title bar and borders.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * const size = await getCurrentWindow().innerSize();
         * ```
         *
         * @returns The window's inner size.
         */
        async innerSize() {
            return invoke('plugin:window|inner_size', {
                label: this.label
            }).then((s) => new PhysicalSize(s));
        }
        /**
         * The physical size of the entire window.
         * These dimensions include the title bar and borders. If you don't want that (and you usually don't), use inner_size instead.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * const size = await getCurrentWindow().outerSize();
         * ```
         *
         * @returns The window's outer size.
         */
        async outerSize() {
            return invoke('plugin:window|outer_size', {
                label: this.label
            }).then((s) => new PhysicalSize(s));
        }
        /**
         * Gets the window's current fullscreen state.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * const fullscreen = await getCurrentWindow().isFullscreen();
         * ```
         *
         * @returns Whether the window is in fullscreen mode or not.
         */
        async isFullscreen() {
            return invoke('plugin:window|is_fullscreen', {
                label: this.label
            });
        }
        /**
         * Gets the window's current minimized state.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * const minimized = await getCurrentWindow().isMinimized();
         * ```
         */
        async isMinimized() {
            return invoke('plugin:window|is_minimized', {
                label: this.label
            });
        }
        /**
         * Gets the window's current maximized state.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * const maximized = await getCurrentWindow().isMaximized();
         * ```
         *
         * @returns Whether the window is maximized or not.
         */
        async isMaximized() {
            return invoke('plugin:window|is_maximized', {
                label: this.label
            });
        }
        /**
         * Gets the window's current focus state.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * const focused = await getCurrentWindow().isFocused();
         * ```
         *
         * @returns Whether the window is focused or not.
         */
        async isFocused() {
            return invoke('plugin:window|is_focused', {
                label: this.label
            });
        }
        /**
         * Gets the window's current decorated state.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * const decorated = await getCurrentWindow().isDecorated();
         * ```
         *
         * @returns Whether the window is decorated or not.
         */
        async isDecorated() {
            return invoke('plugin:window|is_decorated', {
                label: this.label
            });
        }
        /**
         * Gets the window's current resizable state.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * const resizable = await getCurrentWindow().isResizable();
         * ```
         *
         * @returns Whether the window is resizable or not.
         */
        async isResizable() {
            return invoke('plugin:window|is_resizable', {
                label: this.label
            });
        }
        /**
         * Gets the window's native maximize button state.
         *
         * #### Platform-specific
         *
         * - **Linux / iOS / Android:** Unsupported.
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * const maximizable = await getCurrentWindow().isMaximizable();
         * ```
         *
         * @returns Whether the window's native maximize button is enabled or not.
         */
        async isMaximizable() {
            return invoke('plugin:window|is_maximizable', {
                label: this.label
            });
        }
        /**
         * Gets the window's native minimize button state.
         *
         * #### Platform-specific
         *
         * - **Linux / iOS / Android:** Unsupported.
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * const minimizable = await getCurrentWindow().isMinimizable();
         * ```
         *
         * @returns Whether the window's native minimize button is enabled or not.
         */
        async isMinimizable() {
            return invoke('plugin:window|is_minimizable', {
                label: this.label
            });
        }
        /**
         * Gets the window's native close button state.
         *
         * #### Platform-specific
         *
         * - **iOS / Android:** Unsupported.
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * const closable = await getCurrentWindow().isClosable();
         * ```
         *
         * @returns Whether the window's native close button is enabled or not.
         */
        async isClosable() {
            return invoke('plugin:window|is_closable', {
                label: this.label
            });
        }
        /**
         * Gets the window's current visible state.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * const visible = await getCurrentWindow().isVisible();
         * ```
         *
         * @returns Whether the window is visible or not.
         */
        async isVisible() {
            return invoke('plugin:window|is_visible', {
                label: this.label
            });
        }
        /**
         * Gets the window's current title.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * const title = await getCurrentWindow().title();
         * ```
         */
        async title() {
            return invoke('plugin:window|title', {
                label: this.label
            });
        }
        /**
         * Gets the window's current theme.
         *
         * #### Platform-specific
         *
         * - **macOS:** Theme was introduced on macOS 10.14. Returns `light` on macOS 10.13 and below.
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * const theme = await getCurrentWindow().theme();
         * ```
         *
         * @returns The window theme.
         */
        async theme() {
            return invoke('plugin:window|theme', {
                label: this.label
            });
        }
        /**
         * Whether the window is configured to be always on top of other windows or not.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * const alwaysOnTop = await getCurrentWindow().isAlwaysOnTop();
         * ```
         *
         * @returns Whether the window is visible or not.
         */
        async isAlwaysOnTop() {
            return invoke('plugin:window|is_always_on_top', {
                label: this.label
            });
        }
        // Setters
        /**
         * Centers the window.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().center();
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async center() {
            return invoke('plugin:window|center', {
                label: this.label
            });
        }
        /**
         *  Requests user attention to the window, this has no effect if the application
         * is already focused. How requesting for user attention manifests is platform dependent,
         * see `UserAttentionType` for details.
         *
         * Providing `null` will unset the request for user attention. Unsetting the request for
         * user attention might not be done automatically by the WM when the window receives input.
         *
         * #### Platform-specific
         *
         * - **macOS:** `null` has no effect.
         * - **Linux:** Urgency levels have the same effect.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().requestUserAttention();
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async requestUserAttention(requestType) {
            let requestType_ = null;
            if (requestType) {
                if (requestType === UserAttentionType.Critical) {
                    requestType_ = { type: 'Critical' };
                }
                else {
                    requestType_ = { type: 'Informational' };
                }
            }
            return invoke('plugin:window|request_user_attention', {
                label: this.label,
                value: requestType_
            });
        }
        /**
         * Updates the window resizable flag.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setResizable(false);
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async setResizable(resizable) {
            return invoke('plugin:window|set_resizable', {
                label: this.label,
                value: resizable
            });
        }
        /**
         * Enable or disable the window.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setEnabled(false);
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         *
         * @since 2.0.0
         */
        async setEnabled(enabled) {
            return invoke('plugin:window|set_enabled', {
                label: this.label,
                value: enabled
            });
        }
        /**
         * Whether the window is enabled or disabled.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setEnabled(false);
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         *
         * @since 2.0.0
         */
        async isEnabled() {
            return invoke('plugin:window|is_enabled', {
                label: this.label
            });
        }
        /**
         * Sets whether the window's native maximize button is enabled or not.
         * If resizable is set to false, this setting is ignored.
         *
         * #### Platform-specific
         *
         * - **macOS:** Disables the "zoom" button in the window titlebar, which is also used to enter fullscreen mode.
         * - **Linux / iOS / Android:** Unsupported.
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setMaximizable(false);
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async setMaximizable(maximizable) {
            return invoke('plugin:window|set_maximizable', {
                label: this.label,
                value: maximizable
            });
        }
        /**
         * Sets whether the window's native minimize button is enabled or not.
         *
         * #### Platform-specific
         *
         * - **Linux / iOS / Android:** Unsupported.
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setMinimizable(false);
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async setMinimizable(minimizable) {
            return invoke('plugin:window|set_minimizable', {
                label: this.label,
                value: minimizable
            });
        }
        /**
         * Sets whether the window's native close button is enabled or not.
         *
         * #### Platform-specific
         *
         * - **Linux:** GTK+ will do its best to convince the window manager not to show a close button. Depending on the system, this function may not have any effect when called on a window that is already visible
         * - **iOS / Android:** Unsupported.
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setClosable(false);
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async setClosable(closable) {
            return invoke('plugin:window|set_closable', {
                label: this.label,
                value: closable
            });
        }
        /**
         * Sets the window title.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setTitle('Tauri');
         * ```
         *
         * @param title The new title
         * @returns A promise indicating the success or failure of the operation.
         */
        async setTitle(title) {
            return invoke('plugin:window|set_title', {
                label: this.label,
                value: title
            });
        }
        /**
         * Maximizes the window.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().maximize();
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async maximize() {
            return invoke('plugin:window|maximize', {
                label: this.label
            });
        }
        /**
         * Unmaximizes the window.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().unmaximize();
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async unmaximize() {
            return invoke('plugin:window|unmaximize', {
                label: this.label
            });
        }
        /**
         * Toggles the window maximized state.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().toggleMaximize();
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async toggleMaximize() {
            return invoke('plugin:window|toggle_maximize', {
                label: this.label
            });
        }
        /**
         * Minimizes the window.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().minimize();
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async minimize() {
            return invoke('plugin:window|minimize', {
                label: this.label
            });
        }
        /**
         * Unminimizes the window.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().unminimize();
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async unminimize() {
            return invoke('plugin:window|unminimize', {
                label: this.label
            });
        }
        /**
         * Sets the window visibility to true.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().show();
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async show() {
            return invoke('plugin:window|show', {
                label: this.label
            });
        }
        /**
         * Sets the window visibility to false.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().hide();
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async hide() {
            return invoke('plugin:window|hide', {
                label: this.label
            });
        }
        /**
         * Closes the window.
         *
         * Note this emits a closeRequested event so you can intercept it. To force window close, use {@link Window.destroy}.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().close();
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async close() {
            return invoke('plugin:window|close', {
                label: this.label
            });
        }
        /**
         * Destroys the window. Behaves like {@link Window.close} but forces the window close instead of emitting a closeRequested event.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().destroy();
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async destroy() {
            return invoke('plugin:window|destroy', {
                label: this.label
            });
        }
        /**
         * Whether the window should have borders and bars.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setDecorations(false);
         * ```
         *
         * @param decorations Whether the window should have borders and bars.
         * @returns A promise indicating the success or failure of the operation.
         */
        async setDecorations(decorations) {
            return invoke('plugin:window|set_decorations', {
                label: this.label,
                value: decorations
            });
        }
        /**
         * Whether or not the window should have shadow.
         *
         * #### Platform-specific
         *
         * - **Windows:**
         *   - `false` has no effect on decorated window, shadows are always ON.
         *   - `true` will make undecorated window have a 1px white border,
         * and on Windows 11, it will have a rounded corners.
         * - **Linux:** Unsupported.
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setShadow(false);
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async setShadow(enable) {
            return invoke('plugin:window|set_shadow', {
                label: this.label,
                value: enable
            });
        }
        /**
         * Set window effects.
         */
        async setEffects(effects) {
            return invoke('plugin:window|set_effects', {
                label: this.label,
                value: effects
            });
        }
        /**
         * Clear any applied effects if possible.
         */
        async clearEffects() {
            return invoke('plugin:window|set_effects', {
                label: this.label,
                value: null
            });
        }
        /**
         * Whether the window should always be on top of other windows.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setAlwaysOnTop(true);
         * ```
         *
         * @param alwaysOnTop Whether the window should always be on top of other windows or not.
         * @returns A promise indicating the success or failure of the operation.
         */
        async setAlwaysOnTop(alwaysOnTop) {
            return invoke('plugin:window|set_always_on_top', {
                label: this.label,
                value: alwaysOnTop
            });
        }
        /**
         * Whether the window should always be below other windows.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setAlwaysOnBottom(true);
         * ```
         *
         * @param alwaysOnBottom Whether the window should always be below other windows or not.
         * @returns A promise indicating the success or failure of the operation.
         */
        async setAlwaysOnBottom(alwaysOnBottom) {
            return invoke('plugin:window|set_always_on_bottom', {
                label: this.label,
                value: alwaysOnBottom
            });
        }
        /**
         * Prevents the window contents from being captured by other apps.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setContentProtected(true);
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async setContentProtected(protected_) {
            return invoke('plugin:window|set_content_protected', {
                label: this.label,
                value: protected_
            });
        }
        /**
         * Resizes the window with a new inner size.
         * @example
         * ```typescript
         * import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
         * await getCurrentWindow().setSize(new LogicalSize(600, 500));
         * ```
         *
         * @param size The logical or physical inner size.
         * @returns A promise indicating the success or failure of the operation.
         */
        async setSize(size) {
            return invoke('plugin:window|set_size', {
                label: this.label,
                value: size instanceof Size ? size : new Size(size)
            });
        }
        /**
         * Sets the window minimum inner size. If the `size` argument is not provided, the constraint is unset.
         * @example
         * ```typescript
         * import { getCurrentWindow, PhysicalSize } from '@tauri-apps/api/window';
         * await getCurrentWindow().setMinSize(new PhysicalSize(600, 500));
         * ```
         *
         * @param size The logical or physical inner size, or `null` to unset the constraint.
         * @returns A promise indicating the success or failure of the operation.
         */
        async setMinSize(size) {
            return invoke('plugin:window|set_min_size', {
                label: this.label,
                value: size instanceof Size ? size : size ? new Size(size) : null
            });
        }
        /**
         * Sets the window maximum inner size. If the `size` argument is undefined, the constraint is unset.
         * @example
         * ```typescript
         * import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
         * await getCurrentWindow().setMaxSize(new LogicalSize(600, 500));
         * ```
         *
         * @param size The logical or physical inner size, or `null` to unset the constraint.
         * @returns A promise indicating the success or failure of the operation.
         */
        async setMaxSize(size) {
            return invoke('plugin:window|set_max_size', {
                label: this.label,
                value: size instanceof Size ? size : size ? new Size(size) : null
            });
        }
        /**
         * Sets the window inner size constraints.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setSizeConstraints({ minWidth: 300 });
         * ```
         *
         * @param constraints The logical or physical inner size, or `null` to unset the constraint.
         * @returns A promise indicating the success or failure of the operation.
         */
        async setSizeConstraints(constraints) {
            function logical(pixel) {
                return pixel ? { Logical: pixel } : null;
            }
            return invoke('plugin:window|set_size_constraints', {
                label: this.label,
                value: {
                    minWidth: logical(constraints === null || constraints === void 0 ? void 0 : constraints.minWidth),
                    minHeight: logical(constraints === null || constraints === void 0 ? void 0 : constraints.minHeight),
                    maxWidth: logical(constraints === null || constraints === void 0 ? void 0 : constraints.maxWidth),
                    maxHeight: logical(constraints === null || constraints === void 0 ? void 0 : constraints.maxHeight)
                }
            });
        }
        /**
         * Sets the window outer position.
         * @example
         * ```typescript
         * import { getCurrentWindow, LogicalPosition } from '@tauri-apps/api/window';
         * await getCurrentWindow().setPosition(new LogicalPosition(600, 500));
         * ```
         *
         * @param position The new position, in logical or physical pixels.
         * @returns A promise indicating the success or failure of the operation.
         */
        async setPosition(position) {
            return invoke('plugin:window|set_position', {
                label: this.label,
                value: position instanceof Position ? position : new Position(position)
            });
        }
        /**
         * Sets the window fullscreen state.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setFullscreen(true);
         * ```
         *
         * @param fullscreen Whether the window should go to fullscreen or not.
         * @returns A promise indicating the success or failure of the operation.
         */
        async setFullscreen(fullscreen) {
            return invoke('plugin:window|set_fullscreen', {
                label: this.label,
                value: fullscreen
            });
        }
        /**
         * Bring the window to front and focus.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setFocus();
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async setFocus() {
            return invoke('plugin:window|set_focus', {
                label: this.label
            });
        }
        /**
         * Sets the window icon.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setIcon('/tauri/awesome.png');
         * ```
         *
         * Note that you may need the `image-ico` or `image-png` Cargo features to use this API.
         * To enable it, change your Cargo.toml file:
         * ```toml
         * [dependencies]
         * tauri = { version = "...", features = ["...", "image-png"] }
         * ```
         *
         * @param icon Icon bytes or path to the icon file.
         * @returns A promise indicating the success or failure of the operation.
         */
        async setIcon(icon) {
            return invoke('plugin:window|set_icon', {
                label: this.label,
                value: transformImage(icon)
            });
        }
        /**
         * Whether the window icon should be hidden from the taskbar or not.
         *
         * #### Platform-specific
         *
         * - **macOS:** Unsupported.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setSkipTaskbar(true);
         * ```
         *
         * @param skip true to hide window icon, false to show it.
         * @returns A promise indicating the success or failure of the operation.
         */
        async setSkipTaskbar(skip) {
            return invoke('plugin:window|set_skip_taskbar', {
                label: this.label,
                value: skip
            });
        }
        /**
         * Grabs the cursor, preventing it from leaving the window.
         *
         * There's no guarantee that the cursor will be hidden. You should
         * hide it by yourself if you want so.
         *
         * #### Platform-specific
         *
         * - **Linux:** Unsupported.
         * - **macOS:** This locks the cursor in a fixed location, which looks visually awkward.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setCursorGrab(true);
         * ```
         *
         * @param grab `true` to grab the cursor icon, `false` to release it.
         * @returns A promise indicating the success or failure of the operation.
         */
        async setCursorGrab(grab) {
            return invoke('plugin:window|set_cursor_grab', {
                label: this.label,
                value: grab
            });
        }
        /**
         * Modifies the cursor's visibility.
         *
         * #### Platform-specific
         *
         * - **Windows:** The cursor is only hidden within the confines of the window.
         * - **macOS:** The cursor is hidden as long as the window has input focus, even if the cursor is
         *   outside of the window.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setCursorVisible(false);
         * ```
         *
         * @param visible If `false`, this will hide the cursor. If `true`, this will show the cursor.
         * @returns A promise indicating the success or failure of the operation.
         */
        async setCursorVisible(visible) {
            return invoke('plugin:window|set_cursor_visible', {
                label: this.label,
                value: visible
            });
        }
        /**
         * Modifies the cursor icon of the window.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setCursorIcon('help');
         * ```
         *
         * @param icon The new cursor icon.
         * @returns A promise indicating the success or failure of the operation.
         */
        async setCursorIcon(icon) {
            return invoke('plugin:window|set_cursor_icon', {
                label: this.label,
                value: icon
            });
        }
        /**
         * Sets the window background color.
         *
         * #### Platform-specific:
         *
         * - **Windows:** alpha channel is ignored.
         * - **iOS / Android:** Unsupported.
         *
         * @returns A promise indicating the success or failure of the operation.
         *
         * @since 2.1.0
         */
        async setBackgroundColor(color) {
            return invoke('plugin:window|set_background_color', { color });
        }
        /**
         * Changes the position of the cursor in window coordinates.
         * @example
         * ```typescript
         * import { getCurrentWindow, LogicalPosition } from '@tauri-apps/api/window';
         * await getCurrentWindow().setCursorPosition(new LogicalPosition(600, 300));
         * ```
         *
         * @param position The new cursor position.
         * @returns A promise indicating the success or failure of the operation.
         */
        async setCursorPosition(position) {
            return invoke('plugin:window|set_cursor_position', {
                label: this.label,
                value: position instanceof Position ? position : new Position(position)
            });
        }
        /**
         * Changes the cursor events behavior.
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setIgnoreCursorEvents(true);
         * ```
         *
         * @param ignore `true` to ignore the cursor events; `false` to process them as usual.
         * @returns A promise indicating the success or failure of the operation.
         */
        async setIgnoreCursorEvents(ignore) {
            return invoke('plugin:window|set_ignore_cursor_events', {
                label: this.label,
                value: ignore
            });
        }
        /**
         * Starts dragging the window.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().startDragging();
         * ```
         *
         * @return A promise indicating the success or failure of the operation.
         */
        async startDragging() {
            return invoke('plugin:window|start_dragging', {
                label: this.label
            });
        }
        /**
         * Starts resize-dragging the window.
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().startResizeDragging();
         * ```
         *
         * @return A promise indicating the success or failure of the operation.
         */
        async startResizeDragging(direction) {
            return invoke('plugin:window|start_resize_dragging', {
                label: this.label,
                value: direction
            });
        }
        /**
         * Sets the badge count. It is app wide and not specific to this window.
         *
         * #### Platform-specific
         *
         * - **Windows**: Unsupported. Use @{linkcode Window.setOverlayIcon} instead.
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setBadgeCount(5);
         * ```
         *
         * @param count The badge count. Use `undefined` to remove the badge.
         * @return A promise indicating the success or failure of the operation.
         */
        async setBadgeCount(count) {
            return invoke('plugin:window|set_badge_count', {
                label: this.label,
                value: count
            });
        }
        /**
         * Sets the badge cont **macOS only**.
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setBadgeLabel("Hello");
         * ```
         *
         * @param label The badge label. Use `undefined` to remove the badge.
         * @return A promise indicating the success or failure of the operation.
         */
        async setBadgeLabel(label) {
            return invoke('plugin:window|set_badge_label', {
                label: this.label,
                value: label
            });
        }
        /**
         * Sets the overlay icon. **Windows only**
         * The overlay icon can be set for every window.
         *
         *
         * Note that you may need the `image-ico` or `image-png` Cargo features to use this API.
         * To enable it, change your Cargo.toml file:
         *
         * ```toml
         * [dependencies]
         * tauri = { version = "...", features = ["...", "image-png"] }
         * ```
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from '@tauri-apps/api/window';
         * await getCurrentWindow().setOverlayIcon("/tauri/awesome.png");
         * ```
         *
         * @param icon Icon bytes or path to the icon file. Use `undefined` to remove the overlay icon.
         * @return A promise indicating the success or failure of the operation.
         */
        async setOverlayIcon(icon) {
            return invoke('plugin:window|set_overlay_icon', {
                label: this.label,
                value: icon ? transformImage(icon) : undefined
            });
        }
        /**
         * Sets the taskbar progress state.
         *
         * #### Platform-specific
         *
         * - **Linux / macOS**: Progress bar is app-wide and not specific to this window.
         * - **Linux**: Only supported desktop environments with `libunity` (e.g. GNOME).
         *
         * @example
         * ```typescript
         * import { getCurrentWindow, ProgressBarStatus } from '@tauri-apps/api/window';
         * await getCurrentWindow().setProgressBar({
         *   status: ProgressBarStatus.Normal,
         *   progress: 50,
         * });
         * ```
         *
         * @return A promise indicating the success or failure of the operation.
         */
        async setProgressBar(state) {
            return invoke('plugin:window|set_progress_bar', {
                label: this.label,
                value: state
            });
        }
        /**
         * Sets whether the window should be visible on all workspaces or virtual desktops.
         *
         * #### Platform-specific
         *
         * - **Windows / iOS / Android:** Unsupported.
         *
         * @since 2.0.0
         */
        async setVisibleOnAllWorkspaces(visible) {
            return invoke('plugin:window|set_visible_on_all_workspaces', {
                label: this.label,
                value: visible
            });
        }
        /**
         * Sets the title bar style. **macOS only**.
         *
         * @since 2.0.0
         */
        async setTitleBarStyle(style) {
            return invoke('plugin:window|set_title_bar_style', {
                label: this.label,
                value: style
            });
        }
        /**
         * Set window theme, pass in `null` or `undefined` to follow system theme
         *
         * #### Platform-specific
         *
         * - **Linux / macOS**: Theme is app-wide and not specific to this window.
         * - **iOS / Android:** Unsupported.
         *
         * @since 2.0.0
         */
        async setTheme(theme) {
            return invoke('plugin:window|set_theme', {
                label: this.label,
                value: theme
            });
        }
        // Listeners
        /**
         * Listen to window resize.
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from "@tauri-apps/api/window";
         * const unlisten = await getCurrentWindow().onResized(({ payload: size }) => {
         *  console.log('Window resized', size);
         * });
         *
         * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
         * unlisten();
         * ```
         *
         * @returns A promise resolving to a function to unlisten to the event.
         * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
         */
        async onResized(handler) {
            return this.listen(TauriEvent.WINDOW_RESIZED, (e) => {
                e.payload = new PhysicalSize(e.payload);
                handler(e);
            });
        }
        /**
         * Listen to window move.
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from "@tauri-apps/api/window";
         * const unlisten = await getCurrentWindow().onMoved(({ payload: position }) => {
         *  console.log('Window moved', position);
         * });
         *
         * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
         * unlisten();
         * ```
         *
         * @returns A promise resolving to a function to unlisten to the event.
         * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
         */
        async onMoved(handler) {
            return this.listen(TauriEvent.WINDOW_MOVED, (e) => {
                e.payload = new PhysicalPosition(e.payload);
                handler(e);
            });
        }
        /**
         * Listen to window close requested. Emitted when the user requests to closes the window.
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from "@tauri-apps/api/window";
         * import { confirm } from '@tauri-apps/api/dialog';
         * const unlisten = await getCurrentWindow().onCloseRequested(async (event) => {
         *   const confirmed = await confirm('Are you sure?');
         *   if (!confirmed) {
         *     // user did not confirm closing the window; let's prevent it
         *     event.preventDefault();
         *   }
         * });
         *
         * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
         * unlisten();
         * ```
         *
         * @returns A promise resolving to a function to unlisten to the event.
         * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
         */
        async onCloseRequested(handler) {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            return this.listen(TauriEvent.WINDOW_CLOSE_REQUESTED, async (event) => {
                const evt = new CloseRequestedEvent(event);
                await handler(evt);
                if (!evt.isPreventDefault()) {
                    await this.destroy();
                }
            });
        }
        /**
         * Listen to a file drop event.
         * The listener is triggered when the user hovers the selected files on the webview,
         * drops the files or cancels the operation.
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from "@tauri-apps/api/webview";
         * const unlisten = await getCurrentWindow().onDragDropEvent((event) => {
         *  if (event.payload.type === 'over') {
         *    console.log('User hovering', event.payload.position);
         *  } else if (event.payload.type === 'drop') {
         *    console.log('User dropped', event.payload.paths);
         *  } else {
         *    console.log('File drop cancelled');
         *  }
         * });
         *
         * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
         * unlisten();
         * ```
         *
         * @returns A promise resolving to a function to unlisten to the event.
         * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
         */
        async onDragDropEvent(handler) {
            const unlistenDrag = await this.listen(TauriEvent.DRAG_ENTER, (event) => {
                handler({
                    ...event,
                    payload: {
                        type: 'enter',
                        paths: event.payload.paths,
                        position: new PhysicalPosition(event.payload.position)
                    }
                });
            });
            const unlistenDragOver = await this.listen(TauriEvent.DRAG_OVER, (event) => {
                handler({
                    ...event,
                    payload: {
                        type: 'over',
                        position: new PhysicalPosition(event.payload.position)
                    }
                });
            });
            const unlistenDrop = await this.listen(TauriEvent.DRAG_DROP, (event) => {
                handler({
                    ...event,
                    payload: {
                        type: 'drop',
                        paths: event.payload.paths,
                        position: new PhysicalPosition(event.payload.position)
                    }
                });
            });
            const unlistenCancel = await this.listen(TauriEvent.DRAG_LEAVE, (event) => {
                handler({ ...event, payload: { type: 'leave' } });
            });
            return () => {
                unlistenDrag();
                unlistenDrop();
                unlistenDragOver();
                unlistenCancel();
            };
        }
        /**
         * Listen to window focus change.
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from "@tauri-apps/api/window";
         * const unlisten = await getCurrentWindow().onFocusChanged(({ payload: focused }) => {
         *  console.log('Focus changed, window is focused? ' + focused);
         * });
         *
         * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
         * unlisten();
         * ```
         *
         * @returns A promise resolving to a function to unlisten to the event.
         * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
         */
        async onFocusChanged(handler) {
            const unlistenFocus = await this.listen(TauriEvent.WINDOW_FOCUS, (event) => {
                handler({ ...event, payload: true });
            });
            const unlistenBlur = await this.listen(TauriEvent.WINDOW_BLUR, (event) => {
                handler({ ...event, payload: false });
            });
            return () => {
                unlistenFocus();
                unlistenBlur();
            };
        }
        /**
         * Listen to window scale change. Emitted when the window's scale factor has changed.
         * The following user actions can cause DPI changes:
         * - Changing the display's resolution.
         * - Changing the display's scale factor (e.g. in Control Panel on Windows).
         * - Moving the window to a display with a different scale factor.
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from "@tauri-apps/api/window";
         * const unlisten = await getCurrentWindow().onScaleChanged(({ payload }) => {
         *  console.log('Scale changed', payload.scaleFactor, payload.size);
         * });
         *
         * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
         * unlisten();
         * ```
         *
         * @returns A promise resolving to a function to unlisten to the event.
         * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
         */
        async onScaleChanged(handler) {
            return this.listen(TauriEvent.WINDOW_SCALE_FACTOR_CHANGED, handler);
        }
        /**
         * Listen to the system theme change.
         *
         * @example
         * ```typescript
         * import { getCurrentWindow } from "@tauri-apps/api/window";
         * const unlisten = await getCurrentWindow().onThemeChanged(({ payload: theme }) => {
         *  console.log('New theme: ' + theme);
         * });
         *
         * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
         * unlisten();
         * ```
         *
         * @returns A promise resolving to a function to unlisten to the event.
         * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
         */
        async onThemeChanged(handler) {
            return this.listen(TauriEvent.WINDOW_THEME_CHANGED, handler);
        }
    }
    /**
     * Background throttling policy
     *
     * @since 2.0.0
     */
    var BackgroundThrottlingPolicy;
    (function (BackgroundThrottlingPolicy) {
        BackgroundThrottlingPolicy["Disabled"] = "disabled";
        BackgroundThrottlingPolicy["Throttle"] = "throttle";
        BackgroundThrottlingPolicy["Suspend"] = "suspend";
    })(BackgroundThrottlingPolicy || (BackgroundThrottlingPolicy = {}));
    /**
     * Platform-specific window effects
     *
     * @since 2.0.0
     */
    var Effect;
    (function (Effect) {
        /**
         * A default material appropriate for the view's effectiveAppearance.  **macOS 10.14-**
         *
         * @deprecated since macOS 10.14. You should instead choose an appropriate semantic material.
         */
        Effect["AppearanceBased"] = "appearanceBased";
        /**
         *  **macOS 10.14-**
         *
         * @deprecated since macOS 10.14. Use a semantic material instead.
         */
        Effect["Light"] = "light";
        /**
         *  **macOS 10.14-**
         *
         * @deprecated since macOS 10.14. Use a semantic material instead.
         */
        Effect["Dark"] = "dark";
        /**
         *  **macOS 10.14-**
         *
         * @deprecated since macOS 10.14. Use a semantic material instead.
         */
        Effect["MediumLight"] = "mediumLight";
        /**
         *  **macOS 10.14-**
         *
         * @deprecated since macOS 10.14. Use a semantic material instead.
         */
        Effect["UltraDark"] = "ultraDark";
        /**
         *  **macOS 10.10+**
         */
        Effect["Titlebar"] = "titlebar";
        /**
         *  **macOS 10.10+**
         */
        Effect["Selection"] = "selection";
        /**
         *  **macOS 10.11+**
         */
        Effect["Menu"] = "menu";
        /**
         *  **macOS 10.11+**
         */
        Effect["Popover"] = "popover";
        /**
         *  **macOS 10.11+**
         */
        Effect["Sidebar"] = "sidebar";
        /**
         *  **macOS 10.14+**
         */
        Effect["HeaderView"] = "headerView";
        /**
         *  **macOS 10.14+**
         */
        Effect["Sheet"] = "sheet";
        /**
         *  **macOS 10.14+**
         */
        Effect["WindowBackground"] = "windowBackground";
        /**
         *  **macOS 10.14+**
         */
        Effect["HudWindow"] = "hudWindow";
        /**
         *  **macOS 10.14+**
         */
        Effect["FullScreenUI"] = "fullScreenUI";
        /**
         *  **macOS 10.14+**
         */
        Effect["Tooltip"] = "tooltip";
        /**
         *  **macOS 10.14+**
         */
        Effect["ContentBackground"] = "contentBackground";
        /**
         *  **macOS 10.14+**
         */
        Effect["UnderWindowBackground"] = "underWindowBackground";
        /**
         *  **macOS 10.14+**
         */
        Effect["UnderPageBackground"] = "underPageBackground";
        /**
         *  **Windows 11 Only**
         */
        Effect["Mica"] = "mica";
        /**
         * **Windows 7/10/11(22H1) Only**
         *
         * #### Notes
         *
         * This effect has bad performance when resizing/dragging the window on Windows 11 build 22621.
         */
        Effect["Blur"] = "blur";
        /**
         * **Windows 10/11**
         *
         * #### Notes
         *
         * This effect has bad performance when resizing/dragging the window on Windows 10 v1903+ and Windows 11 build 22000.
         */
        Effect["Acrylic"] = "acrylic";
        /**
         * Tabbed effect that matches the system dark perefence **Windows 11 Only**
         */
        Effect["Tabbed"] = "tabbed";
        /**
         * Tabbed effect with dark mode but only if dark mode is enabled on the system **Windows 11 Only**
         */
        Effect["TabbedDark"] = "tabbedDark";
        /**
         * Tabbed effect with light mode **Windows 11 Only**
         */
        Effect["TabbedLight"] = "tabbedLight";
    })(Effect || (Effect = {}));
    /**
     * Window effect state **macOS only**
     *
     * @see https://developer.apple.com/documentation/appkit/nsvisualeffectview/state
     *
     * @since 2.0.0
     */
    var EffectState;
    (function (EffectState) {
        /**
         *  Make window effect state follow the window's active state **macOS only**
         */
        EffectState["FollowsWindowActiveState"] = "followsWindowActiveState";
        /**
         *  Make window effect state always active **macOS only**
         */
        EffectState["Active"] = "active";
        /**
         *  Make window effect state always inactive **macOS only**
         */
        EffectState["Inactive"] = "inactive";
    })(EffectState || (EffectState = {}));

    // Copyright 2019-2024 Tauri Programme within The Commons Conservancy
    // SPDX-License-Identifier: Apache-2.0
    // SPDX-License-Identifier: MIT
    /**
     * Provides APIs to create webviews, communicate with other webviews and manipulate the current webview.
     *
     * #### Webview events
     *
     * Events can be listened to using {@link Webview.listen}:
     * ```typescript
     * import { getCurrentWebview } from "@tauri-apps/api/webview";
     * getCurrentWebview().listen("my-webview-event", ({ event, payload }) => { });
     * ```
     *
     * @module
     */
    /**
     * Get an instance of `Webview` for the current webview.
     *
     * @since 2.0.0
     */
    function getCurrentWebview() {
        return new Webview(getCurrentWindow(), window.__TAURI_INTERNALS__.metadata.currentWebview.label, {
            // @ts-expect-error `skip` is not defined in the public API but it is handled by the constructor
            skip: true
        });
    }
    /**
     * Gets a list of instances of `Webview` for all available webviews.
     *
     * @since 2.0.0
     */
    async function getAllWebviews() {
        return invoke('plugin:webview|get_all_webviews').then((webviews) => webviews.map((w) => new Webview(new Window(w.windowLabel, {
            // @ts-expect-error `skip` is not defined in the public API but it is handled by the constructor
            skip: true
        }), w.label, {
            // @ts-expect-error `skip` is not defined in the public API but it is handled by the constructor
            skip: true
        })));
    }
    /** @ignore */
    // events that are emitted right here instead of by the created webview
    const localTauriEvents = ['tauri://created', 'tauri://error'];
    /**
     * Create new webview or get a handle to an existing one.
     *
     * Webviews are identified by a *label*  a unique identifier that can be used to reference it later.
     * It may only contain alphanumeric characters `a-zA-Z` plus the following special characters `-`, `/`, `:` and `_`.
     *
     * @example
     * ```typescript
     * import { Window } from "@tauri-apps/api/window"
     * import { Webview } from "@tauri-apps/api/webview"
     *
     * const appWindow = new Window('uniqueLabel');
     *
     * // loading embedded asset:
     * const webview = new Webview(appWindow, 'theUniqueLabel', {
     *   url: 'path/to/page.html'
     * });
     * // alternatively, load a remote URL:
     * const webview = new Webview(appWindow, 'theUniqueLabel', {
     *   url: 'https://github.com/tauri-apps/tauri'
     * });
     *
     * webview.once('tauri://created', function () {
     *  // webview successfully created
     * });
     * webview.once('tauri://error', function (e) {
     *  // an error happened creating the webview
     * });
     *
     * // emit an event to the backend
     * await webview.emit("some-event", "data");
     * // listen to an event from the backend
     * const unlisten = await webview.listen("event-name", e => {});
     * unlisten();
     * ```
     *
     * @since 2.0.0
     */
    class Webview {
        /**
         * Creates a new Webview.
         * @example
         * ```typescript
         * import { Window } from '@tauri-apps/api/window'
         * import { Webview } from '@tauri-apps/api/webview'
         * const appWindow = new Window('my-label')
         * const webview = new Webview(appWindow, 'my-label', {
         *   url: 'https://github.com/tauri-apps/tauri'
         * });
         * webview.once('tauri://created', function () {
         *  // webview successfully created
         * });
         * webview.once('tauri://error', function (e) {
         *  // an error happened creating the webview
         * });
         * ```
         *
         * @param window the window to add this webview to.
         * @param label The unique webview label. Must be alphanumeric: `a-zA-Z-/:_`.
         * @returns The {@link Webview} instance to communicate with the webview.
         */
        constructor(window, label, options) {
            this.window = window;
            this.label = label;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            this.listeners = Object.create(null);
            // @ts-expect-error `skip` is not a public API so it is not defined in WebviewOptions
            if (!(options === null || options === void 0 ? void 0 : options.skip)) {
                invoke('plugin:webview|create_webview', {
                    windowLabel: window.label,
                    label,
                    options
                })
                    .then(async () => this.emit('tauri://created'))
                    .catch(async (e) => this.emit('tauri://error', e));
            }
        }
        /**
         * Gets the Webview for the webview associated with the given label.
         * @example
         * ```typescript
         * import { Webview } from '@tauri-apps/api/webview';
         * const mainWebview = Webview.getByLabel('main');
         * ```
         *
         * @param label The webview label.
         * @returns The Webview instance to communicate with the webview or null if the webview doesn't exist.
         */
        static async getByLabel(label) {
            var _a;
            return (_a = (await getAllWebviews()).find((w) => w.label === label)) !== null && _a !== void 0 ? _a : null;
        }
        /**
         * Get an instance of `Webview` for the current webview.
         */
        static getCurrent() {
            return getCurrentWebview();
        }
        /**
         * Gets a list of instances of `Webview` for all available webviews.
         */
        static async getAll() {
            return getAllWebviews();
        }
        /**
         * Listen to an emitted event on this webview.
         *
         * @example
         * ```typescript
         * import { getCurrentWebview } from '@tauri-apps/api/webview';
         * const unlisten = await getCurrentWebview().listen<string>('state-changed', (event) => {
         *   console.log(`Got error: ${payload}`);
         * });
         *
         * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
         * unlisten();
         * ```
         *
         * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
         * @param handler Event handler.
         * @returns A promise resolving to a function to unlisten to the event.
         * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
         */
        async listen(event, handler) {
            if (this._handleTauriEvent(event, handler)) {
                return () => {
                    // eslint-disable-next-line security/detect-object-injection
                    const listeners = this.listeners[event];
                    listeners.splice(listeners.indexOf(handler), 1);
                };
            }
            return listen(event, handler, {
                target: { kind: 'Webview', label: this.label }
            });
        }
        /**
         * Listen to an emitted event on this webview only once.
         *
         * @example
         * ```typescript
         * import { getCurrentWebview } from '@tauri-apps/api/webview';
         * const unlisten = await getCurrent().once<null>('initialized', (event) => {
         *   console.log(`Webview initialized!`);
         * });
         *
         * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
         * unlisten();
         * ```
         *
         * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
         * @param handler Event handler.
         * @returns A promise resolving to a function to unlisten to the event.
         * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
         */
        async once(event, handler) {
            if (this._handleTauriEvent(event, handler)) {
                return () => {
                    // eslint-disable-next-line security/detect-object-injection
                    const listeners = this.listeners[event];
                    listeners.splice(listeners.indexOf(handler), 1);
                };
            }
            return once(event, handler, {
                target: { kind: 'Webview', label: this.label }
            });
        }
        /**
         * Emits an event to all {@link EventTarget|targets}.
         *
         * @example
         * ```typescript
         * import { getCurrentWebview } from '@tauri-apps/api/webview';
         * await getCurrentWebview().emit('webview-loaded', { loggedIn: true, token: 'authToken' });
         * ```
         *
         * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
         * @param payload Event payload.
         */
        async emit(event, payload) {
            if (localTauriEvents.includes(event)) {
                // eslint-disable-next-line
                for (const handler of this.listeners[event] || []) {
                    handler({
                        event,
                        id: -1,
                        payload
                    });
                }
                return;
            }
            return emit(event, payload);
        }
        /**
         * Emits an event to all {@link EventTarget|targets} matching the given target.
         *
         * @example
         * ```typescript
         * import { getCurrentWebview } from '@tauri-apps/api/webview';
         * await getCurrentWebview().emitTo('main', 'webview-loaded', { loggedIn: true, token: 'authToken' });
         * ```
         *
         * @param target Label of the target Window/Webview/WebviewWindow or raw {@link EventTarget} object.
         * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
         * @param payload Event payload.
         */
        async emitTo(target, event, payload) {
            if (localTauriEvents.includes(event)) {
                // eslint-disable-next-line
                for (const handler of this.listeners[event] || []) {
                    handler({
                        event,
                        id: -1,
                        payload
                    });
                }
                return;
            }
            return emitTo(target, event, payload);
        }
        /** @ignore */
        _handleTauriEvent(event, handler) {
            if (localTauriEvents.includes(event)) {
                if (!(event in this.listeners)) {
                    // eslint-disable-next-line security/detect-object-injection
                    this.listeners[event] = [handler];
                }
                else {
                    // eslint-disable-next-line security/detect-object-injection
                    this.listeners[event].push(handler);
                }
                return true;
            }
            return false;
        }
        // Getters
        /**
         * The position of the top-left hand corner of the webview's client area relative to the top-left hand corner of the desktop.
         * @example
         * ```typescript
         * import { getCurrentWebview } from '@tauri-apps/api/webview';
         * const position = await getCurrentWebview().position();
         * ```
         *
         * @returns The webview's position.
         */
        async position() {
            return invoke('plugin:webview|webview_position', {
                label: this.label
            }).then((p) => new PhysicalPosition(p));
        }
        /**
         * The physical size of the webview's client area.
         * The client area is the content of the webview, excluding the title bar and borders.
         * @example
         * ```typescript
         * import { getCurrentWebview } from '@tauri-apps/api/webview';
         * const size = await getCurrentWebview().size();
         * ```
         *
         * @returns The webview's size.
         */
        async size() {
            return invoke('plugin:webview|webview_size', {
                label: this.label
            }).then((s) => new PhysicalSize(s));
        }
        // Setters
        /**
         * Closes the webview.
         * @example
         * ```typescript
         * import { getCurrentWebview } from '@tauri-apps/api/webview';
         * await getCurrentWebview().close();
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async close() {
            return invoke('plugin:webview|webview_close', {
                label: this.label
            });
        }
        /**
         * Resizes the webview.
         * @example
         * ```typescript
         * import { getCurrent, LogicalSize } from '@tauri-apps/api/webview';
         * await getCurrentWebview().setSize(new LogicalSize(600, 500));
         * ```
         *
         * @param size The logical or physical size.
         * @returns A promise indicating the success or failure of the operation.
         */
        async setSize(size) {
            return invoke('plugin:webview|set_webview_size', {
                label: this.label,
                value: size instanceof Size ? size : new Size(size)
            });
        }
        /**
         * Sets the webview position.
         * @example
         * ```typescript
         * import { getCurrent, LogicalPosition } from '@tauri-apps/api/webview';
         * await getCurrentWebview().setPosition(new LogicalPosition(600, 500));
         * ```
         *
         * @param position The new position, in logical or physical pixels.
         * @returns A promise indicating the success or failure of the operation.
         */
        async setPosition(position) {
            return invoke('plugin:webview|set_webview_position', {
                label: this.label,
                value: position instanceof Position ? position : new Position(position)
            });
        }
        /**
         * Bring the webview to front and focus.
         * @example
         * ```typescript
         * import { getCurrentWebview } from '@tauri-apps/api/webview';
         * await getCurrentWebview().setFocus();
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async setFocus() {
            return invoke('plugin:webview|set_webview_focus', {
                label: this.label
            });
        }
        /**
         * Hide the webview.
         * @example
         * ```typescript
         * import { getCurrentWebview } from '@tauri-apps/api/webview';
         * await getCurrentWebview().hide();
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async hide() {
            return invoke('plugin:webview|webview_hide', {
                label: this.label
            });
        }
        /**
         * Show the webview.
         * @example
         * ```typescript
         * import { getCurrentWebview } from '@tauri-apps/api/webview';
         * await getCurrentWebview().show();
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async show() {
            return invoke('plugin:webview|webview_show', {
                label: this.label
            });
        }
        /**
         * Set webview zoom level.
         * @example
         * ```typescript
         * import { getCurrentWebview } from '@tauri-apps/api/webview';
         * await getCurrentWebview().setZoom(1.5);
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async setZoom(scaleFactor) {
            return invoke('plugin:webview|set_webview_zoom', {
                label: this.label,
                value: scaleFactor
            });
        }
        /**
         * Moves this webview to the given label.
         * @example
         * ```typescript
         * import { getCurrentWebview } from '@tauri-apps/api/webview';
         * await getCurrentWebview().reparent('other-window');
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async reparent(window) {
            return invoke('plugin:webview|reparent', {
                label: this.label,
                window: typeof window === 'string' ? window : window.label
            });
        }
        /**
         * Clears all browsing data for this webview.
         * @example
         * ```typescript
         * import { getCurrentWebview } from '@tauri-apps/api/webview';
         * await getCurrentWebview().clearAllBrowsingData();
         * ```
         *
         * @returns A promise indicating the success or failure of the operation.
         */
        async clearAllBrowsingData() {
            return invoke('plugin:webview|clear_all_browsing_data');
        }
        /**
         * Specify the webview background color.
         *
         * #### Platfrom-specific:
         *
         * - **macOS / iOS**: Not implemented.
         * - **Windows**:
         *   - On Windows 7, transparency is not supported and the alpha value will be ignored.
         *   - On Windows higher than 7: translucent colors are not supported so any alpha value other than `0` will be replaced by `255`
         *
         * @returns A promise indicating the success or failure of the operation.
         *
         * @since 2.1.0
         */
        async setBackgroundColor(color) {
            return invoke('plugin:webview|set_webview_background_color', { color });
        }
        // Listeners
        /**
         * Listen to a file drop event.
         * The listener is triggered when the user hovers the selected files on the webview,
         * drops the files or cancels the operation.
         *
         * @example
         * ```typescript
         * import { getCurrentWebview } from "@tauri-apps/api/webview";
         * const unlisten = await getCurrentWebview().onDragDropEvent((event) => {
         *  if (event.payload.type === 'over') {
         *    console.log('User hovering', event.payload.position);
         *  } else if (event.payload.type === 'drop') {
         *    console.log('User dropped', event.payload.paths);
         *  } else {
         *    console.log('File drop cancelled');
         *  }
         * });
         *
         * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
         * unlisten();
         * ```
         *
         * When the debugger panel is open, the drop position of this event may be inaccurate due to a known limitation.
         * To retrieve the correct drop position, please detach the debugger.
         *
         * @returns A promise resolving to a function to unlisten to the event.
         * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
         */
        async onDragDropEvent(handler) {
            const unlistenDragEnter = await this.listen(TauriEvent.DRAG_ENTER, (event) => {
                handler({
                    ...event,
                    payload: {
                        type: 'enter',
                        paths: event.payload.paths,
                        position: new PhysicalPosition(event.payload.position)
                    }
                });
            });
            const unlistenDragOver = await this.listen(TauriEvent.DRAG_OVER, (event) => {
                handler({
                    ...event,
                    payload: {
                        type: 'over',
                        position: new PhysicalPosition(event.payload.position)
                    }
                });
            });
            const unlistenDragDrop = await this.listen(TauriEvent.DRAG_DROP, (event) => {
                handler({
                    ...event,
                    payload: {
                        type: 'drop',
                        paths: event.payload.paths,
                        position: new PhysicalPosition(event.payload.position)
                    }
                });
            });
            const unlistenDragLeave = await this.listen(TauriEvent.DRAG_LEAVE, (event) => {
                handler({ ...event, payload: { type: 'leave' } });
            });
            return () => {
                unlistenDragEnter();
                unlistenDragDrop();
                unlistenDragOver();
                unlistenDragLeave();
            };
        }
    }

    // Copyright 2019-2024 Tauri Programme within The Commons Conservancy
    // SPDX-License-Identifier: Apache-2.0
    // SPDX-License-Identifier: MIT
    /**
     * Get an instance of `Webview` for the current webview window.
     *
     * @since 2.0.0
     */
    function getCurrentWebviewWindow() {
        const webview = getCurrentWebview();
        // @ts-expect-error `skip` is not defined in the public API but it is handled by the constructor
        return new WebviewWindow(webview.label, { skip: true });
    }
    /**
     * Gets a list of instances of `Webview` for all available webview windows.
     *
     * @since 2.0.0
     */
    async function getAllWebviewWindows() {
        return invoke('plugin:window|get_all_windows').then((windows) => windows.map((w) => new WebviewWindow(w, {
            // @ts-expect-error `skip` is not defined in the public API but it is handled by the constructor
            skip: true
        })));
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
    class WebviewWindow {
        /**
         * Creates a new {@link Window} hosting a {@link Webview}.
         * @example
         * ```typescript
         * import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
         * const webview = new WebviewWindow('my-label', {
         *   url: 'https://github.com/tauri-apps/tauri'
         * });
         * webview.once('tauri://created', function () {
         *  // webview successfully created
         * });
         * webview.once('tauri://error', function (e) {
         *  // an error happened creating the webview
         * });
         * ```
         *
         * @param label The unique webview label. Must be alphanumeric: `a-zA-Z-/:_`.
         * @returns The {@link WebviewWindow} instance to communicate with the window and webview.
         */
        constructor(label, options = {}) {
            var _a;
            this.label = label;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            this.listeners = Object.create(null);
            // @ts-expect-error `skip` is not a public API so it is not defined in WebviewOptions
            if (!(options === null || options === void 0 ? void 0 : options.skip)) {
                invoke('plugin:webview|create_webview_window', {
                    options: {
                        ...options,
                        parent: typeof options.parent === 'string'
                            ? options.parent
                            : (_a = options.parent) === null || _a === void 0 ? void 0 : _a.label,
                        label
                    }
                })
                    .then(async () => this.emit('tauri://created'))
                    .catch(async (e) => this.emit('tauri://error', e));
            }
        }
        /**
         * Gets the Webview for the webview associated with the given label.
         * @example
         * ```typescript
         * import { Webview } from '@tauri-apps/api/webviewWindow';
         * const mainWebview = Webview.getByLabel('main');
         * ```
         *
         * @param label The webview label.
         * @returns The Webview instance to communicate with the webview or null if the webview doesn't exist.
         */
        static async getByLabel(label) {
            var _a;
            const webview = (_a = (await getAllWebviewWindows()).find((w) => w.label === label)) !== null && _a !== void 0 ? _a : null;
            if (webview) {
                // @ts-expect-error `skip` is not defined in the public API but it is handled by the constructor
                return new WebviewWindow(webview.label, { skip: true });
            }
            return null;
        }
        /**
         * Get an instance of `Webview` for the current webview.
         */
        static getCurrent() {
            return getCurrentWebviewWindow();
        }
        /**
         * Gets a list of instances of `Webview` for all available webviews.
         */
        static async getAll() {
            return getAllWebviewWindows();
        }
        /**
         * Listen to an emitted event on this webivew window.
         *
         * @example
         * ```typescript
         * import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
         * const unlisten = await WebviewWindow.getCurrent().listen<string>('state-changed', (event) => {
         *   console.log(`Got error: ${payload}`);
         * });
         *
         * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
         * unlisten();
         * ```
         *
         * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
         * @param handler Event handler.
         * @returns A promise resolving to a function to unlisten to the event.
         * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
         */
        async listen(event, handler) {
            if (this._handleTauriEvent(event, handler)) {
                return () => {
                    // eslint-disable-next-line security/detect-object-injection
                    const listeners = this.listeners[event];
                    listeners.splice(listeners.indexOf(handler), 1);
                };
            }
            return listen(event, handler, {
                target: { kind: 'WebviewWindow', label: this.label }
            });
        }
        /**
         * Listen to an emitted event on this webview window only once.
         *
         * @example
         * ```typescript
         * import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
         * const unlisten = await WebviewWindow.getCurrent().once<null>('initialized', (event) => {
         *   console.log(`Webview initialized!`);
         * });
         *
         * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
         * unlisten();
         * ```
         *
         * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
         * @param handler Event handler.
         * @returns A promise resolving to a function to unlisten to the event.
         * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
         */
        async once(event, handler) {
            if (this._handleTauriEvent(event, handler)) {
                return () => {
                    // eslint-disable-next-line security/detect-object-injection
                    const listeners = this.listeners[event];
                    listeners.splice(listeners.indexOf(handler), 1);
                };
            }
            return once(event, handler, {
                target: { kind: 'WebviewWindow', label: this.label }
            });
        }
        /**
         * Set the window and webview background color.
         *
         * #### Platform-specific:
         *
         * - **Android / iOS:** Unsupported for the window layer.
         * - **macOS / iOS**: Not implemented for the webview layer.
         * - **Windows**:
         *   - alpha channel is ignored for the window layer.
         *   - On Windows 7, alpha channel is ignored for the webview layer.
         *   - On Windows 8 and newer, if alpha channel is not `0`, it will be ignored.
         *
         * @returns A promise indicating the success or failure of the operation.
         *
         * @since 2.1.0
         */
        async setBackgroundColor(color) {
            return invoke('plugin:window|set_background_color', { color }).then(() => {
                return invoke('plugin:webview|set_webview_background_color', { color });
            });
        }
    }
    // Order matters, we use window APIs by default
    applyMixins(WebviewWindow, [Window, Webview]);
    /** Extends a base class by other specified classes, without overriding existing properties */
    function applyMixins(baseClass, extendedClasses) {
        (Array.isArray(extendedClasses)
            ? extendedClasses
            : [extendedClasses]).forEach((extendedClass) => {
            Object.getOwnPropertyNames(extendedClass.prototype).forEach((name) => {
                var _a;
                if (typeof baseClass.prototype === 'object'
                    && baseClass.prototype
                    && name in baseClass.prototype)
                    return;
                Object.defineProperty(baseClass.prototype, name, 
                // eslint-disable-next-line
                (_a = Object.getOwnPropertyDescriptor(extendedClass.prototype, name)) !== null && _a !== void 0 ? _a : Object.create(null));
            });
        });
    }

    async function setupPluginListeners() {
        const currentWindow = getCurrentWebviewWindow();
        await currentWindow.listen('got-dom-content', handleDomContentRequest);
        await currentWindow.listen('get-local-storage', handleLocalStorageRequest);
        await currentWindow.listen('execute-js', handleJsExecutionRequest);
        await currentWindow.listen('get-element-position', handleGetElementPositionRequest);
        await currentWindow.listen('send-text-to-element', handleSendTextToElementRequest);
        await currentWindow.listen('capture-screenshot', handleCaptureScreenshotRequest);
        await currentWindow.listen('iframe-rpc', handleIframeRpcRequest);
        console.log('TAURI-PLUGIN-MCP: Event listeners for "got-dom-content", "get-local-storage", "execute-js", "get-element-position", "send-text-to-element", "capture-screenshot", and "iframe-rpc" are set up on the current window.');
    }
    async function handleGetElementPositionRequest(event) {
        console.log('TAURI-PLUGIN-MCP: Received get-element-position, payload:', event.payload);
        try {
            const { selectorType, selectorValue, shouldClick = false } = event.payload;
            // Find the element based on the selector type
            let element = null;
            let debugInfo = [];
            switch (selectorType) {
                case 'id':
                    element = document.getElementById(selectorValue);
                    if (!element) {
                        debugInfo.push(`No element found with id="${selectorValue}"`);
                    }
                    break;
                case 'class':
                    // Get the first element with the class
                    const elemsByClass = document.getElementsByClassName(selectorValue);
                    element = elemsByClass.length > 0 ? elemsByClass[0] : null;
                    if (!element) {
                        debugInfo.push(`No elements found with class="${selectorValue}" (total matching: 0)`);
                    }
                    else if (elemsByClass.length > 1) {
                        debugInfo.push(`Found ${elemsByClass.length} elements with class="${selectorValue}", using the first one`);
                    }
                    break;
                case 'tag':
                    // Get the first element with the tag name
                    const elemsByTag = document.getElementsByTagName(selectorValue);
                    element = elemsByTag.length > 0 ? elemsByTag[0] : null;
                    if (!element) {
                        debugInfo.push(`No elements found with tag="${selectorValue}" (total matching: 0)`);
                    }
                    else if (elemsByTag.length > 1) {
                        debugInfo.push(`Found ${elemsByTag.length} elements with tag="${selectorValue}", using the first one`);
                    }
                    break;
                case 'text':
                    // Find element by text content
                    element = findElementByText(selectorValue);
                    if (!element) {
                        debugInfo.push(`No element found with text="${selectorValue}"`);
                        // Check if any element contains part of the text (for debugging)
                        const containingElements = Array.from(document.querySelectorAll('*'))
                            .filter(el => el.textContent && el.textContent.includes(selectorValue));
                        if (containingElements.length > 0) {
                            debugInfo.push(`Found ${containingElements.length} elements containing part of the text.`);
                            debugInfo.push(`First element with partial match: ${containingElements[0].tagName}, text="${containingElements[0].textContent?.trim()}"`);
                        }
                        // Check for similar inputs
                        const inputs = Array.from(document.querySelectorAll('input, textarea'));
                        const inputsWithSimilarPlaceholders = inputs
                            .filter(input => input.placeholder &&
                            input.placeholder.includes(selectorValue));
                        if (inputsWithSimilarPlaceholders.length > 0) {
                            debugInfo.push(`Found ${inputsWithSimilarPlaceholders.length} input elements with similar placeholders.`);
                            const firstMatch = inputsWithSimilarPlaceholders[0];
                            debugInfo.push(`First input with similar placeholder: ${firstMatch.tagName}, placeholder="${firstMatch.placeholder}"`);
                        }
                    }
                    break;
                default:
                    throw new Error(`Unsupported selector type: ${selectorType}`);
            }
            if (!element) {
                throw new Error(`Element with ${selectorType}="${selectorValue}" not found. ${debugInfo.join(' ')}`);
            }
            // Get element position
            const rect = element.getBoundingClientRect();
            console.log('TAURI-PLUGIN-MCP: Element rect:', {
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height
            });
            // Calculate center of the element in viewport-relative CSS pixels
            const elementViewportCssX = rect.left + (rect.width / 2);
            const elementViewportCssY = rect.top + (rect.height / 2);
            // Account for Webview Scrolling (CSS Pixels)
            const elementDocumentCssX = elementViewportCssX + window.scrollX;
            const elementDocumentCssY = elementViewportCssY + window.scrollY;
            // Always return the raw document coordinates (ideal for mouse_movement)
            const targetX = elementDocumentCssX;
            const targetY = elementDocumentCssY;
            console.log('TAURI-PLUGIN-MCP: Raw coordinates for mouse_movement:', { x: targetX, y: targetY });
            // Click the element if requested
            let clickResult = null;
            if (shouldClick) {
                clickResult = clickElement(element, elementViewportCssX, elementViewportCssY);
            }
            await emit('get-element-position-response', {
                success: true,
                data: {
                    x: targetX,
                    y: targetY,
                    element: {
                        tag: element.tagName,
                        classes: element.className,
                        id: element.id,
                        text: element.textContent?.trim() || '',
                        placeholder: element instanceof HTMLInputElement ? element.placeholder : undefined
                    },
                    clicked: shouldClick,
                    clickResult,
                    debug: {
                        elementRect: rect,
                        viewportCenter: {
                            x: elementViewportCssX,
                            y: elementViewportCssY
                        },
                        documentCenter: {
                            x: elementDocumentCssX,
                            y: elementDocumentCssY
                        },
                        window: {
                            innerSize: {
                                width: window.innerWidth,
                                height: window.innerHeight
                            },
                            scrollPosition: {
                                x: window.scrollX,
                                y: window.scrollY
                            }
                        }
                    }
                }
            });
        }
        catch (error) {
            console.error('TAURI-PLUGIN-MCP: Error handling get-element-position request', error);
            await emit('get-element-position-response', {
                success: false,
                error: error instanceof Error ? error.toString() : String(error)
            }).catch(e => console.error('TAURI-PLUGIN-MCP: Error emitting error response', e));
        }
    }
    // Helper function to find an element by its text content
    function findElementByText(text) {
        // Get all elements in the document
        const allElements = document.querySelectorAll('*');
        // First try exact text content matching
        for (const element of allElements) {
            // Check exact text content
            if (element.textContent && element.textContent.trim() === text) {
                return element;
            }
            // Check placeholder attribute (for input fields)
            if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
                if (element.placeholder === text) {
                    return element;
                }
            }
            // Check title attribute
            if (element.getAttribute('title') === text) {
                return element;
            }
            // Check aria-label attribute
            if (element.getAttribute('aria-label') === text) {
                return element;
            }
        }
        // If no exact match, try partial text content matching
        for (const element of allElements) {
            // Check if text is contained within the element's text
            if (element.textContent && element.textContent.trim().includes(text)) {
                return element;
            }
            // Check if text is contained within placeholder
            if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
                if (element.placeholder && element.placeholder.includes(text)) {
                    return element;
                }
            }
            // Check partial match in title attribute
            const title = element.getAttribute('title');
            if (title && title.includes(text)) {
                return element;
            }
            // Check partial match in aria-label attribute
            const ariaLabel = element.getAttribute('aria-label');
            if (ariaLabel && ariaLabel.includes(text)) {
                return element;
            }
        }
        return null;
    }
    // Helper function to click an element
    function clickElement(element, centerX, centerY) {
        try {
            // Create and dispatch mouse events
            const mouseDown = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: centerX,
                clientY: centerY
            });
            const mouseUp = new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: centerX,
                clientY: centerY
            });
            const click = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: centerX,
                clientY: centerY
            });
            // Dispatch the events
            element.dispatchEvent(mouseDown);
            element.dispatchEvent(mouseUp);
            element.dispatchEvent(click);
            return {
                success: true,
                elementTag: element.tagName,
                position: { x: centerX, y: centerY }
            };
        }
        catch (error) {
            console.error('TAURI-PLUGIN-MCP: Error clicking element:', error);
            return {
                success: false,
                error: error instanceof Error ? error.toString() : String(error)
            };
        }
    }
    async function handleDomContentRequest(event) {
        console.log('TAURI-PLUGIN-MCP: Received got-dom-content, payload:', event.payload);
        try {
            const domContent = getDomContent();
            await emit('got-dom-content-response', domContent);
            console.log('TAURI-PLUGIN-MCP: Emitted got-dom-content-response');
        }
        catch (error) {
            console.error('TAURI-PLUGIN-MCP: Error handling dom content request', error);
            await emit('got-dom-content-response', '').catch(e => console.error('TAURI-PLUGIN-MCP: Error emitting empty response', e));
        }
    }
    function getDomContent() {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            const domContent = document.documentElement.outerHTML;
            console.log('TAURI-PLUGIN-MCP: DOM content fetched, length:', domContent.length);
            return domContent;
        }
        console.warn('TAURI-PLUGIN-MCP: DOM not fully loaded when got-dom-content received. Returning empty content.');
        return '';
    }
    async function handleLocalStorageRequest(event) {
        console.log('TAURI-PLUGIN-MCP: Received get-local-storage, payload:', event.payload);
        try {
            const { action, key, value } = event.payload;
            // Convert values that might be JSON strings to their actual values
            let processedKey = key;
            let processedValue = value;
            // If key is a JSON string, try to parse it
            if (typeof key === 'string') {
                try {
                    if (key.trim().startsWith('{') || key.trim().startsWith('[')) {
                        processedKey = JSON.parse(key);
                    }
                }
                catch (e) {
                    // Keep original if parsing fails
                    console.log('TAURI-PLUGIN-MCP: Key not valid JSON, using as string');
                }
            }
            // If value is a JSON string, try to parse it
            if (typeof value === 'string') {
                try {
                    if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
                        processedValue = JSON.parse(value);
                    }
                }
                catch (e) {
                    // Keep original if parsing fails
                    console.log('TAURI-PLUGIN-MCP: Value not valid JSON, using as string');
                }
            }
            console.log('TAURI-PLUGIN-MCP: Processing localStorage operation', {
                action,
                processedKey,
                processedValue
            });
            const result = performLocalStorageOperation(action, processedKey, processedValue);
            await emit('get-local-storage-response', result);
            console.log('TAURI-PLUGIN-MCP: Emitted get-local-storage-response');
        }
        catch (error) {
            console.error('TAURI-PLUGIN-MCP: Error handling localStorage request', error);
            await emit('get-local-storage-response', {
                success: false,
                error: error instanceof Error ? error.toString() : String(error)
            }).catch(e => console.error('TAURI-PLUGIN-MCP: Error emitting error response', e));
        }
    }
    function performLocalStorageOperation(action, key, value) {
        console.log('TAURI-PLUGIN-MCP: LocalStorage operation', {
            action,
            key: typeof key === 'undefined' ? 'undefined' : key,
            value: typeof value === 'undefined' ? 'undefined' : value,
            keyType: typeof key,
            valueType: typeof value
        });
        switch (action) {
            case 'get':
                if (!key) {
                    console.log('TAURI-PLUGIN-MCP: Getting all localStorage items');
                    // If no key is provided, return all localStorage items
                    const allItems = {};
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        if (k) {
                            allItems[k] = localStorage.getItem(k) || '';
                        }
                    }
                    return {
                        success: true,
                        data: allItems
                    };
                }
                console.log(`TAURI-PLUGIN-MCP: Getting localStorage item with key: ${key}`);
                return {
                    success: true,
                    data: localStorage.getItem(String(key))
                };
            case 'set':
                if (!key) {
                    console.log('TAURI-PLUGIN-MCP: Set operation failed - no key provided');
                    throw new Error('Key is required for set operation');
                }
                if (value === undefined) {
                    console.log('TAURI-PLUGIN-MCP: Set operation failed - no value provided');
                    throw new Error('Value is required for set operation');
                }
                const keyStr = String(key);
                const valueStr = String(value);
                console.log(`TAURI-PLUGIN-MCP: Setting localStorage item: ${keyStr} = ${valueStr}`);
                localStorage.setItem(keyStr, valueStr);
                return { success: true };
            case 'remove':
                if (!key) {
                    console.log('TAURI-PLUGIN-MCP: Remove operation failed - no key provided');
                    throw new Error('Key is required for remove operation');
                }
                console.log(`TAURI-PLUGIN-MCP: Removing localStorage item with key: ${key}`);
                localStorage.removeItem(String(key));
                return { success: true };
            case 'clear':
                console.log('TAURI-PLUGIN-MCP: Clearing all localStorage items');
                localStorage.clear();
                return { success: true };
            case 'keys':
                console.log('TAURI-PLUGIN-MCP: Getting all localStorage keys');
                return {
                    success: true,
                    data: Object.keys(localStorage)
                };
            default:
                console.log(`TAURI-PLUGIN-MCP: Unsupported localStorage action: ${action}`);
                throw new Error(`Unsupported localStorage action: ${action}`);
        }
    }
    // Handle JS execution requests
    async function handleJsExecutionRequest(event) {
        console.log('TAURI-PLUGIN-MCP: Received execute-js, payload:', event.payload);
        try {
            // Extract the code to execute
            const code = event.payload;
            // Execute the code
            const result = executeJavaScript(code);
            // Prepare response with result and type information
            // Ensure all values are properly stringified for the Rust side (expects r.as_str())
            let resultStr;
            if (result === undefined) {
                resultStr = 'undefined';
            }
            else if (result === null) {
                resultStr = 'null';
            }
            else if (typeof result === 'object') {
                resultStr = JSON.stringify(result);
            }
            else {
                resultStr = String(result);
            }
            const response = {
                result: resultStr,
                type: typeof result
            };
            // Send back the result
            await emit('execute-js-response', response);
            console.log('TAURI-PLUGIN-MCP: Emitted execute-js-response');
        }
        catch (error) {
            console.error('TAURI-PLUGIN-MCP: Error executing JavaScript:', error);
            const errorMessage = error instanceof Error ? error.toString() : String(error);
            await emit('execute-js-response', {
                result: null,
                type: 'error',
                error: errorMessage
            }).catch(e => console.error('TAURI-PLUGIN-MCP: Error emitting error response', e));
        }
    }
    // Function to safely execute JavaScript code
    function executeJavaScript(code) {
        // Using Function constructor is slightly safer than eval
        // It runs in global scope rather than local scope
        try {
            // For expressions, return the result
            return new Function(`return (${code})`)();
        }
        catch {
            // If that fails, try executing as statements
            return new Function(code)();
        }
    }
    async function handleSendTextToElementRequest(event) {
        console.log('TAURI-PLUGIN-MCP: Received send-text-to-element, payload:', event.payload);
        try {
            const { selectorType, selectorValue, text, delayMs = 20 } = event.payload;
            // Find the element based on the selector type
            let element = null;
            let debugInfo = [];
            switch (selectorType) {
                case 'id':
                    element = document.getElementById(selectorValue);
                    if (!element) {
                        debugInfo.push(`No element found with id="${selectorValue}"`);
                    }
                    break;
                case 'class':
                    // Get the first element with the class
                    const elemsByClass = document.getElementsByClassName(selectorValue);
                    element = elemsByClass.length > 0 ? elemsByClass[0] : null;
                    if (!element) {
                        debugInfo.push(`No elements found with class="${selectorValue}" (total matching: 0)`);
                    }
                    else if (elemsByClass.length > 1) {
                        debugInfo.push(`Found ${elemsByClass.length} elements with class="${selectorValue}", using the first one`);
                    }
                    break;
                case 'tag':
                    // Get the first element with the tag name
                    const elemsByTag = document.getElementsByTagName(selectorValue);
                    element = elemsByTag.length > 0 ? elemsByTag[0] : null;
                    if (!element) {
                        debugInfo.push(`No elements found with tag="${selectorValue}" (total matching: 0)`);
                    }
                    else if (elemsByTag.length > 1) {
                        debugInfo.push(`Found ${elemsByTag.length} elements with tag="${selectorValue}", using the first one`);
                    }
                    break;
                case 'text':
                    // Find element by text content
                    element = findElementByText(selectorValue);
                    if (!element) {
                        debugInfo.push(`No element found with text="${selectorValue}"`);
                    }
                    break;
                default:
                    throw new Error(`Unsupported selector type: ${selectorType}`);
            }
            if (!element) {
                throw new Error(`Element with ${selectorType}="${selectorValue}" not found. ${debugInfo.join(' ')}`);
            }
            // Check if the element is an input field, textarea, or has contentEditable
            const isEditableElement = element instanceof HTMLInputElement ||
                element instanceof HTMLTextAreaElement ||
                element.isContentEditable;
            if (!isEditableElement) {
                console.warn(`Element is not normally editable: ${element.tagName}. Will try to set value/textContent directly.`);
            }
            // Focus the element first
            element.focus();
            // Set the text content based on element type
            if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
                await simulateReactInputTyping(element, text, delayMs);
            }
            else if (element.isContentEditable) {
                // For contentEditable elements 
                console.log(`TAURI-PLUGIN-MCP: Setting text in contentEditable element: ${element.id || element.className}`);
                // Check if it's a specific type of editor
                const isLexicalEditor = element.hasAttribute('data-lexical-editor');
                const isSlateEditor = element.querySelector('[data-slate-editor="true"]') !== null;
                if (isLexicalEditor) {
                    console.log('TAURI-PLUGIN-MCP: Detected Lexical editor, using specialized handling');
                    await typeIntoLexicalEditor(element, text, delayMs);
                }
                else if (isSlateEditor) {
                    console.log('TAURI-PLUGIN-MCP: Detected Slate editor, using specialized handling');
                    await typeIntoSlateEditor(element, text, delayMs);
                }
                else {
                    // Generic contentEditable handling
                    await typeIntoContentEditable(element, text, delayMs);
                }
            }
            else {
                // For other elements, try to set textContent (may not work as expected)
                element.textContent = text;
                console.warn('TAURI-PLUGIN-MCP: Element is not an input, textarea, or contentEditable. Text was set directly but may not behave as expected.');
            }
            await emit('send-text-to-element-response', {
                success: true,
                data: {
                    element: {
                        tag: element.tagName,
                        classes: element.className,
                        id: element.id,
                        type: element instanceof HTMLInputElement ? element.type : null,
                        text: text,
                        isEditable: isEditableElement
                    }
                }
            });
        }
        catch (error) {
            console.error('TAURI-PLUGIN-MCP: Error handling send-text-to-element request', error);
            await emit('send-text-to-element-response', {
                success: false,
                error: error instanceof Error ? error.toString() : String(error)
            }).catch(e => console.error('TAURI-PLUGIN-MCP: Error emitting error response', e));
        }
    }
    // Better function to handle typing in React controlled components
    async function simulateReactInputTyping(element, text, delayMs) {
        console.log('TAURI-PLUGIN-MCP: Simulating typing on React component');
        // First focus the element - important for React to recognize the field
        element.focus();
        await new Promise(resolve => setTimeout(resolve, 50)); // Brief delay after focus
        // Instead of setting the value directly, we'll simulate keypresses
        // This approach more closely mimics real user interaction
        try {
            // For React, clear first by setting empty value and triggering events
            element.value = '';
            element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
            // Wait a brief moment to let React's state update
            await new Promise(resolve => setTimeout(resolve, 50));
            console.log('TAURI-PLUGIN-MCP: Simulating keypress events for text:', text);
            // Simulate pressing each key with events in the correct sequence
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const partialText = text.substring(0, i + 1);
                // Simulate keydown
                const keydownEvent = new KeyboardEvent('keydown', {
                    key: char,
                    code: `Key${char.toUpperCase()}`,
                    bubbles: true,
                    cancelable: true,
                    composed: true
                });
                element.dispatchEvent(keydownEvent);
                // Update value to what it would be after this keypress
                element.value = partialText;
                // Simulate input event (most important for React)
                const inputEvent = new Event('input', {
                    bubbles: true,
                    cancelable: true
                });
                element.dispatchEvent(inputEvent);
                // Simulate keyup
                const keyupEvent = new KeyboardEvent('keyup', {
                    key: char,
                    code: `Key${char.toUpperCase()}`,
                    bubbles: true,
                    cancelable: true,
                    composed: true
                });
                element.dispatchEvent(keyupEvent);
                // Add delay between characters to simulate typing
                if (delayMs > 0 && i < text.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }
            }
            // Final change event after all typing is complete
            const changeEvent = new Event('change', {
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(changeEvent);
            // Give React a moment to process the final change
            await new Promise(resolve => setTimeout(resolve, 50));
            console.log('TAURI-PLUGIN-MCP: Completed React input typing simulation');
        }
        catch (e) {
            console.error('TAURI-PLUGIN-MCP: Error during React input typing:', e);
            // Last resort fallback - direct mutation
            console.log('TAURI-PLUGIN-MCP: Falling back to direct value assignment');
            element.value = text;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
        }
        // Ensure the value is set at the end regardless of method
        if (element.value !== text) {
            console.log('TAURI-PLUGIN-MCP: Final value check - correcting if needed');
            element.value = text;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
    // Helper function to type text into a contentEditable element with a delay
    async function typeIntoContentEditable(element, text, delayMs) {
        console.log('TAURI-PLUGIN-MCP: Using general contentEditable typing approach');
        try {
            // Focus first
            element.focus();
            await new Promise(resolve => setTimeout(resolve, 50));
            // Clear existing content
            element.innerHTML = '';
            // Dispatch input event to notify frameworks of the change
            element.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
            await new Promise(resolve => setTimeout(resolve, 50));
            // For regular contentEditable, character-by-character simulation works well
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                // Simulate keydown
                const keydownEvent = new KeyboardEvent('keydown', {
                    bubbles: true,
                    cancelable: true,
                    key: char,
                    code: `Key${char.toUpperCase()}`
                });
                element.dispatchEvent(keydownEvent);
                // Insert the character by simulating typing
                // Use DOM selection and insertNode for proper insertion at cursor
                const selection = window.getSelection();
                const range = document.createRange();
                // Set range to end of element
                range.selectNodeContents(element);
                range.collapse(false); // Collapse to the end
                // Apply the selection
                selection?.removeAllRanges();
                selection?.addRange(range);
                // Insert text at cursor position
                const textNode = document.createTextNode(char);
                range.insertNode(textNode);
                // Move selection to after inserted text
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                selection?.removeAllRanges();
                selection?.addRange(range);
                // Dispatch input event to notify of change
                element.dispatchEvent(new InputEvent('input', {
                    bubbles: true,
                    cancelable: true,
                    inputType: 'insertText',
                    data: char
                }));
                // Simulate keyup
                const keyupEvent = new KeyboardEvent('keyup', {
                    bubbles: true,
                    cancelable: true,
                    key: char,
                    code: `Key${char.toUpperCase()}`
                });
                element.dispatchEvent(keyupEvent);
                // Add delay between keypresses
                if (delayMs > 0 && i < text.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }
            }
            // Final change event
            element.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('TAURI-PLUGIN-MCP: Completed contentEditable text entry');
        }
        catch (e) {
            console.error('TAURI-PLUGIN-MCP: Error in contentEditable typing:', e);
            // Fallback: direct setting
            element.textContent = text;
            element.dispatchEvent(new InputEvent('input', { bubbles: true }));
        }
    }
    // Helper function specifically for Lexical Editor
    async function typeIntoLexicalEditor(element, text, delayMs) {
        console.log('TAURI-PLUGIN-MCP: Starting specialized Lexical editor typing');
        try {
            // First focus the element
            element.focus();
            await new Promise(resolve => setTimeout(resolve, 100)); // Longer focus delay for Lexical
            // Clear the editor - find any paragraph elements and clear them
            const paragraphs = element.querySelectorAll('p');
            if (paragraphs.length > 0) {
                for (const p of paragraphs) {
                    p.innerHTML = '<br>'; // Lexical often uses <br> for empty paragraphs
                }
            }
            else {
                // If no paragraphs, try clearing directly (less reliable)
                element.innerHTML = '<p class="editor-paragraph"><br></p>';
            }
            // Trigger input event to notify Lexical of the change
            element.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
            await new Promise(resolve => setTimeout(resolve, 100));
            // Find the first paragraph to type into
            const targetParagraph = element.querySelector('p') || element;
            // For Lexical, we'll also use the beforeinput event which it may listen for
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                // Find active element in case Lexical changed it
                const activeElement = document.activeElement;
                const currentTarget = (activeElement && element.contains(activeElement))
                    ? activeElement
                    : targetParagraph;
                // Dispatch beforeinput event (important for Lexical)
                const beforeInputEvent = new InputEvent('beforeinput', {
                    bubbles: true,
                    cancelable: true,
                    inputType: 'insertText',
                    data: char
                });
                currentTarget.dispatchEvent(beforeInputEvent);
                // Create and dispatch keydown
                const keydownEvent = new KeyboardEvent('keydown', {
                    bubbles: true,
                    cancelable: true,
                    key: char,
                    code: `Key${char.toUpperCase()}`,
                    composed: true
                });
                currentTarget.dispatchEvent(keydownEvent);
                // Use execCommand for more reliable text insertion
                if (!beforeInputEvent.defaultPrevented) {
                    document.execCommand('insertText', false, char);
                }
                // Dispatch input event
                const inputEvent = new InputEvent('input', {
                    bubbles: true,
                    cancelable: true,
                    inputType: 'insertText',
                    data: char
                });
                currentTarget.dispatchEvent(inputEvent);
                // Create and dispatch keyup
                const keyupEvent = new KeyboardEvent('keyup', {
                    bubbles: true,
                    cancelable: true,
                    key: char,
                    code: `Key${char.toUpperCase()}`,
                    composed: true
                });
                currentTarget.dispatchEvent(keyupEvent);
                // Add delay between keypresses
                if (delayMs > 0 && i < text.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }
            }
            // Final selection adjustment (move to end of text)
            try {
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(targetParagraph);
                range.collapse(false); // Collapse to end
                selection?.removeAllRanges();
                selection?.addRange(range);
            }
            catch (e) {
                console.warn('TAURI-PLUGIN-MCP: Error setting final selection:', e);
            }
            console.log('TAURI-PLUGIN-MCP: Completed Lexical editor typing');
        }
        catch (e) {
            console.error('TAURI-PLUGIN-MCP: Error in Lexical editor typing:', e);
            // Last resort fallback - try to set content directly
            try {
                const firstParagraph = element.querySelector('p') || element;
                firstParagraph.textContent = text;
                element.dispatchEvent(new InputEvent('input', { bubbles: true }));
            }
            catch (innerError) {
                console.error('TAURI-PLUGIN-MCP: Fallback for Lexical editor failed:', innerError);
            }
        }
    }
    // Helper function specifically for Slate Editor
    async function typeIntoSlateEditor(element, text, delayMs) {
        console.log('TAURI-PLUGIN-MCP: Starting specialized Slate editor typing');
        try {
            // Focus the element
            element.focus();
            await new Promise(resolve => setTimeout(resolve, 100));
            // Find the actual editable div in Slate editor
            const editableDiv = element.querySelector('[contenteditable="true"]') || element;
            if (editableDiv instanceof HTMLElement) {
                editableDiv.focus();
            }
            // For Slate, we'll try the execCommand approach which is often more reliable
            document.execCommand('selectAll', false, undefined);
            document.execCommand('delete', false, undefined);
            await new Promise(resolve => setTimeout(resolve, 50));
            // Simulate typing with proper events
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                // Ensure we're targeting the active element (Slate may change focus)
                const activeElement = document.activeElement || editableDiv;
                // Key events sequence
                activeElement.dispatchEvent(new KeyboardEvent('keydown', {
                    key: char,
                    bubbles: true,
                    cancelable: true
                }));
                // Use execCommand for insertion
                document.execCommand('insertText', false, char);
                activeElement.dispatchEvent(new InputEvent('input', {
                    bubbles: true,
                    cancelable: true,
                    inputType: 'insertText',
                    data: char
                }));
                activeElement.dispatchEvent(new KeyboardEvent('keyup', {
                    key: char,
                    bubbles: true,
                    cancelable: true
                }));
                // Delay between characters
                if (delayMs > 0 && i < text.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }
            }
            console.log('TAURI-PLUGIN-MCP: Completed Slate editor typing');
        }
        catch (e) {
            console.error('TAURI-PLUGIN-MCP: Error in Slate editor typing:', e);
            // Fallback approach
            try {
                const editableDiv = element.querySelector('[contenteditable="true"]') || element;
                editableDiv.textContent = text;
                editableDiv.dispatchEvent(new InputEvent('input', { bubbles: true }));
            }
            catch (innerError) {
                console.error('TAURI-PLUGIN-MCP: Fallback for Slate editor failed:', innerError);
            }
        }
    }
    // ========== JS-Based Screenshot Capture ==========
    // This captures the webview's content using the browser's internal rendering,
    // similar to how Playwright captures screenshots via CDP.
    // This approach doesn't require Screen Recording permissions or window focus.
    async function handleCaptureScreenshotRequest(event) {
        console.log('TAURI-PLUGIN-MCP: Received capture-screenshot request');
        try {
            const { quality = 85, maxWidth = 1920 } = event.payload || {};
            // Capture the screenshot using canvas
            const dataUrl = await capturePageAsImage(quality, maxWidth);
            await emit('capture-screenshot-response', {
                success: true,
                data: dataUrl
            });
            console.log('TAURI-PLUGIN-MCP: Emitted capture-screenshot-response');
        }
        catch (error) {
            console.error('TAURI-PLUGIN-MCP: Error capturing screenshot:', error);
            await emit('capture-screenshot-response', {
                success: false,
                error: error instanceof Error ? error.toString() : String(error)
            }).catch(e => console.error('TAURI-PLUGIN-MCP: Error emitting error response', e));
        }
    }
    async function handleIframeRpcRequest(event) {
        console.log('TAURI-PLUGIN-MCP: Received iframe-rpc, payload:', event.payload);
        try {
            const { method, args } = event.payload;
            const iframe = document.getElementById('moss-preview-iframe');
            if (!iframe?.contentWindow) {
                await emit('iframe-rpc-response', { success: false, error: 'No iframe found' });
                return;
            }
            const id = `rpc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            // Set up response listener before sending message
            const responsePromise = new Promise((resolve) => {
                const handler = (e) => {
                    if (e.data?.type === 'moss-rpc-result' && e.data.id === id) {
                        window.removeEventListener('message', handler);
                        resolve(e.data);
                    }
                };
                window.addEventListener('message', handler);
                // Timeout after 5 seconds
                setTimeout(() => {
                    window.removeEventListener('message', handler);
                    resolve({ error: 'Timeout after 5s' });
                }, 5000);
            });
            // Send RPC call to iframe
            iframe.contentWindow.postMessage({ type: 'moss-rpc-call', id, method, args }, '*');
            // Wait for response and emit back to Rust
            const response = await responsePromise;
            await emit('iframe-rpc-response', response);
            console.log('TAURI-PLUGIN-MCP: Emitted iframe-rpc-response');
        }
        catch (error) {
            console.error('TAURI-PLUGIN-MCP: Error handling iframe-rpc request', error);
            await emit('iframe-rpc-response', {
                success: false,
                error: error instanceof Error ? error.toString() : String(error)
            }).catch(e => console.error('TAURI-PLUGIN-MCP: Error emitting error response', e));
        }
    }
    /**
     * Captures the current page as an image using canvas.
     * Uses the html2canvas-like approach but with native browser APIs.
     * Returns a JPEG data URL.
     */
    async function capturePageAsImage(quality, maxWidth) {
        // Get the full document dimensions
        const docElement = document.documentElement;
        const body = document.body;
        Math.max(body.scrollWidth, docElement.scrollWidth, body.offsetWidth, docElement.offsetWidth, body.clientWidth, docElement.clientWidth);
        Math.max(body.scrollHeight, docElement.scrollHeight, body.offsetHeight, docElement.offsetHeight, body.clientHeight, docElement.clientHeight);
        // Use visible viewport dimensions for practical screenshot
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        console.log(`TAURI-PLUGIN-MCP: Capturing viewport ${viewportWidth}x${viewportHeight}`);
        // Create canvas with viewport dimensions
        const canvas = document.createElement('canvas');
        // Scale down if viewport is larger than maxWidth
        const scale = viewportWidth > maxWidth ? maxWidth / viewportWidth : 1;
        canvas.width = Math.round(viewportWidth * scale);
        canvas.height = Math.round(viewportHeight * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get canvas 2d context');
        }
        // Scale the context
        ctx.scale(scale, scale);
        // Fill background
        ctx.fillStyle = getComputedStyle(document.body).backgroundColor || '#ffffff';
        ctx.fillRect(0, 0, viewportWidth, viewportHeight);
        // Try to use the native browser rendering approach
        // This uses an SVG foreignObject to render the DOM to canvas
        try {
            await renderDomToCanvas(ctx, viewportWidth, viewportHeight);
        }
        catch (svgError) {
            console.warn('TAURI-PLUGIN-MCP: SVG foreignObject approach failed, trying fallback:', svgError);
            // Fallback: Render a simplified snapshot manually
            await renderSimplifiedSnapshot(ctx, viewportWidth, viewportHeight);
        }
        // Composite iframe content if present (iframes are stripped from SVG clone
        // to avoid cross-origin SecurityError, so we capture them separately)
        await compositeIframeContent(ctx, quality, maxWidth);
        // Convert to JPEG
        const qualityFraction = quality / 100;
        return canvas.toDataURL('image/jpeg', qualityFraction);
    }
    /**
     * Captures iframe content by sending a postMessage to the iframe-bridge handler.
     * The iframe-bridge (injected by moss's preview server) has a `moss-capture-preview`
     * handler that renders the iframe's own content using canvas and returns a JPEG data URL.
     * Returns null if the iframe doesn't support capture or times out.
     */
    async function captureIframeContent(iframe, quality, maxWidth) {
        if (!iframe.contentWindow)
            return null;
        const captureId = `capture-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                window.removeEventListener('message', handler);
                console.warn('TAURI-PLUGIN-MCP: Iframe capture timed out');
                resolve(null);
            }, 5000);
            function handler(event) {
                if (event.data?.type !== 'moss-capture-preview-result')
                    return;
                if (event.data.id !== captureId)
                    return;
                window.removeEventListener('message', handler);
                clearTimeout(timeout);
                if (event.data.success && event.data.data) {
                    resolve(event.data.data);
                }
                else {
                    console.warn('TAURI-PLUGIN-MCP: Iframe capture failed:', event.data.error);
                    resolve(null);
                }
            }
            window.addEventListener('message', handler);
            iframe.contentWindow.postMessage({
                type: 'moss-capture-preview',
                id: captureId,
                quality,
                maxWidth
            }, '*');
        });
    }
    /**
     * Composites iframe content onto the canvas. Finds iframes with capture support
     * and draws their content at their bounding rect positions.
     */
    async function compositeIframeContent(ctx, quality, maxWidth) {
        const iframes = document.querySelectorAll('iframe');
        for (const iframe of iframes) {
            const rect = iframe.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0)
                continue;
            const dataUrl = await captureIframeContent(iframe, quality, maxWidth);
            if (!dataUrl)
                continue;
            await new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, rect.left, rect.top, rect.width, rect.height);
                    resolve();
                };
                img.onerror = () => resolve();
                img.src = dataUrl;
            });
        }
    }
    /**
     * Renders the DOM to canvas using SVG foreignObject.
     * This is the most accurate approach but may fail on some pages due to CORS.
     */
    async function renderDomToCanvas(ctx, width, height) {
        // Clone the body to avoid modifying the original
        const clone = document.body.cloneNode(true);
        // Inline all computed styles
        await inlineStyles(clone, document.body);
        // Remove script tags (they won't render anyway and can cause issues)
        clone.querySelectorAll('script').forEach(el => el.remove());
        // Remove iframes — cross-origin iframes taint the canvas via SVG foreignObject,
        // causing SecurityError. Iframe content is composited separately.
        clone.querySelectorAll('iframe').forEach(el => el.remove());
        // Serialize to XML
        const serializer = new XMLSerializer();
        const bodyHtml = serializer.serializeToString(clone);
        // Create SVG with foreignObject
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
            <foreignObject width="100%" height="100%">
                <body xmlns="http://www.w3.org/1999/xhtml" style="margin:0;padding:0;">
                    ${bodyHtml}
                </body>
            </foreignObject>
        </svg>
    `;
        // Create image from SVG
        const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    ctx.drawImage(img, 0, 0);
                    URL.revokeObjectURL(url);
                    resolve();
                }
                catch (e) {
                    URL.revokeObjectURL(url);
                    reject(e);
                }
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to render SVG to image'));
            };
            img.src = url;
        });
    }
    /**
     * Inlines computed styles from source to clone element.
     */
    async function inlineStyles(clone, source) {
        const sourceStyle = getComputedStyle(source);
        const importantStyles = [
            'background-color', 'background-image', 'color', 'font-family', 'font-size',
            'font-weight', 'line-height', 'text-align', 'padding', 'margin', 'border',
            'border-radius', 'display', 'flex-direction', 'justify-content', 'align-items',
            'position', 'top', 'left', 'right', 'bottom', 'width', 'height', 'max-width',
            'max-height', 'min-width', 'min-height', 'overflow', 'opacity', 'transform',
            'box-shadow', 'text-shadow'
        ];
        for (const prop of importantStyles) {
            const value = sourceStyle.getPropertyValue(prop);
            if (value) {
                clone.style.setProperty(prop, value);
            }
        }
        // Process children recursively (limit depth for performance)
        const sourceChildren = source.children;
        const cloneChildren = clone.children;
        for (let i = 0; i < Math.min(sourceChildren.length, cloneChildren.length, 500); i++) {
            if (sourceChildren[i] instanceof HTMLElement && cloneChildren[i] instanceof HTMLElement) {
                await inlineStyles(cloneChildren[i], sourceChildren[i]);
            }
        }
    }
    /**
     * Fallback: Renders a simplified snapshot by drawing visible elements.
     */
    async function renderSimplifiedSnapshot(ctx, width, height) {
        // Draw visible images
        const images = document.querySelectorAll('img');
        for (const img of images) {
            if (img.complete && img.naturalWidth > 0) {
                const rect = img.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0 && rect.top < height && rect.left < width) {
                    try {
                        ctx.drawImage(img, rect.left, rect.top, rect.width, rect.height);
                    }
                    catch (e) {
                        // CORS error - skip this image
                    }
                }
            }
        }
        // Draw visible text elements
        const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, li, td, th, label, button');
        ctx.fillStyle = '#000000';
        for (const el of textElements) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0 && rect.top < height && rect.left < width) {
                const style = getComputedStyle(el);
                const fontSize = parseFloat(style.fontSize) || 14;
                ctx.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
                ctx.fillStyle = style.color || '#000000';
                const text = el.textContent?.trim();
                if (text && text.length < 500) {
                    ctx.fillText(text.substring(0, 100), rect.left, rect.top + fontSize);
                }
            }
        }
        // Draw visible canvas elements
        const canvases = document.querySelectorAll('canvas');
        for (const cvs of canvases) {
            const rect = cvs.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0 && rect.top < height && rect.left < width) {
                try {
                    ctx.drawImage(cvs, rect.left, rect.top, rect.width, rect.height);
                }
                catch (e) {
                    // Skip on error
                }
            }
        }
        console.log('TAURI-PLUGIN-MCP: Rendered simplified snapshot');
    }

    /**
     * Auto-initialization entry point for the Tauri MCP plugin.
     *
     * This file is compiled to an IIFE by rollup and injected into every webview
     * via Builder::js_init_script(). It uses window.__TAURI__ globals (available
     * when withGlobalTauri is true in tauri.conf.json).
     */
    setupPluginListeners().catch(err => console.error('TAURI-PLUGIN-MCP: Failed to auto-initialize event listeners:', err));

})();
