import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1800px",
    },
    extend: {
      colors: {
        // DESIGN.md — Theme Selection (bright marketplace)
        primary: {
          DEFAULT: "#6E66ED",
          hover: "#5A54D1",
          soft: "var(--primary-soft)",
          50: "#EFEDFE",
          100: "#E0DDfd",
          500: "#6E66ED",
          600: "#5A54D1",
          700: "#4843B0",
        },
        accent: {
          DEFAULT: "#FCAD32",
          hover: "#E89B1F",
          soft: "var(--accent-soft)",
        },
        inktext: "var(--inktext)",
        canvas: "var(--canvas)",
        muted: {
          DEFAULT: "var(--muted)",
        },
        line: "var(--line)",
        success: {
          DEFAULT: "#21C56E",
          soft: "var(--success-soft)",
        },
        error: {
          DEFAULT: "#FF4D4F",
          soft: "var(--error-soft)",
        },
        // Legacy aliases — remapped to light so old classes flip automatically.
        // New code should use primary/accent/canvas/inktext/line directly.
        ink: {
          DEFAULT: "#F9F9FB",
          sidebar: "#FFFFFF",
          card: "#FFFFFF",
          row: "#FFFFFF",
          input: "#FFFFFF",
        },
        brandviolet: {
          DEFAULT: "#6E66ED",
          hover: "#5A54D1",
        },
        surface: {
          DEFAULT: "#F9F9FB",
          hover: "#F1F1F5",
        },
        background: "#F9F9FB",
        foreground: "#323243",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--inktext)",
        },
        popover: {
          DEFAULT: "var(--card)",
          foreground: "var(--inktext)",
        },
        secondary: {
          DEFAULT: "#323243",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#FF4D4F",
          foreground: "#FFFFFF",
        },
        border: "var(--line)",
        input: "var(--line)",
        ring: "#6E66ED",
        brand: {
          50: "#E6F9EF",
          100: "#EFEDFE",
          500: "#21C56E",
          600: "#6E66ED",
          dark: "#323243",
          card: "#FFFFFF",
          border: "#E5E7EB",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "Outfit", "system-ui", "sans-serif"],
        outfit: ["var(--font-outfit)", "Outfit", "system-ui", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
        full: "9999px",
      },
      boxShadow: {
        menu: "0 8px 24px -6px rgba(50, 50, 67, 0.12)",
        card: "0 1px 2px rgba(50, 50, 67, 0.06)",
        pop: "0 12px 32px -8px rgba(50, 50, 67, 0.18)",
      },
      keyframes: {
        menuFade: {
          from: { opacity: "0", transform: "translateY(-2px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        drawerIn: {
          from: { opacity: "0.4", transform: "translateX(-100%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        overlayFade: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        popIn: {
          from: { opacity: "0", transform: "scale(0.96) translateY(-6px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        sheetUp: {
          from: { opacity: "0", transform: "translateY(48px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        rowIn: {
          from: { opacity: "0", transform: "translateX(10px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        badgePop: {
          "0%": { transform: "scale(0.4)" },
          "60%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "menu-fade": "menuFade 100ms ease-out",
        "drawer-in": "drawerIn 220ms cubic-bezier(0.32, 0.72, 0, 1)",
        "overlay-fade": "overlayFade 180ms ease-out",
        "pop-in": "popIn 180ms cubic-bezier(0.32, 0.72, 0, 1)",
        "sheet-up": "sheetUp 240ms cubic-bezier(0.32, 0.72, 0, 1)",
        "row-in": "rowIn 200ms ease-out both",
        "badge-pop": "badgePop 250ms cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
