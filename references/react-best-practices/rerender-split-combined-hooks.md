---
title: Split Combined Hook Computations
impact: MEDIUM
impactDescription: avoids redundant recomputation when only some dependencies change
tags: rerender, useMemo, useEffect, optimization, dependencies
---

## Split Combined Hook Computations

When a hook contains multiple independent tasks with different dependencies, split them into separate hooks. Combined computations rerun entirely when any dependency changes — even dependencies irrelevant to part of the work.

**Incorrect (filtering reruns when only `sortOrder` changes):**

```tsx
function ProductList({ products, category, sortOrder }: Props) {
  const displayProducts = useMemo(() => {
    const filtered = products.filter(p => p.category === category)
    return filtered.sort((a, b) =>
      sortOrder === 'asc' ? a.price - b.price : b.price - a.price
    )
  }, [products, category, sortOrder])

  return <List items={displayProducts} />
}
```

**Correct (filtering only reruns when `products` or `category` change):**

```tsx
function ProductList({ products, category, sortOrder }: Props) {
  const filtered = useMemo(
    () => products.filter(p => p.category === category),
    [products, category]
  )

  const sorted = useMemo(
    () => [...filtered].sort((a, b) =>
      sortOrder === 'asc' ? a.price - b.price : b.price - a.price
    ),
    [filtered, sortOrder]
  )

  return <List items={sorted} />
}
```

**Applies to `useEffect` too:**

```tsx
// Incorrect — both effects run together on any dep change
useEffect(() => {
  analytics.track('view', { category })
  document.title = `${category} — Shop`
}, [category, pageTitle])

// Correct — each effect responds only to its own deps
useEffect(() => {
  analytics.track('view', { category })
}, [category])

useEffect(() => {
  document.title = pageTitle
}, [pageTitle])
```

**Note:** Projects using [React Compiler](https://react.dev/learn/react-compiler) may handle dependency tracking automatically, making manual splitting less critical in some cases.
