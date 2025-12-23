/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        border: "hsl(var(--border))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Mobile-first responsive typography
        "heading-1": ["1.875rem", { lineHeight: "2.25rem", fontWeight: "700" }],
        "heading-2": ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }],
        "heading-3": ["1.25rem", { lineHeight: "1.75rem", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.75rem" }],
        "body": ["1rem", { lineHeight: "1.5rem" }],
        "body-sm": ["0.875rem", { lineHeight: "1.25rem" }],
        "caption": ["0.75rem", { lineHeight: "1rem" }],
      },
      spacing: {
        // Safe area insets for mobile
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
        // Minimum touch target size (44px)
        "touch": "2.75rem",
        // Custom spacing scale using CSS variables
        // These map to var(--space-X) for semantic spacing
        "section": "var(--space-6)",  // 24px - between sections
        "card": "var(--space-4)",     // 16px - card internal padding & gaps
        "inline": "var(--space-2)",   // 8px - tight inline gaps
      },
      gap: {
        // Semantic gap utilities
        "section": "var(--space-6)",  // 24px - between major sections
        "card": "var(--space-4)",     // 16px - between cards
        "inline": "var(--space-2)",   // 8px - tight inline gaps
        "tight": "var(--space-1)",    // 4px - minimal spacing
      },
      minHeight: {
        touch: "2.75rem",
      },
      minWidth: {
        touch: "2.75rem",
      },
      screens: {
        // Mobile-first breakpoints
        "xs": "375px",    // iPhone SE
        "sm": "640px",    // Small tablets
        "md": "768px",    // Tablets
        "lg": "1024px",   // Desktop
        "xl": "1280px",   // Large desktop
      },
    },
  },
  plugins: [],
}
