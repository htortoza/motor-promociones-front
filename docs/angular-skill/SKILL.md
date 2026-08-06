---
name: angular-zoneless-signals
description: Angular 21 Zoneless + Signals + PrimeNG 21 best practices. CSS architecture where components own all visual styles and pages only provide structural layout. Use before creating any component, page, service, or CSS file.
---

# Angular 21 — Best Practices

**Stack:** Angular 21 · Zoneless · Signals · Standalone · PrimeNG 21 · No Tailwind · No PrimeFlex · No Zone.js

## CSS Philosophy — The Core Rule

> **Components own all visual styles. Pages only position components.**

| Layer | Owns | Does NOT own |
|-------|------|-------------|
| **Component CSS** | All visual appearance: color, typography, spacing, borders, shadow | Nothing about where it sits on the page |
| **Page CSS** | Layout only: grid/flex structure to place components, gaps, max-width | Visual styling of any kind |

A page that needs to style something inside a component has a design problem — extract a variant prop instead.

## Angular Rules (non-negotiable)

- `standalone: true` + `ChangeDetectionStrategy.OnPush` on every component
- `provideZonelessChangeDetection()` in `app.config.ts` — no `zone.js`
- `inject()` over constructor injection
- `signal()` / `computed()` for all state — no `BehaviorSubject`, no `Subject`
- `@if` / `@for` / `@switch` — no `*ngIf` / `*ngFor`
- Signals always read with `()` in templates
- Lazy `loadComponent` for all routes

## CSS Rules (non-negotiable)

- Every component CSS starts with `:host { display: block }`
- No utility classes (no `.mt-4`, `.flex-row`, `.text-sm`)
- No static `style="..."` in templates
- Tokens `var(--p-*)` from PrimeNG or custom design tokens — never hardcoded hex
- `::ng-deep` is banned — use `styles.css` for PrimeNG overrides

## Minimum Page CSS Pattern

```css
/* page.component.css — only this, nothing more unless justified */
:host {
  display: block;
  min-height: 100vh;
}

.page-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: grid;
  gap: 1.5rem;
}
```

```html
<!-- page.component.html -->
<app-header />
<main class="page-layout">
  <app-some-component />
  <app-another-component />
</main>
```

The page only asks: *where do components go?* It never asks: *what do they look like?*

## Component Skeleton

```typescript
@Component({
  selector: 'app-name',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [/* only what's used */],
  templateUrl: './name.component.html',
  styleUrl:    './name.component.css',
})
export class NameComponent {
  private readonly service = inject(NameService);
  items    = signal<Item[]>([]);
  loading  = signal(false);
  count    = computed(() => this.items().length);
}
```

## Pre-flight Checklist

Before delivering any component or page:

- [ ] Component: `standalone`, `OnPush`, `inject()`, `signal()`, `@if`/`@for`
- [ ] Component CSS: `:host { display: block }`, semantic classes, design tokens
- [ ] Component CSS: zero utility classes, zero static inline styles
- [ ] Page CSS: layout/structure only — color, font, spacing belong in components
- [ ] Consulted PrimeNG MCP before using any new PrimeNG component
- [ ] Signals read with `()` in template

## References

- `references/css-architecture.md` — CSS patterns in depth, component vs page, token usage
- `references/angular-patterns.md` — Signals, services, routing, forms, HTTP patterns
- `references/primeng.md` — PrimeNG 21 component rules, MCP usage, common fixes
