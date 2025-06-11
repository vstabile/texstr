import type { Component } from "solid-js";
import { createSignal, For, from, Show } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { nip19 } from "nostr-tools";
import Footer from "../components/Footer";
import { queryStore } from "../stores/queryStore";
import { ArticlesQuery } from "../queries/articles";

const Home: Component = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = createSignal("");
  const [error, setError] = createSignal("");

  const articles = from(queryStore.createQuery(ArticlesQuery));

  const validateAndNavigate = (e: SubmitEvent) => {
    e.preventDefault();
    setError("");

    let naddrToValidate = inputValue();

    // If it's a URL, try to extract naddr from it
    if (naddrToValidate.startsWith("http")) {
      try {
        const url = new URL(naddrToValidate);
        const naddrMatch = url.pathname.match(/naddr[0-9a-zA-Z]+/);
        if (naddrMatch) {
          naddrToValidate = naddrMatch[0];
        } else {
          setError("No naddr found in URL");
          return;
        }
      } catch {
        setError("Invalid URL");
        return;
      }
    }

    try {
      const decoded = nip19.decode(naddrToValidate);
      if (decoded.type !== "naddr") {
        setError("Invalid naddr: wrong type");
        return;
      }
      navigate(`/a/${naddrToValidate}`);
    } catch (err) {
      setError("Invalid naddr format");
    }
  };

  return (
    <div class="min-h-screen bg-white text-black font-serif flex flex-col">
      <div class="flex-1 max-w-[800px] mx-auto px-6 py-16 w-full">
        {/* Header section */}
        <header class="text-center space-y-4">
          <h1 class="text-4xl font-bold tracking-tight">TeXstr</h1>
          <p class="text-xl italic text-gray-600">
            Mathematical Discourse on Nostr
          </p>
        </header>

        {/* Main content */}
        <main class="space-y-8 mt-12">
          <section class="prose prose-lg">
            <h2 class="text-xl font-bold mb-4">Abstract</h2>
            <p class="text-md text-justify leading-normal">
              TeXstr is designed for viewing and sharing mathematical content
              through NIP-23 events with LaTeX support. It provides a seamless
              platform for mathematical discourse, enabling technical
              discussions with properly rendered mathematical notation.
            </p>
          </section>

          {/* naddr input form */}
          <section class="mt-12">
            <form onSubmit={validateAndNavigate} class="space-y-4 sm:space-y-0">
              <div class="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                <div class="flex-1">
                  <input
                    type="text"
                    value={inputValue()}
                    onInput={(e) => setInputValue(e.currentTarget.value)}
                    placeholder="Enter naddr or URL containing naddr"
                    class="w-full h-10 px-4 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                    aria-label="naddr input"
                  />
                  {error() && (
                    <p class="text-red-600 text-sm font-sans mt-1">{error()}</p>
                  )}
                </div>
                <button
                  type="submit"
                  class="h-10 px-6 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors md:self-start"
                >
                  Read
                </button>
              </div>
            </form>
          </section>

          <Show when={articles()}>
            <section class="space-y-4">
              <h2 class="text-2xl font-bold mb-6">Recent Articles</h2>
              <For each={articles()}>
                {(article) => (
                  <article class="border-b border-gray-100 pb-6 last:border-0">
                    <h3 class="text-xl">
                      <A
                        href={article.path}
                        class="text-gray-900 hover:text-gray-600 no-underline hover:underline"
                      >
                        {article.title || "Untitled"}
                      </A>
                    </h3>
                    <div class="text-sm text-gray-500 mb-2 font-serif">
                      {article.author && (
                        <>
                          <span class="font-medium">{article.author}</span>
                          <span class="mx-2">·</span>
                        </>
                      )}
                      <span class="italic">{article.date}</span>
                    </div>
                    <p class="text-gray-600 line-clamp-2">
                      {article.summary}...
                    </p>
                    <div class="flex flex-wrap gap-2 mt-2">
                      {article.tags.map((tag) => (
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                )}
              </For>
            </section>
          </Show>

          {/* <ArticleList articles={articles()} /> */}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
