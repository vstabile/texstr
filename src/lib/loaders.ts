import {
  ReplaceableLoader,
  SingleEventLoader,
  TimelineLoader,
} from "applesauce-loaders";
import { KINDS, RELAYS, rxNostr } from "./nostr";
import { eventStore } from "../stores/eventStore";
import type { Filter, NostrEvent } from "nostr-tools";
import { map, Observable } from "rxjs";
import { createRxOneshotReq } from "rx-nostr";
import { SCIENTIFIC_TAGS } from "./constants";

function nostrRequest(
  relays: string[],
  filters: Filter[],
  id?: string
): Observable<NostrEvent> {
  const req = createRxOneshotReq({ filters, rxReqId: id });
  return rxNostr
    .use(req, { on: { relays } })
    .pipe(map((packet) => packet.event));
}

export const replaceableLoader = new ReplaceableLoader(nostrRequest, {
  lookupRelays: RELAYS,
});

export const eventLoader = new SingleEventLoader(nostrRequest, {
  extraRelays: RELAYS,
});

export const articlesLoader = new TimelineLoader(
  nostrRequest,
  TimelineLoader.simpleFilterMap(RELAYS, [
    {
      kinds: [KINDS.ARTICLE],
      "#t": SCIENTIFIC_TAGS,
      limit: 10,
    },
  ])
);

replaceableLoader.subscribe((event) => {
  eventStore.add(event);
});

eventLoader.subscribe((event) => {
  eventStore.add(event);
});

articlesLoader.subscribe((event) => {
  eventStore.add(event);
});
