import type { Model } from "applesauce-core";
import {
  ignoreElements,
  map,
  merge,
  startWith,
  switchMap,
  EMPTY,
  take,
  combineLatest,
  of,
  shareReplay,
} from "rxjs";
import { formatDate, profileName } from "../lib/utils";
import { nip19, type NostrEvent } from "nostr-tools";
import { getTagValue, mergeRelaySets } from "applesauce-core/helpers";
import type { AddressPointer } from "nostr-tools/nip19";
import { addressLoader, otsLoader } from "../lib/loaders";
import { KINDS, RELAYS } from "../lib/nostr";

export type Article = {
  id: string;
  title?: string;
  author?: string;
  authorUrl?: string;
  formatedDate: string;
  publishedAt: string;
  timestampedAt?: string;
  content: string;
  summary: string;
  ots?: string;
  event: NostrEvent;
};

function presenter(
  articleEvent: NostrEvent,
  profileEvent?: NostrEvent,
  otsEvent?: NostrEvent
) {
  return {
    id: articleEvent.id,
    title: getTagValue(articleEvent, "title"),
    author: profileEvent ? profileName(profileEvent) : undefined,
    authorUrl: `https://njump.me/${nip19.npubEncode(articleEvent.pubkey)}`,
    formatedDate: formatDate(articleEvent.created_at),
    publishedAt: new Date(articleEvent.created_at * 1000).toISOString(),
    timestampedAt: undefined,
    content: articleEvent.content,
    summary:
      getTagValue(articleEvent, "summary") ||
      articleEvent.content.substring(0, 200),
    ots: otsEvent ? otsEvent.content : undefined,
    event: articleEvent,
  };
}

export function ArticleModel(naddr: string): Model<Article | undefined> {
  const decoded = nip19.decode(naddr);
  const data = decoded.data as AddressPointer;

  const { pubkey, identifier, kind, relays } = data;

  return (store) => {
    const loaders = merge(
      addressLoader({
        pubkey,
        kind,
        identifier,
        relays: mergeRelaySets(RELAYS, relays),
      }),
      addressLoader({
        pubkey: pubkey,
        kind: 0,
      })
    ).pipe(ignoreElements(), take(2));

    loaders.subscribe();

    return store.replaceable(kind, pubkey, identifier).pipe(
      switchMap((article?: NostrEvent) => {
        if (!article) return EMPTY;

        // Load Opentimestamps events
        otsLoader(article.id).subscribe();
        // otsLoader().subscribe();

        // Start fetching profile and timestamp
        const profile$ = store
          .replaceable(KINDS.PROFILE, pubkey)
          .pipe(startWith(undefined));
        const timestamp$ = store
          .filters({
            kinds: [KINDS.TIMESTAMP],
            "#e": [article.id],
          })
          .pipe(startWith(undefined));

        // Compute the presenter from the article, profile, timestamp
        return combineLatest([of(article), profile$, timestamp$]).pipe(
          map(([article, profile, timestamp]) =>
            presenter(article, profile, timestamp)
          )
        );
      }),
      shareReplay(1)
    );
  };
}
