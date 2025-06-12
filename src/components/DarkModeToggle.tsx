import { useTheme } from "./ThemeProvider";
import { cn } from "../lib/utils";

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      class={cn(
        "p-2 rounded-lg transition-colors",
        "hover:bg-muted",
        "focus:outline-none"
      )}
      aria-label="Toggle dark mode"
    >
      <div class="relative w-6 h-6">
        {/* Sun icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class={cn(
            "w-6 h-6 transition-all text-foreground",
            theme() === "dark" ? "scale-0 opacity-0" : "scale-100 opacity-100"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
          />
          <circle cx="12" cy="12" r="4" stroke-width="2" />
        </svg>
        {/* Moon icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class={cn(
            "w-6 h-6 absolute top-0 transition-all text-foreground",
            theme() === "dark" ? "scale-100 opacity-100" : "scale-0 opacity-0"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </div>
    </button>
  );
}
