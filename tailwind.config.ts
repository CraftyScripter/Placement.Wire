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
        // Dashboard palette (target redesign)
        ink: {
          DEFAULT: "#0e0e0e",
          sidebar: "#121212",
          card: "#1e1e1e",
          row: "#242424",
          input: "#2a2a2a",
        },
        brandviolet: {
          DEFAULT: "#7c3aed",
          hover: "#8b5cf6",
        },
        // Flat design tokens
        surface: {
          DEFAULT: "#11141a",
          hover: "#161a22",
        },
        line: "rgba(255, 255, 255, 0.10)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          dark: "#0a0d14",
          card: "#121722",
          border: "#1f293d",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        menu: "0 8px 24px -6px rgba(0, 0, 0, 0.45)",
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
