import { createEffect, onCleanup } from "solid-js";
import { marked } from "marked";
import katex from "katex";
import "katex/dist/katex.min.css";

interface Props {
  content: string;
}

const styles = `
  .prose-sm :where(hr):not(:where([class~="not-prose"],[class~="not-prose"] *)) {
    margin-top: 2em;
    margin-bottom: 2em;
  }

  /* LaTeX sizing */
  .math-tex {
    font-size: 0.75em;
  }
  .math-tex-display {
    font-size: 0.75em;
  }
  
  /* Adjust superscript and subscript size */
  .katex .sizing.reset-size6.size3,
  .katex .fontsize-ensurer.reset-size6.size3 {
    font-size: 0.85em;
  }
`;

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

    let content = props.content;
    const codeBlocks: string[] = [];

    // First preserve inline code blocks
    content = content.replace(/`([^`]+)`/g, (match) => {
      codeBlocks.push(match);
      return `%%CODE_BLOCK_${codeBlocks.length - 1}%%`;
    });

    // Then preserve multiline code blocks
    content = content.replace(/```[\s\S]*?```/g, (match) => {
      codeBlocks.push(match);
      return `%%CODE_BLOCK_${codeBlocks.length - 1}%%`;
    });

    // Handle display math
    content = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => {
      return `<div class="math-tex math-tex-display dark:text-gray-100">${tex.trim()}</div>`;
    });

    // Handle inline math
    content = content.replace(/\$([^\$\n]+)\$/g, (_, tex) => {
      return `<span class="math-tex dark:text-gray-100">${tex.trim()}</span>`;
    });

    // Restore code blocks
    content = content.replace(/%%CODE_BLOCK_(\d+)%%/g, (_, index) => {
      return codeBlocks[parseInt(index)];
    });

    // Render markdown
    const rendered = marked.parse(content);
    containerRef.innerHTML = typeof rendered === "string" ? rendered : "";

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

  return (
    <>
      <style>{styles}</style>
      <div ref={containerRef} />
    </>
  );
}
