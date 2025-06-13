import { createSignal } from "solid-js";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { formatDate } from "~/lib/utils";

export default function Publish() {
  const [title, setTitle] = createSignal("Test");
  const [content, setContent] = createSignal(
    "# Welcome to the Markdown Editor\n\nStart typing your markdown here..."
  );
  const [author, setAuthor] = createSignal("Author");
  const formatedDate = formatDate(Date.now());

  return (
    <>
      <div class="flex-1 max-w-[800px] mx-auto px-6 py-16 w-full">
        <div class="space-y-4 mb-16">
          <div>
            <label
              for="title-input"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Title
            </label>
            <input
              id="title-input"
              value={title()}
              onInput={(e) => setTitle(e.currentTarget.value)}
              class="w-full h-10 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Enter your title here..."
            />
          </div>

          <div>
            <label
              for="author-input"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Author
            </label>
            <input
              id="author-input"
              value={author()}
              onInput={(e) => setAuthor(e.currentTarget.value)}
              class="w-full h-10 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Enter the author name..."
            />
          </div>

          <div>
            <label
              for="content-textarea"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Markdown Content
            </label>
            <textarea
              id="content-textarea"
              value={content()}
              onInput={(e) => setContent(e.currentTarget.value)}
              class="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Enter your markdown content here..."
            />
          </div>
        </div>
        <div class="prose text-lg prose-sm max-w-none dark:prose-invert prose-headings:font-serif prose-headings:font-normal prose-h1:text-3xl prose-h1:mb-8 prose-h1:text-center prose-h2:mt-8 prose-h2:mb-4 prose-p:text-justify prose-p:leading-normal prose-a:text-blue-800 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-pre:bg-gray-50 dark:prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700">
          <h1 class="!mb-6">{title()}</h1>
          <div class="text-center text-lg font-serif mb-10">
            <span class="!text-gray-800 dark:!text-gray-200 tracking-wide !no-underline uppercase text-base hover:!text-gray-600 dark:hover:!text-gray-400">
              {author()}
            </span>
            <div class="text-sm text-gray-500 dark:text-gray-400 italic">
              {formatedDate}
            </div>
          </div>
          <MarkdownRenderer content={content()} />
        </div>
      </div>
    </>
  );
}
