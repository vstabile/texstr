import { Action } from "applesauce-actions";
import { NostrEvent } from "nostr-tools";
import { KINDS } from "~/lib/nostr";

export function Timestamp(nostrEvent: NostrEvent, proof: string): Action {
  return async function* ({ factory }) {
    const created_at = Math.floor(Date.now() / 1000);

    const draft = {
      kind: KINDS.TIMESTAMP,
      content: proof,
      tags: [
        ["e", nostrEvent.id],
        ["alt", "opentimestamps attestation"],
      ],
      created_at,
    };

    yield await factory.sign(draft);
  };
}
