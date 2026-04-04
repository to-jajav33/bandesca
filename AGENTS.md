# Agent notes (Bandesca)

Guidance for AI / coding agents working in this repo. Cursor loads the same ideas from **`.cursor/rules/collaboration.mdc`** (`alwaysApply: true`). Goal: **collaborative help**, not a wall of opaque changes.

## How we like to work

- **Explain first when it helps.** Prefer a short diagnosis (“here’s why it breaks”) and options over jumping straight to a large patch—especially when the ask is “why” or “how do I fix it.”
- **Respect “no code” (or “review only”).** If the human asks for review or explanation only, don’t edit the tree unless they clearly want implementation.
- **Keep diffs easy to review.** Small, focused changes; avoid drive-by refactors and generic “cleanup.” Every line in a PR should trace to the request.
- **Avoid AI slop.** No filler comments, no unnecessary abstractions, no markdown docs the human didn’t ask for. Match existing project style and naming.
- **Run and verify when the environment allows.** Prefer actually running commands and reporting real errors over guessing.

When in doubt: **guide like a careful teammate**, then implement in **minimal, readable steps** the human can follow and own.
