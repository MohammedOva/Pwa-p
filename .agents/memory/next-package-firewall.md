---
name: Next.js package firewall
description: How to handle a Replit package-firewall rejection for a pinned Next.js release.
---

When the Replit package firewall rejects an exact Next.js release, check the current latest version and retry with that newer release instead of bypassing the firewall.

**Why:** An imported app's older pinned release returned HTTP 403 from the package firewall, while the current release installed successfully.

**How to apply:** Check `pnpm view next version`, update the app's direct dependency to that release if compatible, then run the normal workspace install. Do not disable firewall or lockfile protections.