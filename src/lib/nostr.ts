import { RelayPool } from "applesauce-relay";
import { isServer } from "solid-js/web";
import { WebSocket } from "ws";

// Provide WebSocket for server-side
if (isServer) {
  (global as any).WebSocket = WebSocket;
}

export const pool = new RelayPool()

export const RELAYS = [
  "wss://relay.primal.net",
  "wss://relay.damus.io",
  "wss://nostr.wine",
  "wss://relay.nostr.band",
  "wss://relay.vertexlab.io",
];

export const KINDS = {
  ARTICLE: 30023,
  PROFILE: 0,
};