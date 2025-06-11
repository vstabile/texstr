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

    // First handle display math before markdown processing
    let content = props.content;
    content = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => {
      // Use a special marker that won't be processed by markdown
      return `<div class="math-tex math-tex-display">${tex.trim()}</div>`;
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
          return `<span class="math-tex">${tex.trim()}</span>`;
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
  });

  onCleanup(() => {
    if (containerRef) {
      containerRef.innerHTML = "";
    }
  });

  return <div ref={containerRef} />;
}
