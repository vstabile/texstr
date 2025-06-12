import { createAddressLoader } from "applesauce-loaders/loaders/address-loader";
import { createEventLoader } from "applesauce-loaders/loaders/event-loader";
import { createTimelineLoader } from "applesauce-loaders/loaders/timeline-loader";
import { eventStore } from "../stores/eventStore";
import { SCIENTIFIC_TAGS } from "./constants";
import { KINDS, pool, RELAYS } from "./nostr";

// Create functional loaders for v2
export const addressLoader = createAddressLoader(pool, {
  eventStore,
  lookupRelays: RELAYS
});

export const eventLoader = createEventLoader(pool, {
  eventStore,
  extraRelays: RELAYS
});

export const timelineLoader = createTimelineLoader(
  pool,
  RELAYS,
  {
    kinds: [KINDS.ARTICLE],
    "#t": SCIENTIFIC_TAGS,
    limit: 10,
  },
  { eventStore }
);
