import type { Component } from "solid-js";
import { createSignal, from, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { nip19 } from "nostr-tools";
import { eventStore } from "../stores/eventStore";
import Footer from "../components/Footer";
import { KINDS } from "../lib/nostr";
import { articlesLoader } from "../lib/loaders";
import ArticleList from "../components/ArticleList";
import { SCIENTIFIC_TAGS } from "../lib/constants";

const Home: Component = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = createSignal("");
  const [error, setError] = createSignal("");

  onMount(() => {
    articlesLoader.next(undefined);
  });

  const articles = from(
    eventStore.timeline({
      kinds: [KINDS.ARTICLE],
      "#t": SCIENTIFIC_TAGS,
    })
  );

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
      <div class="flex-1 max-w-[800px] mx-auto px-8 py-16 w-full">
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
            <p class="text-justify leading-relaxed">
              TeXstr is a specialized Nostr client designed for viewing and
              sharing mathematical content through NIP-23 events with LaTeX
              support. It provides a seamless platform for mathematical
              discourse, enabling users to engage in technical discussions with
              properly rendered mathematical notation.
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

          <ArticleList articles={articles()} />
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
