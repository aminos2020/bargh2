import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["var(--font-vazir)", "Tahoma", "ui-sans-serif", "sans-serif"] },
      colors: {
        primary: {
          50: "#EFF6FF", 100: "#DBEAFE", 200: "#BFDBFE", 300: "#93C5FD", 400: "#60A5FA",
          500: "#3B82F6", 600: "#2563EB", 700: "#1D4ED8", 800: "#1E40AF", 900: "#1E3A8A",
        },
        ink: { 200: "#CBD5E1", 300: "#94A3B8", 400: "#64748B", 500: "#475569", 700: "#334155", 800: "#1E293B", 900: "#0F172A" },
        canvas: "#F8FAFC",
        line: "#E2E8F0",
        ok: { 50: "#F0FDF4", 600: "#16A34A", 700: "#15803D" },
        warn: { 50: "#FFFBEB", 600: "#D97706", 700: "#B45309" },
        bad: { 50: "#FEF2F2", 600: "#DC2626", 700: "#B91C1C" },
      },
      borderRadius: { card: "20px", input: "14px", sheet: "24px" },
      keyframes: {
        fadeUp: { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        scaleIn: { from: { opacity: "0", transform: "scale(0.96)" }, to: { opacity: "1", transform: "scale(1)" } },
        sheetUp: { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "150% 0" }, "100%": { backgroundPosition: "-50% 0" } },
        shakeX: { "0%,100%": { transform: "translateX(0)" }, "20%": { transform: "translateX(-5px)" }, "40%": { transform: "translateX(5px)" }, "60%": { transform: "translateX(-3px)" }, "80%": { transform: "translateX(3px)" } },
        boltGlow: {
          "0%,100%": { filter: "drop-shadow(0 0 6px rgba(59,130,246,0.45))" },
          "50%": { filter: "drop-shadow(0 0 18px rgba(59,130,246,0.85))" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fadeIn 0.2s ease-out both",
        "scale-in": "scaleIn 0.22s cubic-bezier(0.22,1,0.36,1) both",
        "sheet-up": "sheetUp 0.32s cubic-bezier(0.22,1,0.36,1) both",
        shake: "shakeX 0.35s ease-in-out",
        bolt: "boltGlow 2.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
