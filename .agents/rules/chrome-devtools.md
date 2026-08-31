# Chrome DevTools for Agents Rule

This rule guides agent behavior when inspecting, debugging, and testing web applications using Chrome DevTools Protocol (CDP), browser agents, and headless browser runtimes.

## 1. Automated Console & Error Monitoring
- **Zero Console Errors**: Always verify that the web application renders with zero uncaught JavaScript errors, zero hydration mismatches, and zero failed network requests.
- **Diagnostics**: When debugging UI bugs, read browser console logs and uncaught exception stack traces before modifying code.

## 2. DOM & Layout Inspection
- **Element Selectors**: Ensure all interactive UI elements have descriptive attributes (`id`, `data-testid`, or semantic tags) for reliable browser automation.
- **Viewport Responsiveness**: Test UI across multiple device viewports:
  - Mobile: `390 x 844` (iPhone 14/15)
  - Tablet: `768 x 1024` (iPad)
  - Desktop: `1440 x 900` / `1920 x 1080`

## 3. Network & API Inspection
- Monitor API requests to `/api/*` endpoints to ensure:
  - Valid HTTP status codes (`200 OK`, `201 Created`).
  - Standardized JSON responses (`{ success: true, ... }`).
  - Graceful error handling (`{ success: false, error: '...' }`).

## 4. Performance & Core Web Vitals
- Optimize First Contentful Paint (FCP) and Largest Contentful Paint (LCP) by preloading fonts and lazy-loading heavy media.
- Prevent Cumulative Layout Shift (CLS) by setting explicit aspect ratios on image containers.
