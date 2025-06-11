import { useParams } from "@solidjs/router";
import { from, Match, Show, Switch } from "solid-js";
import { Title, Meta } from "@solidjs/meta";
import { queryStore } from "../stores/queryStore";
import MarkdownRenderer from "../components/MarkdownRenderer";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ArticleSkeleton from "../components/ArticleSkeleton";
import { ArticleQuery } from "../queries/article";
import { APP_NAME } from "../config/meta";

export default function Article() {
  const params = useParams();
  const article = from(queryStore.createQuery(ArticleQuery, params.naddr));

  return (
    <div class="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <Switch>
        <Match when={article()}>
          <Title>
            {article()!.title} - {APP_NAME}
          </Title>
          <Meta name="description" content={article()!.summary} />
          <Meta property="og:title" content={article()!.title} />
          <Meta property="og:description" content={article()!.summary} />
          <Meta property="og:type" content="article" />
          <Meta property="og:url" content={window.location.href} />
          <Meta property="og:site_name" content={APP_NAME} />
          <Meta property="article:author" content={article()!.author} />
          <Meta property="article:published_time" content={article()!.date} />
          <Meta name="twitter:card" content="summary" />
          <Meta name="twitter:title" content={article()!.title} />
          <Meta name="twitter:description" content={article()!.summary} />

          <Header />

          <div class="flex-1 max-w-[800px] mx-auto px-6 py-16 w-full">
            <div class="prose prose-md max-w-none dark:prose-invert prose-headings:font-serif prose-headings:font-normal prose-h1:text-3xl prose-h1:mb-8 prose-h1:text-center prose-p:text-justify prose-p:leading-normal prose-a:text-blue-800 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-pre:bg-gray-50 dark:prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700">
              <h1 class="!mb-4">{article()!.title}</h1>
              <div class="text-center text-sm font-serif mb-10">
                <Show when={article()!.author}>
                  <a
                    href={article()!.authorUrl}
                    class="!text-gray-800 dark:!text-gray-200 tracking-wide uppercase text-base hover:!text-gray-600 dark:hover:!text-gray-400"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {article()!.author}
                  </a>
                </Show>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                  {article()!.date}
                </div>
              </div>
              <MarkdownRenderer content={article()?.content || ""} />
            </div>
          </div>
        </Match>
        <Match when={!article()}>
          <Header />
          <ArticleSkeleton />
        </Match>
      </Switch>
      <Footer />
    </div>
  );
}
