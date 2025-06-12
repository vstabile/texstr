import type { Model } from "applesauce-core";
import { map, of, startWith, switchMap, scan } from "rxjs";
import { formatDate, profileName } from "../lib/utils";
import { nip19, type NostrEvent } from "nostr-tools";
import { getTagValue } from "applesauce-core/helpers";
import { timelineLoader, addressLoader } from "../lib/loaders";
import { KINDS } from "../lib/nostr";
import { SCIENTIFIC_TAGS } from "../lib/constants";

export type Articles = {
  title?: string;
  author?: string;
  authorUrl?: string;
  date: string;
  summary: string;
  tags: string[];
  path: string;
}[];

function presenter(articleEvent: NostrEvent, profileEvent?: NostrEvent) {
  return {
    title: getTagValue(articleEvent, "title"),
    author: profileEvent ? profileName(profileEvent) : undefined,
    authorUrl: `https://njump.me/${nip19.npubEncode(articleEvent.pubkey)}`,
    date: formatDate(articleEvent.created_at),
    summary:
      getTagValue(articleEvent, "summary") ||
      articleEvent.content.substring(0, 200),
    tags: articleEvent.tags
      .filter((tag) => tag[0] === "t")
      .map((tag) => tag[1]),
    path: `/a/${nip19.naddrEncode({
      pubkey: articleEvent.pubkey,
      kind: articleEvent.kind,
      identifier: getTagValue(articleEvent, "d") || "",
    })}`,
  };
}

export function ArticlesModel(): Model<Articles | []> {
  // Load articles timeline
  timelineLoader().subscribe();

  return (store) =>
    store
      .timeline({
        kinds: [KINDS.ARTICLE],
        "#t": SCIENTIFIC_TAGS,
      })
      .pipe(
        switchMap((articles?: NostrEvent[]) => {
          if (!articles) return of([]);

          articles.forEach((article) => {
            addressLoader({
              pubkey: article.pubkey,
              kind: KINDS.PROFILE,
            }).subscribe();
          });

          return store
            .filters({
              kinds: [KINDS.PROFILE],
              authors: articles.map((a) => a.pubkey),
            })
            .pipe(
              scan(
                (profiles: NostrEvent[], profile: NostrEvent) => [
                  ...profiles,
                  profile,
                ],
                []
              ),
              map((profiles: NostrEvent[]) => {
                const profileMap = new Map(profiles.map((p: NostrEvent) => [p.pubkey, p]));

                return articles.map((article) =>
                  presenter(article, profileMap.get(article.pubkey))
                );
              }),
              startWith(articles.map((article) => presenter(article)))
            );
        })
      );
}
