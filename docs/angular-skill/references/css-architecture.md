# CSS Architecture

## The Boundary

```
Component CSS = "what I look like"
Page CSS      = "where I sit"
```

If you're writing a color, font size, border, shadow, or padding in a page CSS file — stop. That style belongs in a component.

If you're writing a color, font, or visual property in a page CSS to affect a child component — stop. Add a variant input to that component instead.

## Component CSS

Owns everything visual. A component should look correct regardless of where it's placed.

```css
/* card.component.css — complete visual ownership */
:host {
  display: block;  /* always first */
}

.card {
  background: var(--p-surface-0);
  border: 1px solid var(--p-content-border-color);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--p-text-color);
  margin-bottom: 0.5rem;
}

.card-body {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}
```

## Page CSS — Minimum Necessary

A page answers one question: *how are components arranged?*

```css
/* dashboard.component.css */
:host {
  display: block;
  min-height: 100vh;
  background: var(--p-surface-50);  /* page background is acceptable here */
}

.page-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 900px) {
  .content-grid { grid-template-columns: 1fr; }
}
```

Page CSS only has: `:host`, `.page-body`, layout containers with grid/flex, gaps, max-widths, and breakpoints. Nothing else.

## What Belongs Where — Decision Table

| Style | In component? | In page? |
|-------|:---:|:---:|
| Background of the component | ✅ | ❌ |
| Background of the page | ❌ | ✅ |
| Padding inside a card | ✅ | ❌ |
| Gap between cards on the page | ❌ | ✅ |
| Font size of a label | ✅ | ❌ |
| Max width of the content area | ❌ | ✅ |
| Border of a component | ✅ | ❌ |
| Grid columns for arranging components | ❌ | ✅ |
| Hover effect on a button | ✅ | ❌ |

## Design Tokens

Always use tokens. Never hardcode hex values in component CSS.

**PrimeNG Aura tokens:**
```css
var(--p-primary-color)         /* brand primary */
var(--p-text-color)            /* main text */
var(--p-text-muted-color)      /* secondary text */
var(--p-surface-0)             /* white / card background */
var(--p-surface-50)            /* page background */
var(--p-content-border-color)  /* borders */
var(--p-border-radius-md)      /* standard border radius */
```

**Define project-level tokens in `styles.css`:**
```css
:root {
  --brand: #4F6EF7;
  --brand-hover: #3B57E8;
  --text-primary: #1A1D2B;
  --text-secondary: #525B74;
  --text-muted: #8C93A8;
}
```

## Semantic Classes — Not Utilities

```css
/* ✅ Semantic */
.metric-value { font-size: 2rem; font-weight: 700; color: var(--p-text-color); }
.status-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }

/* ❌ Utility — never invent these */
.text-2xl   { font-size: 2rem; }
.font-bold  { font-weight: 700; }
.mt-4       { margin-top: 1rem; }
.flex-row   { display: flex; }
```

## CSS File Order (every component)

```css
/* 1. Host */
:host { display: block; }

/* 2. Root structural element (if any) */
header { ... }

/* 3. Layout containers */
.content { ... }

/* 4. Blocks */
.card { ... }
.list-item { ... }

/* 5. Atoms */
.label { ... }
.badge { ... }

/* 6. PrimeNG host fixes */
p-iconfield { display: block; }
p-password  { display: block; width: 100%; }

/* 7. States */
.is-active { ... }
.is-empty  { ... }

/* 8. Responsive */
@media (max-width: 768px) { ... }
```

## No `::ng-deep`

Deprecated and breaks encapsulation. Override PrimeNG in `styles.css` instead:

```css
/* styles.css — global PrimeNG overrides */
.p-inputtext { border-radius: 8px; }
.p-card .p-card-body { padding: 1.25rem; }
```

## `styles.css` — What Goes Global

```css
/* 1. Reset — always present */
*, *::before, *::after { box-sizing: border-box; }
html, body { height: 100%; margin: 0; padding: 0; }
body {
  font-family: var(--p-font-family), system-ui, sans-serif;
  background: var(--p-surface-50);
  -webkit-font-smoothing: antialiased;
}

/* 2. Project design tokens */
:root {
  --brand: #4F6EF7;
  --brand-hover: #3B57E8;
}

/* 3. PrimeNG overrides that affect elements appended to <body>
      (dialogs, tooltips, popovers — Angular encapsulation doesn't reach them) */
.p-dialog .p-dialog-header { ... }

/* 4. Reusable semantic utilities used across 3+ components */
.page-subtitle { font-size: 0.875rem; color: var(--p-text-muted-color); }
.field-label   { font-size: 0.75rem; font-weight: 500; color: var(--p-text-muted-color); }

/* 5. Global @keyframes */
@keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
```

**Do NOT put in `styles.css`:** anything that only applies to one component — put it in that component's CSS file.

## Flex Patterns

```css
/* Push groups to opposite ends of a bar */
.toolbar          { display: flex; align-items: center; }
.toolbar-right    { margin-left: auto; display: flex; align-items: center; gap: 0.75rem; }

/* Element takes remaining space */
.main-content { flex: 1; min-width: 0; } /* min-width: 0 prevents text overflow */

/* Stack items vertically, each full width */
.list { display: flex; flex-direction: column; gap: 0.75rem; }
```

Never use an empty spacer `<div>` to push elements apart — use `margin-left: auto`.

## Grid Patterns

```css
/* Equal columns */
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }

/* Auto-fit responsive grid */
.card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }

/* Asymmetric layout (content + sidebar) */
.detail-layout { display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem; align-items: start; }

@media (max-width: 768px) {
  .grid-2, .grid-3, .grid-4, .detail-layout { grid-template-columns: 1fr; }
}
```

## Inline Style Exception

`style="..."` is banned for static values. Only allowed when the value comes from dynamic data:

```html
<!-- ❌ static -->
<div style="display: flex; gap: 0.5rem;">

<!-- ✅ dynamic data -->
<div [style.background]="item.color">
<div [style.width.%]="progress()">
```

## Diagnostics — Common Problems

| Symptom | Cause | Fix |
|---------|-------|-----|
| Component doesn't fill width | Missing `:host { display: block }` | Add it as first line of component CSS |
| Page content not centered | Missing `.page-body` or wrong `max-width` | Apply the `.page-body` pattern |
| Icon invisible | Using `pi pi-*` font icon | Replace with SVG inline using `stroke="currentColor"` |
| `p-button` won't go full width | PrimeNG host is inline + internal directive | Wrap in `.btn-wrap { display: grid }` |
| `p-password` narrower than inputs | Host `display: inline` | `p-password { display: block; width: 100% }` |
| Signal doesn't update template | Missing `()` when reading signal | `{{ count() }}` not `{{ count }}` |
| Two groups not at opposite ends | Missing `margin-left: auto` | Add `margin-left: auto` to the right group |
| Component collapses to inline | Custom element defaults to `display: inline` | `:host { display: block }` |
| PrimeNG override ignored | Written in component CSS, but element is in `<body>` | Move override to `styles.css` |
