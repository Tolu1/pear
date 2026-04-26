# Pear — Architecture Reference (CLAUDE.md)

This document defines the architectural rules for this codebase. Every layer, folder, and import decision derives from a formal proof. Do not deviate from these rules without understanding the proof first.

---

## The Core Claim

Errors in this system are either **boundary violations** or **intent errors**.

- Boundary violations are eliminated by the architecture itself.
- Intent errors (wrong logic inside a correctly structured layer) are the only remaining class of bug.

This means when something goes wrong, you always know exactly which layer to look in.

---

## Layers

There are five layers. Each owns private state and only communicates through defined interfaces.

| Layer   | Folder               | Responsibility                                                                                    |
| ------- | -------------------- | ------------------------------------------------------------------------------------------------- |
| `L_sys` | `core/`              | Declares what is possible. Every file is a use case.                                              |
| `L_l`   | `core/`              | Executes use cases. Applies logic. Writes to state.                                               |
| `L_ext` | `lib/`               | Self-contained modules that `core/` delegates to (api, ai, blockchain, browser, automation, etc). |
| `L_s`   | `store/`             | Holds current state. Exposes read hooks and write setters separately.                             |
| `L_p`   | `components/` `app/` | Reads state. Renders. Emits intent. Never writes to state directly.                               |

---

## Folder Structure

```
core/
  submit-payment.ts
  issue-card.ts
  connect-wallet.ts
  detect-checkout.ts

hooks/
  use-submit-payment.ts
  use-issue-card.ts
  use-connect-wallet.ts

lib/
  api/
  ai/
  blockchain/
  browser/
  automation/

store/
components/
app/
```

- `core/` is flat. Every file is a use case. Add domain subfolders only when the file count makes flat navigation painful.
- `hooks/` serves two purposes: converting use case functions into reactive React state (loading, error, success, data) so components can consume them, and encapsulating reusable UI-specific stateful logic. Flat until complexity demands otherwise.
- `lib/` contains self-contained modules that `core/` delegates to. Each folder is a single-concern module, whether it talks to an external service or encapsulates a browser, automation, or observation concern.
- File naming convention: kebab-case throughout.

---

## The One Import Rule

> Components may only import from `hooks/` (React wrappers around use cases) and read-only store hooks.
> Components may never import directly from `core/` or write methods from `store/`.

This single rule is what makes the architecture axiom-compliant. Enforce it via ESLint if needed.

---

## Intent

When a user does something, `L_p` emits an intent token — a pointer to a use case that already exists in `core/`. It does not compute, transform, or make decisions. It just says "run this."

`L_p` may pass raw user input alongside the intent. It may not manipulate that data before passing it. `L_l` receives it and decides what to do.

---

## Writing to State

Use cases in `core/` write to the store using Zustand's out-of-React setter pattern:

```ts
// correct — no React dependency in use case logic
useStore.getState().setBalance(newBalance);
```

Use cases are pure TypeScript functions. No hooks. No React lifecycle. No UI concerns.

---

## Hooks

`hooks/` is flat and serves two distinct purposes:

**1. Use case hooks** — wrap a `core/` use case and expose its async lifecycle (loading, error, success) via React Query. These are the bridge between `core/` and React.

**2. UI hooks** — encapsulate reusable UI-specific stateful logic e.g. `use-counter`, `use-toggle`, `use-debounce`. No business logic. No use case involvement.

Rules:

- A hook may either wrap a use case or encapsulate UI logic. It may never do both.
- A UI hook may read from `store/` via read-only hooks. It may never import write methods from `store/` or import anything from `core/`.
- Use cases in `core/` know nothing about React. Hooks know nothing about business logic.

Domain subfolders are not enforced until the flat list becomes painful to navigate.

---

## UI Logic vs Business Logic

UI logic is allowed in `components/`. Business logic is never allowed there.

**UI logic (allowed in components):**

- Is this dropdown open or closed?
- Is this button disabled while loading?
- Which tab is currently selected?

**Business logic (never in components):**

- Is this payment valid?
- Does this wallet have sufficient balance?
- Is this card authorized for this merchant?

---

## Axioms (Short Form)

1. Every layer owns private state. No direct access from outside.
2. Every layer exposes exactly `I_r` (read) and `I_w` (write) interfaces.
3. `I_r` — universal read access by default, can be restricted.
4. `I_w` — no access by default, must be explicitly granted at design time, never changes at runtime.

A **boundary violation** is: accessing raw state directly, or calling `I_w` without authorization.

---
