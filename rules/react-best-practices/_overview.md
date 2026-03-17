# React Best Practices — Overview

Quick-reference summary of every rule in this library. Read this first to identify which specific rule files to fetch.

---

## Async — Eliminating Waterfalls

### async-api-routes.md
**Impact:** CRITICAL
Start independent async operations immediately in API routes; use Promise.all() or better-all to avoid waterfalls.

### async-defer-await.md
**Impact:** HIGH
Move await into branches where the value is actually needed — don't block code paths unnecessarily.

### async-dependencies.md
**Impact:** CRITICAL
Use better-all to maximize parallelism by starting each async task at the earliest possible moment based on dependency graph.

### async-parallel.md
**Impact:** CRITICAL
Execute independent async operations concurrently with Promise.all() instead of sequential awaits (2-10x improvement).

### async-suspense-boundaries.md
**Impact:** HIGH
Use Suspense boundaries to show wrapper UI faster while data loads in specific sections.

---

## Bundle — Size Optimization

### bundle-barrel-imports.md
**Impact:** CRITICAL
Import directly from source files, not barrel files (index.ts) — barrels pull in thousands of unused modules.

### bundle-conditional.md
**Impact:** HIGH
Load large data/modules only when a feature is activated using dynamic imports.

### bundle-defer-third-party.md
**Impact:** MEDIUM
Load analytics, logging, and error tracking after hydration with next/dynamic and ssr: false.

### bundle-dynamic-imports.md
**Impact:** CRITICAL
Use next/dynamic to lazy-load large components not needed on initial render.

### bundle-preload.md
**Impact:** MEDIUM
Preload heavy bundles before needed using onMouseEnter, onFocus, or feature flags.

---

## Client — Client-Side Data

### client-event-listeners.md
**Impact:** LOW
Use useSWRSubscription() to share global event listeners across multiple component instances.

### client-localstorage-schema.md
**Impact:** MEDIUM
Add version prefix to localStorage keys and store only needed fields to prevent schema conflicts.

### client-passive-event-listeners.md
**Impact:** MEDIUM
Add { passive: true } to touch and wheel listeners to enable immediate scrolling.

### client-swr-dedup.md
**Impact:** MEDIUM-HIGH
Use SWR for automatic request deduplication, caching, and revalidation across components.

---

## Re-render — Optimization

### rerender-defer-reads.md
**Impact:** MEDIUM
Don't subscribe to dynamic state (searchParams, localStorage) if only read in callbacks.

### rerender-dependencies.md
**Impact:** LOW
Specify primitive dependencies instead of objects to minimize effect re-runs.

### rerender-derived-state-no-effect.md
**Impact:** MEDIUM
Compute derived values during render instead of storing in state with useEffect.

### rerender-derived-state.md
**Impact:** MEDIUM
Subscribe to derived boolean state instead of continuous values to reduce re-render frequency.

### rerender-functional-setstate.md
**Impact:** MEDIUM
Use functional form (prev => ...) to prevent stale closures and avoid state dependencies.

### rerender-lazy-state-init.md
**Impact:** MEDIUM
Pass a function to useState for expensive initial values to avoid running computation on every render.

### rerender-memo-with-default-value.md
**Impact:** MEDIUM
Extract default non-primitive parameter values to constants to maintain memoization.

### rerender-memo.md
**Impact:** MEDIUM
Extract expensive work into memoized components to enable early returns before computation.

### rerender-move-effect-to-event.md
**Impact:** MEDIUM
Run side effects triggered by user actions in event handlers, not state + useEffect.

### rerender-no-inline-components.md
**Impact:** HIGH
Define components at module level — defining inside other components causes remount on every parent render.

### rerender-simple-expression-in-memo.md
**Impact:** LOW-MEDIUM
Don't wrap simple boolean/number/string expressions in useMemo — the overhead exceeds the benefit.

### rerender-transitions.md
**Impact:** MEDIUM
Mark frequent non-urgent updates as transitions to maintain UI responsiveness.

### rerender-use-ref-transient-values.md
**Impact:** MEDIUM
Use useRef for frequently changing values that don't need re-renders (tracking, intervals).

---

## Rendering — Performance

### rendering-activity.md
**Impact:** MEDIUM
Use Activity component to preserve state/DOM for expensive components that toggle visibility.

### rendering-animate-svg-wrapper.md
**Impact:** LOW
Wrap SVG in a div and animate the wrapper for hardware acceleration instead of animating the SVG directly.

### rendering-conditional-render.md
**Impact:** LOW
Use ternary operators (? :) instead of && to prevent rendering 0 or NaN.

