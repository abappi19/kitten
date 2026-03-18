# Composition Patterns — Overview

Quick-reference summary of every rule in this library. Read this first to identify which specific rule files to fetch.

---

## architecture-avoid-boolean-props.md
**Impact:** CRITICAL
Don't add boolean props like `isThread`, `isEditing` to customize component behavior — each boolean doubles possible states. Use composition with explicit variant components instead.

## architecture-compound-components.md
**Impact:** HIGH
Structure complex components as compound components with shared context. Subcomponents access state via context, not props. Export as named parts (e.g., `Composer.Frame`, `Composer.Input`).

## patterns-children-over-render-props.md
**Impact:** MEDIUM
Use `children` for composition instead of `renderX` props. Children are more readable and compose naturally. Only use render props when the parent needs to pass data back to the child.

## patterns-explicit-variants.md
**Impact:** MEDIUM
Instead of one component with many boolean props, create explicit variant components (`ThreadComposer`, `EditComposer`). Each variant composes only the pieces it needs — no impossible states.

## react19-no-forwardref.md
**Impact:** MEDIUM
In React 19+, `ref` is a regular prop (no `forwardRef` needed) and `use()` replaces `useContext()`. The `use()` hook can be called conditionally.

## state-context-interface.md
**Impact:** HIGH
Define a generic context interface with `state`, `actions`, and `meta`. This contract lets any provider implement it — enabling the same UI to work with different state implementations.

## state-decouple-implementation.md
**Impact:** MEDIUM
The provider is the only place that knows how state is managed. UI components consume the context interface — they don't know if state comes from useState, Zustand, or a server sync.

## state-lift-state.md
**Impact:** HIGH
Move state into dedicated provider components so sibling components outside the main UI tree can access and modify state without prop drilling.
