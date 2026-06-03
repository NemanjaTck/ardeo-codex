import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark grimoire palette — warm ink + parchment + gold/ember
        ink: {
          900: "#100d09",
          800: "#16120c",
          700: "#1d1810",
          600: "#241d13",
          500: "#2c2417",
        },
        parchment: {
          DEFAULT: "#ece3d0",
          soft: "#c9bfa6",
          muted: "#a9a087",
          faint: "#7d745f",
        },
        gold: {
          DEFAULT: "#d8b24a",
          bright: "#eccb6b",
          deep: "#a8842b",
        },
        ember: "#cf7b3c",
        blood: "#9d3b2f",
        edge: "#3a2f1d",
      },
      fontFamily: {
        display: ["var(--font-display)", "Cinzel", "Georgia", "serif"],
        body: ["var(--font-body)", "Spectral", "Georgia", "serif"],
      },
      // Fixed-pixel type scale (deliberately large for readability, decoupled
      // from the rem spacing scale so the layout stays put).
      fontSize: {
        xs: ["15px", "1.4"],
        sm: ["18px", "1.55"],
        base: ["21px", "1.7"],
        lg: ["25px", "1.35"],
        xl: ["28px", "1.3"],
        "2xl": ["32px", "1.25"],
        "3xl": ["38px", "1.2"],
        "4xl": ["45px", "1.12"],
        "5xl": ["58px", "1.08"],
        "6xl": ["70px", "1.05"],
        "7xl": ["84px", "1.04"],
        "8xl": ["108px", "1"],
      },
      maxWidth: {
        reading: "44rem",
      },
      backgroundImage: {
        "vignette":
          "radial-gradient(120% 80% at 50% -10%, rgba(216,178,74,0.07), transparent 60%)",
      },
    },
  },
  plugins: [typography],
};

export default config;
