import { EventStore } from "applesauce-core";
import { verifyEvent } from "nostr-tools";

export const eventStore = new EventStore();

// Check signatures of events when added to store
eventStore.verifyEvent = verifyEvent;
