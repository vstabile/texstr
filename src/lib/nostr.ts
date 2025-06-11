import { RelayPool } from "applesauce-relay";

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