### rendering-content-visibility.md
**Impact:** HIGH
Apply content-visibility: auto to defer off-screen rendering for significant speedup on long lists.

### rendering-hoist-jsx.md
**Impact:** LOW
Extract static JSX outside components to avoid re-creation on every render.

### rendering-hydration-no-flicker.md
**Impact:** MEDIUM
Inject synchronous script to update DOM before hydration to avoid both SSR breakage and flickering.

### rendering-hydration-suppress-warning.md
**Impact:** LOW-MEDIUM
Use suppressHydrationWarning on elements with known server/client differences (dates, IDs).

### rendering-resource-hints.md
**Impact:** HIGH
Use prefetchDNS, preconnect, preload, preinit to hint browser about critical resources.

### rendering-script-defer-async.md
**Impact:** HIGH
Use defer (maintains order) or async (independent) on script tags to prevent render-blocking.

### rendering-svg-precision.md
**Impact:** LOW
Reduce SVG coordinate precision to 1 decimal place with SVGO to decrease file size.

### rendering-usetransition-loading.md
**Impact:** LOW
Use useTransition instead of manual useState for loading states to reduce re-renders.

---

## JavaScript — Performance

### js-batch-dom-css.md
**Impact:** MEDIUM
Batch DOM writes before layout reads to avoid forced synchronous reflows (layout thrashing).

### js-cache-function-results.md
**Impact:** MEDIUM
Use module-level Map to cache function results when same inputs are used repeatedly.

### js-cache-property-access.md
**Impact:** LOW-MEDIUM
Cache object property lookups outside loops to reduce lookups in hot paths.

### js-cache-storage.md
**Impact:** LOW-MEDIUM
Cache localStorage/sessionStorage/cookie reads in memory — they're synchronous and expensive.

### js-combine-iterations.md
**Impact:** LOW-MEDIUM
Combine multiple .filter() or .map() calls into a single loop to avoid multiple iterations.

### js-early-exit.md
**Impact:** LOW-MEDIUM
Return early when result is determined to skip unnecessary processing.

### js-flatmap-filter.md
**Impact:** LOW-MEDIUM
Use .flatMap() to transform and filter in a single pass instead of .map().filter().

### js-hoist-regexp.md
**Impact:** LOW-MEDIUM
Don't create RegExp inside render — hoist to module scope or memoize with useMemo().

### js-index-maps.md
**Impact:** LOW-MEDIUM
Use Map instead of multiple .find() calls by same key — O(1) vs O(n) lookups.

### js-length-check-first.md
**Impact:** MEDIUM-HIGH
Check array lengths first before expensive comparisons to skip unnecessary operations.

### js-min-max-loop.md
**Impact:** LOW
Find min/max with a single loop (O(n)) instead of sorting (O(n log n)).

### js-set-map-lookups.md
**Impact:** LOW-MEDIUM
Convert arrays to Set/Map for repeated membership checks.

### js-tosorted-immutable.md
**Impact:** MEDIUM-HIGH
Use .toSorted() instead of .sort() to avoid mutating arrays in React state and props.

---

## Server — Server-Side Performance

### server-after-nonblocking.md
**Impact:** MEDIUM
Use Next.js after() to schedule logging, analytics, and side effects after response is sent.

### server-auth-actions.md
**Impact:** CRITICAL
Always verify authentication and authorization inside Server Actions — don't rely on middleware alone.

### server-cache-lru.md
**Impact:** HIGH
Use LRU cache for data shared across sequential requests — React.cache() only works per-request.

### server-cache-react.md
**Impact:** MEDIUM
Use React.cache() to deduplicate async operations (DB queries, auth) within a single request.

### server-dedup-props.md
**Impact:** LOW
Avoid transforming arrays/objects at RSC boundary — let the client do transformations.

### server-hoist-static-io.md
**Impact:** HIGH
Load static assets (fonts, logos, config) at module level, not on every request.

### server-parallel-fetching.md
**Impact:** CRITICAL
Restructure RSCs with composition to parallelize data fetching instead of sequential awaits.

### server-serialization.md
**Impact:** HIGH
Pass only fields the client actually uses to reduce serialized data transfer at RSC boundary.

---

## Advanced — Hooks

### advanced-event-handler-ref.md
**Impact:** LOW
Store callbacks in refs for stable subscriptions that don't re-run on handler changes.

### advanced-init-once.md
**Impact:** LOW-MEDIUM
Use module-level guard instead of useEffect([]) for app-wide init that must run only once.

### advanced-use-effect-event.md
**Impact:** LOW
Access latest values in callbacks without adding them to dependency arrays using useEffectEvent.
