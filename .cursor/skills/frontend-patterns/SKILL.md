---
name: frontend-patterns
description: Frontend development patterns for React, Next.js, state management, performance optimization, and UI best practices. Use when building React components (composition, props, rendering), managing state (useState, useReducer, Zustand, Context), implementing data fetching (SWR, React Query, server components), optimizing performance (memoization, virtualization, code splitting), working with forms (validation, controlled inputs, Zod), handling client-side routing, or building accessible responsive UI.
---

# Frontend Development Patterns

Modern frontend patterns for React, Next.js, and performant user interfaces.

## When to Activate

- Building React components (composition, props, rendering)
- Managing state (useState, useReducer, Zustand, Context)
- Implementing data fetching (SWR, React Query, server components)
- Optimizing performance (memoization, virtualization, code splitting)
- Working with forms (validation, controlled inputs, Zod schemas)
- Handling client-side routing and navigation
- Building accessible, responsive UI patterns

## Quick Reference

| Area | Prefer | Avoid |
|------|--------|--------|
| Components | Composition, compound components | Deep prop drilling, inheritance |
| State | Context + reducer for domain state; local state for UI | Global state for everything |
| Data | useQuery/SWR patterns, enabled/refetch options | Raw useEffect fetch without loading/error |
| Performance | useMemo/useCallback/React.memo where measured; lazy + Suspense | Premature optimization |
| Forms | Controlled inputs + validate-on-submit or Zod | Uncontrolled without validation |
| Accessibility | role, aria-*, keyboard nav, focus restore | Ignoring keyboard and screen readers |

## Component Patterns

- **Composition over inheritance**: Build small presentational components (e.g. Card, CardHeader, CardBody) and compose with `children`. Prefer `React.ReactNode` for flexible content.
- **Compound components**: Use a single Context (e.g. TabsContext) and expose TabList, Tab, TabPanel that consume it. Throw if used outside parent.
- **Render props**: When you need to expose data/loading/error to the caller, use `children` as a function `(data, loading, error) => ReactNode`.

## Custom Hooks

- **State**: Encapsulate toggle, pagination, or form state in hooks (e.g. `useToggle()`, `useQuery(key, fetcher, { onSuccess, enabled })`).
- **Debounce**: Use `useDebounce(value, delay)` for search or any input that triggers async work.
- **Data fetching**: Return `{ data, error, loading, refetch }` and support `enabled` so callers can skip fetch when needed.

## State Management

- Use **Context + useReducer** for domain state shared across a subtree (e.g. markets, selected item). Provide a custom hook (e.g. `useMarkets()`) that throws when used outside the provider.
- Keep actions typed (e.g. `type Action = { type: 'SET_MARKETS'; payload: Market[] } | ...`).

## Performance

- **Memoization**: `useMemo` for derived data (e.g. sorted/filtered lists), `useCallback` for handlers passed to memoized children, `React.memo` for pure list items.
- **Code splitting**: `lazy()` + `Suspense` for heavy or below-the-fold components (charts, 3D, modals).
- **Virtualization**: Use `@tanstack/react-virtual` (or similar) for long lists; set `estimateSize` and `overscan` appropriately.

## Forms

- **Controlled components**: Single `formData` state + `setFormData(prev => ({ ...prev, field: value }))`.
- **Validation**: Validate on submit; store errors in state (e.g. `FormErrors`); display per-field errors. Consider Zod for schema + parsing.
- **Submit**: `e.preventDefault()`, validate, then call API; handle loading and error states.

## Error Handling

- **Error boundaries**: Class component with `getDerivedStateFromError` and `componentDidCatch`. Render fallback UI and a retry action. Wrap app or feature sections.

## Animation

- Use **Framer Motion** (`motion`, `AnimatePresence`) for list enter/exit and modals (overlay + content with initial/animate/exit). Keep transitions short (e.g. 0.3s).

## Accessibility

- **Keyboard**: Handle ArrowDown/ArrowUp, Enter, Escape in dropdowns and modals; call `e.preventDefault()` where needed.
- **Focus**: Restore focus when closing modals (store `document.activeElement` on open, restore on close). Use `tabIndex={-1}` on modal container and focus it on open.
- **Semantics**: Use `role`, `aria-expanded`, `aria-haspopup`, `aria-modal` as appropriate.

## Summary Checklist

- [ ] Components use composition or compound pattern; no unnecessary prop drilling.
- [ ] State is local or context+reducer; data fetching has loading/error/refetch.
- [ ] Memoization and lazy loading applied where they address real performance issues.
- [ ] Forms are controlled with validation and clear error display.
- [ ] Error boundaries wrap appropriate subtrees.
- [ ] Key flows work with keyboard and focus is managed in modals.
- [ ] ARIA and roles used for custom interactive components.

For full code examples and detailed patterns, see [reference.md](reference.md).
