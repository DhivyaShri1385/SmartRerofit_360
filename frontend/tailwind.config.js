/** Dark industrial theme tokens — reused across every module. */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          base: "#0d1117",
          panel: "#161b22",
          elevated: "#1c232c",
          border: "#2a323d",
        },
        status: {
          normal: "#22c55e",
          warning: "#f59e0b",
          critical: "#ef4444",
          offline: "#6b7280",
          info: "#3b82f6",
        },
        accent: {
          DEFAULT: "#0ea5e9",
          muted: "#0369a1",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};