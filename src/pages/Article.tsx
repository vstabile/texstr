import { useParams } from "@solidjs/router";
import { from, Match, Show, Switch } from "solid-js";
import { Title, Meta } from "@solidjs/meta";
import { queryStore } from "../stores/queryStore";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { A } from "@solidjs/router";
import Footer from "../components/Footer";
import ArticleSkeleton from "../components/ArticleSkeleton";
import { ArticleQuery } from "../queries/article";

export default function Article() {
  const params = useParams();
  const article = from(queryStore.createQuery(ArticleQuery, params.naddr));

  return (
    <div class="min-h-screen bg-white flex flex-col">
      <Switch>
        <Match when={article()}>
          <Title>{article()!.title} - TeXstr</Title>
          <Meta name="description" content={article()!.summary} />
          <Meta property="og:title" content={article()!.title} />
          <Meta property="og:description" content={article()!.summary} />
          <Meta property="og:type" content="article" />
          <Meta property="og:url" content={window.location.href} />
          <Meta property="og:site_name" content="TeXstr" />
          <Meta property="article:author" content={article()!.author} />
          <Meta property="article:published_time" content={article()!.date} />
          <Meta name="twitter:card" content="summary" />
          <Meta name="twitter:title" content={article()!.title} />
          <Meta name="twitter:description" content={article()!.summary} />

          <header class="border-b border-gray-100">
            <div class="max-w-[800px] mx-auto px-6 py-2">
              <A
                href="/"
                class="text-lg font-serif text-gray-900 hover:text-gray-600 transition-colors hover:no-underline"
              >
                TeXstr
              </A>
            </div>
          </header>

          <div class="flex-1 max-w-[800px] mx-auto px-6 py-16 w-full">
            <div class="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-normal prose-h1:text-3xl prose-h1:mb-8 prose-h1:text-center prose-p:text-justify prose-p:leading-relaxed prose-a:text-blue-800 prose-a:no-underline hover:prose-a:underline prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200">
              <h1 class="!mb-4">{article()!.title}</h1>
              <div class="text-center text-lg font-serif mb-4">
                <Show when={article()!.author}>
                  <a
                    href={article()!.authorUrl}
                    class="!text-gray-800 tracking-wide uppercase text-base hover:!text-gray-600"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {article()!.author}
                  </a>
                </Show>
                <div class="text-sm text-gray-500 mt-2 italic">
                  {article()!.date}
                </div>
              </div>
              <MarkdownRenderer content={article()?.content || ""} />
            </div>
          </div>
        </Match>
        <Match when={!article()}>
          <ArticleSkeleton />
        </Match>
      </Switch>
      <Footer />
    </div>
  );
}
