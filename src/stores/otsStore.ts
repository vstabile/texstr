import { createStore } from "solid-js/store";
import {
  type Timestamp,
  submit,
  write,
  upgrade,
  canUpgrade,
} from "@lacrypta/typescript-opentimestamps";
import {
  serializeTimestamp,
  deserializeTimestamp,
  bytesToBase64,
} from "~/lib/ots";
import { sha256 } from "@noble/hashes/sha256";
import { randomBytes, hexToBytes } from "@noble/hashes/utils";
import { storage } from "~/lib/storage";

interface OTSStore {
  partialProofs: Record<string, Timestamp>; // digest -> Timestamp object
  fullProofs: Record<string, Timestamp>; // digest -> Timestamp object
}

// Load from storage
const loadFromStorage = (): OTSStore => {
  try {
    const stored = storage.getItem("ots-store");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert stored JSON back to Timestamp objects with proper Uint8Array handling
      const partialProofs: Record<string, Timestamp> = {};
      const fullProofs: Record<string, Timestamp> = {};

      if (parsed.partialProofs) {
        Object.entries(parsed.partialProofs).forEach(
          ([digest, serializedTimestamp]) => {
            partialProofs[digest] = deserializeTimestamp(serializedTimestamp);
          }
        );
      }

      if (parsed.fullProofs) {
        Object.entries(parsed.fullProofs).forEach(
          ([digest, serializedTimestamp]) => {
            fullProofs[digest] = deserializeTimestamp(serializedTimestamp);
          }
        );
      }

      return { partialProofs, fullProofs };
    }
  } catch (error) {
    console.error("Failed to load OTS store from storage:", error);
  }
  return { partialProofs: {}, fullProofs: {} };
};

const [otsStore, setOtsStore] = createStore<OTSStore>(loadFromStorage());

// Save to storage whenever store changes
const saveToStorage = (newStore: OTSStore) => {
  try {
    // Serialize Timestamp objects before storing
    const serializedPartialProofs: Record<string, any> = {};
    const serializedFullProofs: Record<string, any> = {};

    Object.entries(newStore.partialProofs).forEach(([digest, timestamp]) => {
      serializedPartialProofs[digest] = serializeTimestamp(timestamp);
    });

    Object.entries(newStore.fullProofs).forEach(([digest, timestamp]) => {
      serializedFullProofs[digest] = serializeTimestamp(timestamp);
    });

    const serializedStore = {
      partialProofs: serializedPartialProofs,
      fullProofs: serializedFullProofs,
    };

    storage.setItem("ots-store", JSON.stringify(serializedStore));
  } catch (error) {
    console.error("Failed to save OTS store to storage:", error);
  }
};

// Create a partial OTS proof for a given digest
export async function createPartialOTS(
  digest: string
): Promise<Timestamp | null> {
  try {
    const digestBytes = hexToBytes(digest);

    const fudge: Uint8Array = sha256(
      Uint8Array.of(...digestBytes, ...randomBytes(16))
    );
    const { timestamp, errors } = await submit("sha256", digestBytes, fudge, [
      new URL("https://alice.btc.calendar.opentimestamps.org"),
    ]);

    if (errors.length > 0) {
      console.error("Failed to create partial OTS:", errors);
      return null;
    }

    // Store the partial proof as Timestamp object
    const newStore = {
      ...otsStore,
      partialProofs: {
        ...otsStore.partialProofs,
        [digest]: timestamp,
      },
    };
    setOtsStore(newStore);
    saveToStorage(newStore);

    return timestamp;
  } catch (error) {
    console.error("Failed to create partial OTS:", error);
    return null;
  }
}

// Try to upgrade a partial OTS proof to a full proof
export async function upgradeOTS(
  digest: string,
  can?: boolean
): Promise<Timestamp | null> {
  const partialProof = otsStore.partialProofs[digest];
  if (!partialProof) {
    return null;
  }

  // Check if the timestamp can be upgraded
  if (!can && !canUpgrade(partialProof)) {
    console.log("Timestamp cannot be upgraded yet");
    return null;
  }

  // Try to upgrade via calendar
  const { timestamp, errors } = await upgrade(partialProof);

  if (errors.length > 0) {
    throw new Error("Failed to upgrade OTS:" + errors.join(", "));
  }

  // Store the full proof and remove the partial
  const newPartialProofs = { ...otsStore.partialProofs };
  delete newPartialProofs[digest];

  const newStore = {
    ...otsStore,
    partialProofs: newPartialProofs,
    fullProofs: { ...otsStore.fullProofs, [digest]: timestamp },
  };
  setOtsStore(newStore);
  saveToStorage(newStore);

  return timestamp;
}

export function getPartialProof(digest: string) {
  return otsStore.partialProofs[digest];
}

// Get existing proof (partial or full) for a digest
export function getExistingProof(digest: string): string | null {
  const fullProof = otsStore.fullProofs[digest];
  const partialProof = otsStore.partialProofs[digest];

  if (fullProof) {
    const otsBytes = write(fullProof);
    return bytesToBase64(otsBytes);
  }

  if (partialProof) {
    const otsBytes = write(partialProof);
    return bytesToBase64(otsBytes);
  }

  return null;
}

// Check if a digest has a full proof
export function hasFullProof(digest: string): boolean {
  return !!otsStore.fullProofs[digest];
}

// Get the raw Timestamp object for a digest
export function getTimestampObject(digest: string): Timestamp | null {
  return otsStore.fullProofs[digest] || otsStore.partialProofs[digest] || null;
}

// Add this new function to remove a full proof
export function removeFullProof(digest: string): void {
  const newFullProofs = { ...otsStore.fullProofs };
  delete newFullProofs[digest];

  const newStore = {
    ...otsStore,
    fullProofs: newFullProofs,
  };
  setOtsStore(newStore);
  saveToStorage(newStore);
}

export { otsStore };
