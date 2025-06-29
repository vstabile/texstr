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
  firstValueFrom,
} from "rxjs";
import { formatDate, profileName } from "../lib/utils";
import { nip19, type NostrEvent } from "nostr-tools";
import { getTagValue, mergeRelaySets } from "applesauce-core/helpers";
import type { AddressPointer } from "nostr-tools/nip19";
import { addressLoader, otsLoader } from "../lib/loaders";
import { KINDS, RELAYS } from "../lib/nostr";
import { isServer } from "solid-js/web";

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
    // Create a promise for the initial profile load
    const profilePromise = isServer
      ? firstValueFrom(
          addressLoader({
            pubkey,
            kind: KINDS.PROFILE,
            relays: RELAYS,
          })
        ).catch(() => undefined)
      : Promise.resolve(undefined);

    // Promise for the initial article load
    const articlePromise = isServer
      ? firstValueFrom(
          addressLoader({
            pubkey,
            kind,
            identifier,
            relays: mergeRelaySets(RELAYS, relays),
          })
        ).catch(() => undefined)
      : Promise.resolve(undefined);

    // Subscribe to loaders for client-side updates
    if (!isServer) {
      const loaders = merge(
        addressLoader({
          pubkey,
          kind,
          identifier,
          relays: mergeRelaySets(RELAYS, relays),
        }),
        addressLoader({
          pubkey: pubkey,
          kind: KINDS.PROFILE,
        })
      ).pipe(ignoreElements(), take(2));

      loaders.subscribe();
    }

    return store.replaceable(kind, pubkey, identifier).pipe(
      switchMap(async (article?: NostrEvent) => {
        if (!article) {
          // Try to get the article from the promise if we're on the server
          article = isServer ? await articlePromise : undefined;
          if (!article) return EMPTY;
        }

        // Get initial profile from promise if we're on the server
        let initialProfile: NostrEvent | undefined;
        if (isServer) {
          initialProfile = await profilePromise;
        }

        // Get initial timestamp if we're on the server
        let initialTimestamp: NostrEvent | undefined;
        if (isServer) {
          try {
            initialTimestamp = await firstValueFrom(
              store.filters({
                kinds: [KINDS.TIMESTAMP],
                "#e": [article.id],
              })
            );
          } catch {
            initialTimestamp = undefined;
          }
        }

        // Start fetching profile and timestamp
        const profile$ = store
          .replaceable(KINDS.PROFILE, pubkey)
          .pipe(startWith(initialProfile));
        const timestamp$ = store
          .filters({
            kinds: [KINDS.TIMESTAMP],
            "#e": [article.id],
          })
          .pipe(startWith(initialTimestamp));

        // Compute the presenter from the article, profile, timestamp
        return combineLatest([of(article), profile$, timestamp$]).pipe(
          map(([article, profile, timestamp]) =>
            presenter(article, profile, timestamp)
          )
        );
      }),
      switchMap((observable) => (observable === EMPTY ? EMPTY : observable)),
      shareReplay(1)
    );
  };
}
