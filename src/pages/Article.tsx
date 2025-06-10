import { useParams } from "@solidjs/router";
import { from, onMount } from "solid-js";
import { replaceableLoader } from "../lib/loaders";
import { RELAYS } from "../lib/nostr";
import { nip19 } from "nostr-tools";
import type { AddressPointer } from "nostr-tools/nip19";
import { queryStore } from "../stores/queryStore";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { getTagValue } from "applesauce-core/helpers";
import { A } from "@solidjs/router";
import Footer from "../components/Footer";
import ArticleSkeleton from "../components/ArticleSkeleton";

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function Article() {
  const params = useParams();

  const decoded = nip19.decode(params.naddr);
  const data = decoded.data as AddressPointer;

  const { pubkey, identifier, kind, relays } = data;

  onMount(() => {
    replaceableLoader.next({
      pubkey,
      kind,
      identifier,
      relays: [...RELAYS, ...(relays || [])],
    });
  });

  const article = from(queryStore.replaceable(kind, pubkey, identifier));

  return (
    <div class="min-h-screen bg-white flex flex-col">
      <header class="border-b border-gray-100">
        <div class="max-w-[800px] mx-auto px-8 py-2">
          <A
            href="/"
            class="text-lg font-serif text-gray-900 hover:text-gray-600 transition-colors hover:no-underline"
          >
            TeXstr
          </A>
        </div>
      </header>
      <div class="flex-1 max-w-[800px] mx-auto px-8 py-16 w-full">
        {article() ? (
          <div class="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-normal prose-h1:text-3xl prose-h1:mb-8 prose-h1:text-center prose-p:text-justify prose-p:leading-relaxed prose-a:text-blue-800 prose-a:no-underline hover:prose-a:underline prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200">
            <h1>{getTagValue(article()!, "title")}</h1>
            <div class="text-center text-md text-gray-500 -mt-6 mb-8 font-serif italic">
              {formatDate(article()!.created_at)}
            </div>
            <MarkdownRenderer content={article()?.content || ""} />
          </div>
        ) : (
          <ArticleSkeleton />
        )}
      </div>

      <Footer />
    </div>
  );
}
