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
        elem.innerHTML = html;
      } catch (error) {
        console.error("KaTeX rendering error:", error);
        elem.innerHTML = `<span class="text-red-500">Error rendering LaTeX: ${tex}</span>`;
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

    // Handle both inline math ($...$) and display math ($$...$$)
    let content = props.content;

    // First handle display math
    content = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => {
      return `<div class="math-tex math-tex-display">${tex.trim()}</div>`;
    });

    // Then handle inline math
    content = content.replace(/\$([^\$]+)\$/g, (_, tex) => {
      return `<span class="math-tex">${tex.trim()}</span>`;
    });

    // Render markdown and ensure we get a string
    const rendered = marked.parse(content);
    containerRef.innerHTML = typeof rendered === "string" ? rendered : "";

    // Render LaTeX
    renderLatex(containerRef);
  });

  onCleanup(() => {
    if (containerRef) {
      containerRef.innerHTML = "";
    }
  });

  return <div ref={containerRef} />;
}
