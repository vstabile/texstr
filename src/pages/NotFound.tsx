import type { Component } from "solid-js";
import Footer from "../components/Footer";
import { useNavigate } from "@solidjs/router";

const NotFound: Component = () => {
  const navigate = useNavigate();

  return (
    <div class="min-h-screen bg-white text-black font-serif flex flex-col">
      <div class="flex-1 max-w-[800px] mx-auto px-8 py-16 w-full">
        {/* Header section */}
        <header class="text-center space-y-4">
          <h1 class="text-4xl font-bold tracking-tight">404: Page Not Found</h1>
          <p class="text-xl italic text-gray-600">
            The requested page does not exist
          </p>
        </header>

        {/* Main content */}
        <main class="space-y-8 mt-12">
          <section class="prose prose-lg text-center">
            <p class="leading-relaxed">
              The page you're looking for couldn't be found. It might have been
              moved or doesn't exist.
            </p>
            <button
              onClick={() => navigate("/")}
              class="mt-8 px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Return Home
            </button>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
