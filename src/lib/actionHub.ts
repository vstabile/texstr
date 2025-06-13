import { ActionHub } from "applesauce-actions";
import { EventStore } from "applesauce-core";
import { EventFactory } from "applesauce-factory";
import { ExtensionSigner } from "applesauce-signers";
import { NostrEvent } from "nostr-tools";
import { pool, RELAYS } from "./nostr";

// Your existing instances
const eventStore = new EventStore();
const signer = new ExtensionSigner();
const eventFactory = new EventFactory({ signer });

function publish(event: NostrEvent) {
  return new Promise<void>((resolve, reject) => {
    console.log("publishing", event);
    pool.publish(RELAYS, event).subscribe({
      next: () => resolve(),
      error: (error) => reject(error),
    });
  });
}

// Create ActionHub without automatic publishing
export const actionHub = new ActionHub(eventStore, eventFactory, publish);
