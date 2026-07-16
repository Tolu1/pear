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

### Store only what is read

A field belongs in the store only if a component or hook reads it. State added on spec — that nothing observes, or that only the use case which wrote it ever touches — is not domain state, it's noise. Selected-option and other UI-local values live as component `useState`, not the store. Default to the smallest store that the UI actually reflects.

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

### Lifecycle vs. store state

Two separate concerns run through every use case, and each has one home:

- **Async lifecycle** — whether the invocation is pending, settled, or threw. Lives in the use-case hook (`useMutation`), consumed at the call site by whatever triggered it.
- **Domain state** — whatever the use case produces for the UI to reflect: results, phases, streamed updates. Lives in the store, read by any component.

A use case writes freely to the store as it runs; its hook independently exposes the lifecycle. Each component reads what it needs — the trigger reads the lifecycle, observers read the store.

### Server state vs. store state

Not all data from the server is store state. Two kinds hide under "server data":

- **Server state** — remote data that goes stale and must be kept in sync over its lifetime (refetched, invalidated, revalidated). Lives in React Query (`useQuery`), keyed by its inputs and invalidated when it changes. Do **not** mirror it into a store — that hand-rolls the cache `useQuery` already gives you.
- **Store state** — client-owned or derived state, and the one-off result of an action. The client holds and mutates it itself.

The test: **does this value need revalidating against the server over its lifetime?** Yes → `useQuery`. Produced once and then client-owned → store. (`useMutation` is still for actions; its `data` is a one-off result, not server state.)

### A query is a store; logic that drives it lives in a use case

A React Query cache is a state backend, the same kind of thing as Zustand, `useState`, or localStorage — it just happens to be server-determined. **Reading** it, in a hook or a component, is reflection, and reflection is allowed anywhere.

Putting **logic** in the hook that wraps a query is the boundary violation: `enabled` conditions, query-key decisions, `onSuccess`/`setQueryData` reconciliation, "if valid then…". That is orchestration, and orchestration is a use case's job.

A use case may write to the query client exactly as it writes to Zustand — `fetchQuery`, `setQueryData`, `invalidateQueries` — treating the query cache as one of its state backends:

```ts
// core/ use case — one owner of "is this code valid"
const access = await queryClient.fetchQuery({
  queryKey: betaAccessKeys.byCode(code),
  queryFn: () => getBetaAccess(code),
});
if (access.valid) useBetaAccessStore.getState().setCode(code);
```

The wrapping hook then only exposes lifecycle and reflects the cache.

Reading test: open a `use-…` hook and you should be able to say where each truth is decided. If you can't, the decision is in the wrong layer — the decider carries a use-case name, the hook reflects what it resolved.

Staleness does not move ownership into the view. "This can go stale" means a use case refreshes it, not that the query hook owns it.

### An action is not a cache read

A query key names **settled state** the client already owns. An action that _tries_ a value — validating a candidate, submitting a draft, checking a code before it's accepted — is a mutation, not a read of that state. Never run it as `fetchQuery`/`useQuery` against the settled state's key.

- **Semantics:** a candidate is not the settled value. It has no claim on the settled value's cache until the action accepts it.
- **Mechanics:** queries dedupe and read-through by key. Share a key between a settled-state read and a candidate action, and an in-flight or cached read will satisfy the action with the _wrong_ value — or the action's result pollutes the read.

```ts
// mutation use case — runs the check directly, off any query key
const result = await validateCandidate(input);
if (result.valid) {
  queryClient.setQueryData(settledKey, result); // commit only once accepted
  store.setAccepted(input);
}
```

The action touches the query cache only _after_ it succeeds, via `setQueryData` — never `fetchQuery` to perform the check itself.

### Errors

An error is either expected or unexpected, and that decides where it goes:

- **Expected failures** the use case can anticipate (no active tab, a service unreachable, validation fails) are **domain outcomes** — handled in place, written to the store (or returned), reflected by the UI. They are not thrown.
- **Unexpected errors** are not handled inline. The use-case hook re-throws them (`throwOnError`) to the route error boundary. Fail loud.

Same split as lifecycle vs. store state: an expected failure is domain state; an unexpected throw is a lifecycle fact.

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
