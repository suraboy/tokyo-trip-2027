---
name: chrome-devtools
description: Chrome DevTools inspection, browser console diagnostics, network monitoring, DOM analysis, and automated browser debugging workflows for AI agents.
---

# Chrome DevTools for Agents Skill

Use this skill when you need to inspect browser runtime state, evaluate JavaScript expressions, monitor network requests, troubleshoot hydration or layout errors, and verify user experience in Chrome/Chromium.

## 1. Browser Subagent & DevTools Inspection Workflows

When debugging frontend applications:
1. **Launch Browser Agent**: Navigate to the target local URL (e.g. `http://localhost:3001`).
2. **Inspect Console Logs**: Check for errors like:
   - Uncaught `TypeError` or `ReferenceError`
   - Next.js hydration mismatches (`Hydration failed because the server rendered HTML didn't match the client`)
   - Resource loading failures (`404 Not Found` on scripts/fonts/images)
3. **Inspect Network Traffic**:
   - Verify API fetch calls (`GET /api/trips`, `POST /api/trips`).
   - Validate payload formats and response status codes.

## 2. DOM & CSS Computed Style Debugging
- Check bounding box sizing, flexbox/grid alignments, and overflow properties.
- Verify modal backdrop z-indexes (`z-index: 999` or higher) and scroll-lock behavior.
- Ensure all interactive buttons respond to click events and update client state.

## 3. Playwright & Puppeteer Automation Scripts
Create test scripts in `scratch/test_browser.mjs` to execute automated end-to-end assertions when needed:
```javascript
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:3001');

// Assert no console errors
page.on('console', msg => {
  if (msg.type() === 'error') console.error('Browser Error:', msg.text());
});
```
