import { Show } from "solid-js";
import type { Event as NostrEvent } from "nostr-tools";
import { A } from "@solidjs/router";
import { nip19 } from "nostr-tools";
import { getTagValue } from "applesauce-core/helpers";

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

interface Props {
  articles: NostrEvent[] | undefined;
}

export default function ArticleList(props: Props) {
  return (
    <Show when={props.articles && props.articles.length > 0}>
      <section class="mt-16">
        <h2 class="text-2xl font-bold mb-6">Recent Articles</h2>
        <div class="space-y-6">
          {props.articles?.map((article: NostrEvent) => (
            <article class="border-b border-gray-100 pb-6 last:border-0">
              <h3 class="text-xl">
                <A
                  href={`/a/${nip19.naddrEncode({
                    pubkey: article.pubkey,
                    kind: article.kind,
                    identifier: getTagValue(article, "d") || "",
                  })}`}
                  class="text-gray-900 hover:text-gray-600 no-underline hover:underline"
                >
                  {getTagValue(article, "title") || "Untitled"}
                </A>
              </h3>
              <div class="text-sm text-gray-500 mb-2 font-serif italic">
                {formatDate(article.created_at)}
              </div>
              <p class="text-gray-600 line-clamp-2">
                {article.content.substring(0, 200)}...
              </p>
              <div class="flex flex-wrap gap-2 mt-2">
                {article.tags
                  .filter((tag) => tag[0] === "t")
                  .map((tag) => (
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {tag[1]}
                    </span>
                  ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </Show>
  );
}
