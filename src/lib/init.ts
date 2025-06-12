import { isServer } from "solid-js/web";
import { WebSocket } from "ws";

// Ensure WebSocket is available globally on server-side
if (isServer && typeof globalThis.WebSocket === "undefined") {
  (globalThis as any).WebSocket = WebSocket;
}
