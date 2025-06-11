import type { Query } from "applesauce-core";
import { map, of, startWith, switchMap } from "rxjs";
import { formatDate, profileName } from "../lib/utils";
import { nip19, type NostrEvent } from "nostr-tools";
import { getTagValue } from "applesauce-core/helpers";
import type { AddressPointer } from "nostr-tools/nip19";
import { replaceableLoader } from "../lib/loaders";
import { KINDS, RELAYS } from "../lib/nostr";

export type Article = {
  title?: string;
  author?: string;
  authorUrl?: string;
  date: string;
  content: string;
  summary: string;
};

function presenter(articleEvent: NostrEvent, profileEvent?: NostrEvent) {
  return {
    title: getTagValue(articleEvent, "title"),
    author: profileEvent ? profileName(profileEvent) : undefined,
    authorUrl: `https://njump.me/${nip19.npubEncode(articleEvent.pubkey)}`,
    date: formatDate(articleEvent.created_at),
    content: articleEvent.content,
    summary:
      getTagValue(articleEvent, "summary") ||
      articleEvent.content.substring(0, 200),
  };
}

export function ArticleQuery(naddr: string): Query<Article | undefined> {
  const decoded = nip19.decode(naddr);
  const data = decoded.data as AddressPointer;

  const { pubkey, identifier, kind, relays } = data;

  replaceableLoader.next({
    pubkey,
    kind,
    identifier,
    relays: [...RELAYS, ...(relays || [])],
  });

  replaceableLoader.next({
    pubkey: pubkey,
    kind: 0,
  });

  return (store) =>
    store.replaceable(kind, pubkey, identifier).pipe(
      switchMap((article?: NostrEvent) => {
        if (!article) return of(undefined);

        return store.replaceable(KINDS.PROFILE, pubkey).pipe(
          map((profile?: NostrEvent) => presenter(article, profile)),
          startWith(presenter(article))
        );
      })
    );
}
