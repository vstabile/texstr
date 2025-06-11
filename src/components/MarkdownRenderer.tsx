import { createEffect, onCleanup } from "solid-js";
import { marked } from "marked";
import katex from "katex";
import "katex/dist/katex.min.css";

interface Props {
  content: string;
}

export default function MarkdownRenderer(props: Props) {
  let containerRef: HTMLDivElement | undefined;

  const renderLatex = (container: HTMLElement) => {
    const mathElements = container.querySelectorAll(".math-tex");
    mathElements.forEach((elem) => {
      const tex = elem.textContent || "";
      const isDisplay = elem.classList.contains("math-tex-display");
      try {
        const html = katex.renderToString(tex, {
          displayMode: isDisplay,
          throwOnError: false,
          trust: true,
          strict: false,
        });
        // Add dark mode class to the wrapper
        elem.innerHTML = html;
        elem.classList.add("dark:text-gray-100");
      } catch (error) {
        console.error("KaTeX rendering error:", error);
        elem.innerHTML = `<span class="text-red-500 dark:text-red-400">Error rendering LaTeX: ${tex}</span>`;
      }
    });
  };

  createEffect(() => {
    if (!containerRef || !props.content) return;

    // Configure marked
    marked.setOptions({
      gfm: true,
      breaks: true,
    });

    // First handle display math before markdown processing
    let content = props.content;
    content = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => {
      // Use a special marker that won't be processed by markdown
      return `<div class="math-tex math-tex-display dark:text-gray-100">${tex.trim()}</div>`;
    });

    // Render markdown
    const rendered = marked.parse(content);
    containerRef.innerHTML = typeof rendered === "string" ? rendered : "";

    // Process inline LaTeX only in non-code elements
    const processInlineLatex = (container: HTMLElement) => {
      // Get all text nodes that are not inside <code> elements
      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            // Skip if node is inside a code element
            if (node.parentElement?.closest("code")) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        }
      );

      const textNodes: Text[] = [];
      let node;
      while ((node = walker.nextNode())) {
        textNodes.push(node as Text);
      }

      // Process inline LaTeX in each text node
      textNodes.forEach((node) => {
        let content = node.textContent || "";

        // Handle only inline math now
        content = content.replace(/\$([^\$]+)\$/g, (_, tex) => {
          return `<span class="math-tex dark:text-gray-100">${tex.trim()}</span>`;
        });

        if (content !== node.textContent) {
          const temp = document.createElement("div");
          temp.innerHTML = content;
          node.parentNode?.replaceChild(temp.firstChild!, node);
        }
      });
    };

    // Process inline LaTeX in non-code elements
    processInlineLatex(containerRef);

    // Render all LaTeX
    renderLatex(containerRef);

    // Add dark mode classes to all elements
    const addDarkModeClasses = (container: HTMLElement) => {
      // Style text elements
      container.querySelectorAll("p, li, td, th").forEach((elem) => {
        if (!elem.closest("pre")) {
          elem.classList.add("dark:text-gray-200");
        }
      });

      // Style code blocks
      container.querySelectorAll("pre").forEach((elem) => {
        elem.classList.add(
          "bg-gray-50",
          "dark:bg-gray-800",
          "border",
          "border-gray-200",
          "dark:border-gray-700"
        );
      });

      // Style code inline
      container.querySelectorAll("code:not(pre code)").forEach((elem) => {
        elem.classList.add(
          "bg-gray-100",
          "dark:bg-gray-800",
          "text-gray-800",
          "dark:text-gray-200",
          "px-1",
          "rounded"
        );
      });

      // Style blockquotes
      container.querySelectorAll("blockquote").forEach((elem) => {
        elem.classList.add(
          "border-l-4",
          "border-gray-200",
          "dark:border-gray-700",
          "pl-4",
          "text-gray-700",
          "dark:text-gray-300"
        );
      });

      // Style headings
      container.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((elem) => {
        elem.classList.add("dark:text-gray-100");
      });

      // Style links
      container.querySelectorAll("a").forEach((elem) => {
        elem.classList.add(
          "text-blue-800",
          "dark:text-blue-400",
          "hover:underline"
        );
      });
    };

    // Add dark mode classes
    addDarkModeClasses(containerRef);
  });

  onCleanup(() => {
    if (containerRef) {
      containerRef.innerHTML = "";
    }
  });

  return <div ref={containerRef} />;
}
