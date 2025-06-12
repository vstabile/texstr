import type { Model } from "applesauce-core";
import {
  ignoreElements,
  map,
  merge,
  mergeWith,
  startWith,
  switchMap,
  EMPTY,
} from "rxjs";
import { formatDate, profileName } from "../lib/utils";
import { nip19, type NostrEvent } from "nostr-tools";
import { getTagValue, mergeRelaySets } from "applesauce-core/helpers";
import type { AddressPointer } from "nostr-tools/nip19";
import { addressLoader } from "../lib/loaders";
import { KINDS, RELAYS } from "../lib/nostr";

export type Article = {
  title?: string;
  author?: string;
  authorUrl?: string;
  formatedDate: string;
  publishedTime: string;
  content: string;
  summary: string;
};

function presenter(articleEvent: NostrEvent, profileEvent?: NostrEvent) {
  return {
    title: getTagValue(articleEvent, "title"),
    author: profileEvent ? profileName(profileEvent) : undefined,
    authorUrl: `https://njump.me/${nip19.npubEncode(articleEvent.pubkey)}`,
    formatedDate: formatDate(articleEvent.created_at),
    publishedTime: new Date(articleEvent.created_at * 1000).toISOString(),
    content: articleEvent.content,
    summary:
      getTagValue(articleEvent, "summary") ||
      articleEvent.content.substring(0, 200),
  };
}

export function ArticleModel(naddr: string): Model<Article | undefined> {
  const decoded = nip19.decode(naddr);
  const data = decoded.data as AddressPointer;

  const { pubkey, identifier, kind, relays } = data;

  return (store) => {
    const result = store.replaceable(kind, pubkey, identifier).pipe(
      switchMap((article?: NostrEvent) => {
        if (!article) return EMPTY;

        return store.replaceable(KINDS.PROFILE, pubkey).pipe(
          map((profile?: NostrEvent) => presenter(article, profile)),
          startWith(presenter(article))
        );
      })
    );

    return merge(
      // Load the article
      addressLoader({
        pubkey,
        kind,
        identifier,
        relays: mergeRelaySets(RELAYS, relays),
      }),
      // Load the profile
      addressLoader({
        pubkey: pubkey,
        kind: 0,
      })
    ).pipe(
      // Ignore events from loaders since they get added to the store
      ignoreElements(),
      // Return the result of the store
      mergeWith(result)
    );
  };
}
