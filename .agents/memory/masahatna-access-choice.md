---
name: Masahatna access choice
description: The user's explicit decision to keep Masahatna without sign-in and leave Firestore rules unchanged.
---

Do not add sign-in or tighten Masahatna's Firestore rules unless the user asks again. The user chose to keep the app without sign-in.

**Why:** Restricting the current Firestore rules without first adding an agreed sign-in flow would break synchronization for both partners.

**How to apply:** Preserve the current no-auth behavior. Continue to explain that the data is publicly readable/writable and do not represent uploaded content as private.