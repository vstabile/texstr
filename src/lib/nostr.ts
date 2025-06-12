import { isServer } from "solid-js/web";
import { createRxNostr, noopVerifier } from "rx-nostr";
import { WebSocket } from "ws";

// Provide WebSocket for server-side
if (isServer) {
  (global as any).WebSocket = WebSocket;
}

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

export const rxNostr = createRxNostr({
  // skip verification here because we are going to verify events at the event store
  skipVerify: true,
  verifier: noopVerifier,
});

// Set default relays
rxNostr.setDefaultRelays(RELAYS);
