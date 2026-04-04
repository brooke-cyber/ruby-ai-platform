import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0f172a",
        "navy-light": "#1e293b",
        accent: "#2563eb",
        "accent-light": "#3b82f6",
        ruby: {
          50: "#fdf2f2",
          100: "#fce4e4",
          200: "#facece",
          300: "#f5a3a3",
          400: "#ec6a6a",
          500: "#d94343",
          600: "#b82e2e",
          700: "#8B1A1A",
          800: "#6E1515",
          900: "#4A0E0E",
          950: "#2D0808",
        },
        dark: {
          950: "#0A0A0A",
          900: "#111111",
          800: "#1A1A1A",
          700: "#2A2A2A",
          600: "#3A3A3A",
        },
        neutral: {
          50: "#FAFAF9",
          100: "#F5F5F4",
          200: "#E8E8E6",
          300: "#D4D4D2",
          400: "#A3A3A0",
          500: "#737370",
          600: "#525250",
          700: "#3D3D3B",
          800: "#262625",
          900: "#1A1A19",
        },
      },
      fontFamily: {
        display: ["var(--font-heading)", '"DM Sans"', "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-heading)", '"DM Sans"', "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display-lg": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        "display-md": ["2.5rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-sm": ["1.875rem", { lineHeight: "1.2", letterSpacing: "-0.015em" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
