import {
  type Timestamp,
  type Tree,
  type Leaf,
  type Op,
  type FileHash,
  type MergeSet,
  type MergeMap,
  write,
} from "@lacrypta/typescript-opentimestamps";

// Helper function to convert Uint8Array to base64
export function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

// Helper function to convert base64 to Uint8Array
export function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Serialize Uint8Array to base64 string
export function serializeUint8Array(bytes: Uint8Array): string {
  return bytesToBase64(bytes);
}

// Deserialize base64 string to Uint8Array
export function deserializeUint8Array(base64: string): Uint8Array {
  return base64ToBytes(base64);
}

// Convert Timestamp to base64 string for storage in Nostr events
export function timestampToBase64(timestamp: Timestamp): string {
  const otsBytes = write(timestamp);
  return bytesToBase64(otsBytes);
}

// Serialize FileHash object
export function serializeFileHash(fileHash: FileHash): any {
  return {
    algorithm: fileHash.algorithm,
    value: serializeUint8Array(fileHash.value),
  };
}

// Deserialize FileHash object
export function deserializeFileHash(serialized: any): FileHash {
  return {
    algorithm: serialized.algorithm,
    value: deserializeUint8Array(serialized.value),
  } as FileHash;
}

// Serialize Leaf object
export function serializeLeaf(leaf: Leaf): any {
  const serialized: any = { type: leaf.type };

  switch (leaf.type) {
    case "bitcoin":
    case "litecoin":
    case "ethereum":
      serialized.height = leaf.height;
      break;
    case "pending":
      serialized.url = leaf.url.toString();
      break;
    case "unknown":
      serialized.header = serializeUint8Array(leaf.header);
      serialized.payload = serializeUint8Array(leaf.payload);
      break;
  }

  return serialized;
}

// Deserialize Leaf object
export function deserializeLeaf(serialized: any): Leaf {
  switch (serialized.type) {
    case "bitcoin":
      return { type: "bitcoin", height: serialized.height };
    case "litecoin":
      return { type: "litecoin", height: serialized.height };
    case "ethereum":
      return { type: "ethereum", height: serialized.height };
    case "pending":
      return { type: "pending", url: new URL(serialized.url) };
    case "unknown":
      return {
        type: "unknown",
        header: deserializeUint8Array(serialized.header),
        payload: deserializeUint8Array(serialized.payload),
      };
    default:
      throw new Error(`Unknown leaf type: ${serialized.type}`);
  }
}

// Serialize Op object
export function serializeOp(op: Op): any {
  const serialized: any = { type: op.type };

  if (op.type === "append" || op.type === "prepend") {
    serialized.operand = serializeUint8Array(op.operand);
  }

  return serialized;
}

// Deserialize Op object
export function deserializeOp(serialized: any): Op {
  if (serialized.type === "append") {
    return {
      type: "append",
      operand: deserializeUint8Array(serialized.operand),
    };
  } else if (serialized.type === "prepend") {
    return {
      type: "prepend",
      operand: deserializeUint8Array(serialized.operand),
    };
  } else {
    // For operations without operands (sha1, ripemd160, sha256, keccak256, reverse, hexlify)
    return { type: serialized.type } as Op;
  }
}

// Serialize MergeSet
export function serializeMergeSet<T>(
  mergeSet: MergeSet<T>,
  itemSerializer: (item: T) => any
): any {
  return {
    type: "MergeSet",
    values: mergeSet.values().map(itemSerializer),
  };
}

// Deserialize MergeSet
export function deserializeMergeSet<T>(
  serialized: any,
  itemDeserializer: (item: any) => T
): MergeSet<T> {
  // Create a simple implementation of MergeSet for deserialization
  const values = serialized.values.map(itemDeserializer);
  const mergeSet: MergeSet<T> = {
    size: () => values.length,
    values: () => [...values],
    remove: function (value: T) {
      const index = values.indexOf(value);
      if (index > -1) values.splice(index, 1);
      return this;
    },
    add: function (value: T) {
      if (!values.includes(value)) values.push(value);
      return this;
    },
    incorporate: function (other: MergeSet<T>) {
      other.values().forEach((value) => {
        if (!values.includes(value)) values.push(value);
      });
      return this;
    },
  };
  return mergeSet;
}

// Serialize MergeMap
export function serializeMergeMap<K, V>(
  mergeMap: MergeMap<K, V>,
  keySerializer: (key: K) => any,
  valueSerializer: (value: V) => any
): any {
  return {
    type: "MergeMap",
    entries: mergeMap
      .entries()
      .map(([key, value]) => [keySerializer(key), valueSerializer(value)]),
  };
}

// Deserialize MergeMap
export function deserializeMergeMap<K, V>(
  serialized: any,
  keyDeserializer: (key: any) => K,
  valueDeserializer: (value: any) => V
): MergeMap<K, V> {
  // Create a simple implementation of MergeMap for deserialization
  const entries = serialized.entries.map(([key, value]: [any, any]) => [
    keyDeserializer(key),
    valueDeserializer(value),
  ]);
  const mergeMap: MergeMap<K, V> = {
    size: () => entries.length,
    keys: () => entries.map(([key]: [K, V]) => key),
    values: () => entries.map(([, value]: [K, V]) => value),
    entries: () => [...entries],
    remove: function (key: K) {
      const index = entries.findIndex(([k]: [K, V]) => k === key);
      if (index > -1) entries.splice(index, 1);
      return this;
    },
    add: function (key: K, value: V) {
      const index = entries.findIndex(([k]: [K, V]) => k === key);
      if (index > -1) {
        entries[index] = [key, value];
      } else {
        entries.push([key, value]);
      }
      return this;
    },
    incorporate: function (other: MergeMap<K, V>) {
      other.entries().forEach(([key, value]: [K, V]) => {
        const index = entries.findIndex(([k]: [K, V]) => k === key);
        if (index > -1) {
          entries[index] = [key, value];
        } else {
          entries.push([key, value]);
        }
      });
      return this;
    },
  };
  return mergeMap;
}

// Serialize Tree object
export function serializeTree(tree: Tree): any {
  return {
    leaves: serializeMergeSet(tree.leaves, serializeLeaf),
    edges: serializeMergeMap(tree.edges, serializeOp, serializeTree),
  };
}

// Deserialize Tree object
export function deserializeTree(serialized: any): Tree {
  return {
    leaves: deserializeMergeSet(serialized.leaves, deserializeLeaf),
    edges: deserializeMergeMap(
      serialized.edges,
      deserializeOp,
      deserializeTree
    ),
  };
}

// Serialize Timestamp object
export function serializeTimestamp(timestamp: Timestamp): any {
  return {
    version: timestamp.version,
    fileHash: serializeFileHash(timestamp.fileHash),
    tree: serializeTree(timestamp.tree),
  };
}

// Deserialize Timestamp object
export function deserializeTimestamp(serialized: any): Timestamp {
  return {
    version: serialized.version,
    fileHash: deserializeFileHash(serialized.fileHash),
    tree: deserializeTree(serialized.tree),
  };
}
