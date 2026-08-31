---
name: modern-web-guidance
description: Complete modern web application development, visual UI/UX design patterns, Next.js architecture, performance, accessibility, and aesthetic guidelines for Antigravity.
---

# Modern Web Guidance Skill for Antigravity

This skill guides the agent in building modern, visually stunning, high-performance web applications with Next.js, TypeScript, and modern CSS design systems.

## 1. Design System & Token Architecture

Always establish comprehensive design tokens in CSS variables:
```css
:root {
  /* Typography */
  --font-sans: 'Prompt', 'Plus Jakarta Sans', sans-serif;
  --font-mono: 'Space Grotesk', monospace;

  /* Surfaces & Elevation */
  --bg-main: #0c1017;
  --bg-surface: #141a24;
  --bg-surface-raised: #1c2433;
  --bg-surface-hover: #232e40;
  
  /* Borders */
  --border-hairline: rgba(255, 255, 255, 0.08);
  --border-subtle: rgba(255, 255, 255, 0.14);

  /* Accents */
  --accent-primary: #ff6584;
  --accent-cyan: #38bdf8;
  --accent-emerald: #10b981;
  --accent-amber: #f59e0b;

  /* Radii & Shadows */
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-pill: 9999px;
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.05);
}
```

## 2. Interactive Components Pattern
- **Buttons**: Pill-shaped or rounded corners, gradient fills, subtle glow on hover, micro translateY lift.
- **Bento & Story Cards**: Multi-column fluid grids with image headers, dark gradient overlays, categorized pill tags, and clear action triggers.
- **Empty States**: Friendly emoji/icon, clear description, and actionable CTA button.
- **Modals**: Backdrop blur, animated scale-in transition, sticky headers, and keyboard escape handling.

## 3. Performance & Data Resilience
- Always implement optimistic client updates for instantaneous UI response.
- Use persistent database storage (SQLite / Postgres) with zero mock drift.
- Ensure all API routes validate payloads and return standardized JSON responses: `{ success: boolean, data?: any, error?: string }`.
