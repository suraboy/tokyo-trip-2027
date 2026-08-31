# Modern Web Development & UI/UX Guidance

This rule enforces modern web application best practices, design aesthetics, performance, accessibility, and architectural standards across the codebase.

## 1. Visual Aesthetics & Design Excellence
- **Rich Aesthetics**: Prioritize visually stunning, premium interfaces. Avoid generic, plain colors and boring templates. Use curated color palettes (e.g. vibrant dark modes, soft modern ivory, glassmorphism, harmonious HSL tokens).
- **Typography**: Always import and use modern typography (e.g., Google Fonts like 'Prompt', 'Plus Jakarta Sans', 'Inter', 'Space Grotesk') instead of browser default fonts.
- **Micro-Interactions**: Implement smooth hover effects, active click states (`transform: translateY(-2px)`), subtle transitions (`transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1)`), and engaging feedback.
- **Glassmorphism & Depth**: Utilize multi-layered cards (`backdrop-filter: blur(...)`), subtle hairline borders (`rgba(255, 255, 255, 0.08)`), and soft elevation shadows.
- **No Low-Quality Placeholders**: Always use curated high-resolution assets or generated visuals.

## 2. Component Architecture & State Management
- **Next.js App Router Standards**: Keep Client Components (`'use client'`) focused on interactivity, while leveraging Server Components for static rendering and SEO.
- **Responsive Layout**: Build fluid, mobile-friendly layouts (`grid-template-columns: repeat(auto-fit, minmax(...))` and flexboxes) that gracefully scale from mobile viewports to ultra-wide displays with zero horizontal scroll issues.
- **Graceful Data Resilience**: Implement optimistic UI updates with resilient error fallbacks, loading skeletons, and empty state handlers.

## 3. SEO & Accessibility (a11y)
- **Semantic HTML5**: Use `<header>`, `<main>`, `<section>`, `<nav>`, `<article>`, and `<button>` appropriately.
- **Heading Hierarchy**: Maintain a clean single `<h1>` per view with properly ordered sub-headings (`<h2>`, `<h3>`).
- **Accessible Controls**: Provide descriptive `aria-label`, visible focus indicators, and keyboard navigation support.
