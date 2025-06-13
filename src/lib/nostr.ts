import { RelayPool } from "applesauce-relay";

export const pool = new RelayPool();

export const RELAYS = [
  "wss://relay.primal.net",
  "wss://relay.damus.io",
  "wss://nostr.wine",
  "wss://relay.nostr.band",
];

export const KINDS = {
  ARTICLE: 30023,
  PROFILE: 0,
  TIMESTAMP: 1040,
};
