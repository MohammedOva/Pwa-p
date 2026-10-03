---
name: Masahatna FCM diagnostics
description: Distinguish Firebase server-send success from browser token-registration failures and route client diagnostics correctly.
---

Successful `notifyOnAction` logs prove an existing FCM token was accepted by the Admin SDK, but do not prove a browser can register or persist a new token. Browser `getToken` and Firestore registration errors are client-side and must be captured from the web app. Log only the failing stage and Firebase error code; never log FCM tokens or raw exception messages. In this workspace, `/api/*` is routed to the separate API server, so Next.js diagnostics must use a non-`/api` route.

**Why:** Firebase logs showed successful sends while the unresolved failure occurred before the client registered its token. A test request to `/api/*` reached the Express API server and returned 404 instead of reaching Next.js.

**How to apply:** When FCM activation fails, first inspect function send logs, then capture the browser failure stage/code in the web workflow logs using a non-`/api` endpoint. Preserve Firestore rules unless the user explicitly authorizes a change.