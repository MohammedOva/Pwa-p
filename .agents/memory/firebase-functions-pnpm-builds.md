---
name: Masahatna Firebase Functions build requirements
description: Non-obvious deployment requirements for the standalone Firebase Functions package.
---

Firebase's remote Functions builder can use pnpm behavior that differs from the local workspace. Declare `@google-cloud/functions-framework` directly in the Functions package. Approve `protobufjs`' postinstall with `allowBuilds`; retain `onlyBuiltDependencies` for compatibility with local pnpm 10. Keep `minimumReleaseAge` at 1440 and resolve lockfile packages under that policy rather than weakening it.

**Why:** Remote builds passed the release-age check, then failed on ignored `protobufjs` lifecycle scripts and a missing Functions Framework dependency despite successful local installs.

**How to apply:** When deploying Firebase Functions from this standalone package, ensure the remote builder reads `pnpm-workspace.yaml` and deploy only the requested function.