export const themeConfig = {
  colors: {
    light: {
      background: "rgb(255, 255, 255)",
      foreground: "rgb(17, 24, 39)",
      muted: {
        background: "rgb(243, 244, 246)",
        foreground: "rgb(107, 114, 128)",
      },
      border: "rgb(229, 231, 235)",
      accent: {
        background: "rgb(59, 130, 246)",
        foreground: "rgb(255, 255, 255)",
      },
      code: {
        background: "rgb(249, 250, 251)",
        foreground: "rgb(31, 41, 55)",
        border: "rgb(229, 231, 235)",
      },
      blockquote: {
        background: "rgb(249, 250, 251)",
        foreground: "rgb(107, 114, 128)",
        border: "rgb(229, 231, 235)",
      },
    },
    dark: {
      background: "rgb(17, 24, 39)",
      foreground: "rgb(243, 244, 246)",
      muted: {
        background: "rgb(31, 41, 55)",
        foreground: "rgb(156, 163, 175)",
      },
      border: "rgb(55, 65, 81)",
      accent: {
        background: "rgb(59, 130, 246)",
        foreground: "rgb(255, 255, 255)",
      },
      code: {
        background: "rgb(31, 41, 55)",
        foreground: "rgb(243, 244, 246)",
        border: "rgb(55, 65, 81)",
      },
      blockquote: {
        background: "rgb(31, 41, 55)",
        foreground: "rgb(156, 163, 175)",
        border: "rgb(55, 65, 81)",
      },
    },
  },
} as const;
