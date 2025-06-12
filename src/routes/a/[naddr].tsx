import { Suspense } from "solid-js";
import { useParams } from "@solidjs/router";
import { from, Show } from "solid-js";
import { Title, Meta } from "@solidjs/meta";
import { eventStore } from "../../stores/eventStore";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import ArticleSkeleton from "../../components/ArticleSkeleton";
import { ArticleModel } from "../../models/article";
import { APP_NAME, BASE_URL } from "../../config/meta";

export default function Article() {
  const params = useParams();
  const article = from(eventStore.model(ArticleModel, params.naddr));

  return (
    <>
      <Show when={article()}>
        <Title>{article()?.title || APP_NAME}</Title>
        <Meta name="description" content={article()?.summary} />
        <Meta property="og:title" content={article()?.title} />
        <Meta property="og:description" content={article()?.summary} />
        <Meta property="og:type" content="article" />
        <Meta property="og:url" content={`${BASE_URL}/a/${params.naddr}`} />
        <Meta property="og:site_name" content={APP_NAME} />
        <Meta property="og:image" content="/texstr.png" />
        <Meta property="article:author" content={article()?.author} />
        <Meta
          property="article:published_time"
          content={article()?.publishedTime}
        />
        <Meta name="twitter:card" content="summary" />
        <Meta name="twitter:title" content={article()?.title} />
        <Meta name="twitter:description" content={article()?.summary} />
        <Meta name="twitter:image" content="/texstr.png" />
      </Show>

      <Suspense fallback={<ArticleSkeleton />}>
        <div class="flex-1 max-w-[800px] mx-auto px-6 py-16 w-full">
          <div class="prose text-lg prose-sm max-w-none dark:prose-invert prose-headings:font-serif prose-headings:font-normal prose-h1:text-3xl prose-h1:mb-8 prose-h1:text-center prose-h2:mt-8 prose-h2:mb-4 prose-p:text-justify prose-p:leading-normal prose-a:text-blue-800 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-pre:bg-gray-50 dark:prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700">
            <h1 class="!mb-6">{article()?.title}</h1>
            <div class="text-center text-lg font-serif mb-10">
              <Show when={article()?.author}>
                <a
                  href={article()?.authorUrl}
                  class="!text-gray-800 dark:!text-gray-200 tracking-wide !no-underline uppercase text-base hover:!text-gray-600 dark:hover:!text-gray-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {article()?.author}
                </a>
              </Show>
              <div class="text-sm text-gray-500 dark:text-gray-400 italic">
                {article()?.formatedDate}
              </div>
            </div>
            <MarkdownRenderer content={article()?.content || ""} />
          </div>
        </div>
      </Suspense>
    </>
  );
}
