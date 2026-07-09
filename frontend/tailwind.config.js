/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Primary indigo/violet gradient family — pulled from the Landing Page hero,
        // CTA buttons, and track cards in the PDF.
        primary: {
          50: "#EEF0FF",
          100: "#E0E3FF",
          200: "#C6CAFF",
          300: "#A5AAFF",
          400: "#8285FA",
          500: "#6C5CE7",
          600: "#5B45E0",
          700: "#4A35C9",
          800: "#3D2CA3",
          900: "#332882",
          950: "#1F1854",
        },
        accent: {
          500: "#8B5CF6",
          600: "#7C3AED",
        },
        // Deep navy used for the footer + the dark track-selection cards in the PDF.
        navy: {
          900: "#12103A",
          950: "#0B0A24",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F7F7FB",
        },
        ink: {
          900: "#15132B",
          700: "#413E5C",
          500: "#6B6885",
          300: "#A6A4BC",
        },
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(21, 19, 43, 0.06)",
        "card-hover": "0 12px 32px rgba(91, 69, 224, 0.14)",
        glow: "0 8px 30px rgba(108, 92, 231, 0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(135deg, #5B45E0 0%, #8B5CF6 100%)",
        "hero-gradient": "linear-gradient(180deg, #FFFFFF 0%, #F7F7FB 100%)",
      },
    },
  },
  plugins: [],
};
