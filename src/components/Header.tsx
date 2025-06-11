import { A } from "@solidjs/router";
import { cn } from "../lib/utils";
import DarkModeToggle from "./DarkModeToggle";
import { APP_NAME } from "../config/meta";

interface HeaderProps {
  class?: string;
  minimal?: boolean;
}

export default function Header(props: HeaderProps) {
  return (
    <header
      class={cn("bg-white dark:bg-gray-900 transition-colors", props.class)}
    >
      <div class="max-w-[800px] mx-auto px-6 py-2 flex justify-between items-center">
        <A
          href="/"
          class="text-lg font-serif text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 transition-colors hover:no-underline"
        >
          {APP_NAME}
        </A>
        <DarkModeToggle />
      </div>
    </header>
  );
}
