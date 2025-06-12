import type { Component } from "solid-js";
import { createSignal, For, from, Show } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { nip19 } from "nostr-tools";
import { Title, Meta } from "@solidjs/meta";
import { eventStore } from "../stores/eventStore";
import { ArticlesModel } from "../queries/articles";
import { isServer } from "solid-js/web";
import { APP_NAME, APP_TAGLINE, META_CONFIG } from "../config/meta";

const Home: Component = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = createSignal("");
  const [error, setError] = createSignal("");

  const articles = from(eventStore.model(ArticlesModel));

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
    <>
      <Title>{META_CONFIG.title}</Title>
      <Meta name="description" content={META_CONFIG.description} />
      <Meta property="og:title" content={META_CONFIG.title} />
      <Meta property="og:description" content={META_CONFIG.description} />
      <Meta property="og:type" content={META_CONFIG.type} />
      <Meta property="og:url" content={isServer ? "" : window.location.href} />
      <Meta property="og:site_name" content={META_CONFIG.siteName} />
      <Meta name="twitter:card" content={META_CONFIG.twitterCard} />
      <Meta name="twitter:title" content={META_CONFIG.title} />
      <Meta name="twitter:description" content={META_CONFIG.shortDescription} />

      <div class="flex-1 max-w-[800px] mx-auto px-6 py-16 w-full">
        {/* Header section */}
        <header class="text-center space-y-4">
          <h1 class="text-4xl font-bold tracking-tight">{APP_NAME}</h1>
          <p class="text-xl italic text-muted-foreground">{APP_TAGLINE}</p>
        </header>

        {/* Main content */}
        <main class="mt-12">
          <section class="prose prose-lg">
            <h2 class="text-foreground text-xl font-bold mb-4">Abstract</h2>
            <p class="text-justify leading-normal text-foreground">
              TeXstr is designed for viewing and sharing mathematical content
              through NIP-23 events with LaTeX support. It provides a seamless
              platform for mathematical discourse, enabling technical
              discussions with properly rendered mathematical notation.
            </p>
          </section>

          {/* naddr input form */}
          <section class="mt-8 mb-12">
            <form onSubmit={validateAndNavigate} class="space-y-4 sm:space-y-0">
              <div class="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                <div class="flex-1">
                  <input
                    type="text"
                    value={inputValue()}
                    onInput={(e) => setInputValue(e.currentTarget.value)}
                    placeholder="Enter naddr or URL containing naddr"
                    class="w-full h-10 px-4 py-2 border border-border rounded-md font-mono text-sm focus:outline-none focus:ring-2 bg-background text-foreground"
                    aria-label="naddr input"
                  />
                  {error() && (
                    <p class="text-destructive text-sm font-sans mt-1">
                      {error()}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  class="h-10 px-6 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 transition-colors md:self-start cursor-pointer"
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
                  <article class="border-b border-border pb-6 last:border-0">
                    <h3 class="text-xl">
                      <A
                        href={article.path}
                        class="text-foreground hover:text-muted-foreground no-underline hover:underline"
                      >
                        {article.title || "Untitled"}
                      </A>
                    </h3>
                    <div class="text-sm text-muted-foreground mb-2 font-serif">
                      {article.author && (
                        <>
                          <a
                            href={article.authorUrl}
                            class="!text-muted-foreground font-medium"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {article.author}
                          </a>
                          <span class="mx-2">·</span>
                        </>
                      )}
                      <span class="italic">{article.date}</span>
                    </div>
                    <p class="text-muted-foreground line-clamp-2">
                      {article.summary}...
                    </p>
                    <div class="flex flex-wrap gap-2 mt-3">
                      {article.tags.map((tag: string) => (
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                )}
              </For>
            </section>
          </Show>
        </main>
      </div>
    </>
  );
};

export default Home;
