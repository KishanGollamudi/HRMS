/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontSize: {
        // Shift every step up ~1.5-2px for eye comfort
        xs:   ["0.8rem",  { lineHeight: "1.4" }],   // was 0.75rem (12px) → now ~13.6px
        sm:   ["0.925rem",{ lineHeight: "1.5" }],   // was 0.875rem (14px) → now ~15.7px
        base: ["1rem",    { lineHeight: "1.6" }],   // 17px (set by html)
        lg:   ["1.15rem", { lineHeight: "1.6" }],   // was 1.125rem
        xl:   ["1.3rem",  { lineHeight: "1.5" }],   // was 1.25rem
        "2xl":["1.6rem",  { lineHeight: "1.4" }],
        "3xl":["1.95rem", { lineHeight: "1.3" }],
      },
    },
  },
  plugins: [],
};
