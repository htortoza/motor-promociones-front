# Angular 21 Patterns

## app.config.ts

```typescript
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
  ]
};
```

No `zone.js` in `polyfills`. No `provideZone()`.

## Component

```typescript
@Component({
  selector: 'app-name',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, InputText, FormsModule], // only what's used
  templateUrl: './name.component.html',
  styleUrl:    './name.component.css',
})
export class NameComponent {
  private readonly svc = inject(NameService);

  // inputs
  itemId = input<number>();
  title  = input.required<string>();

  // outputs
  selected = output<Item>();

  // state
  loading = signal(false);
  items   = signal<Item[]>([]);
  count   = computed(() => this.items().length);
}
```

Never: `ngOnInit`, `ngOnDestroy`, `ChangeDetectorRef`, `NgZone`, `BehaviorSubject`.

## Cleanup — DestroyRef and takeUntilDestroyed

```typescript
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class NameComponent {
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Option A — takeUntilDestroyed (RxJS interop)
    someObservable$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(val => this.value.set(val));

    // Option B — DestroyRef callback
    this.destroyRef.onDestroy(() => { /* cleanup */ });
  }
}
```

Use instead of `ngOnDestroy`. Works in `inject()` context (constructor or field initializers).

## Signals

```typescript
// mutable state
value = signal(0);
this.value.set(1);
this.value.update(v => v + 1);

// derived (auto-updates)
double = computed(() => this.value() * 2);

// side effect — only for external systems (localStorage, charts, maps)
constructor() {
  effect(() => localStorage.setItem('key', String(this.value())));
}
```

`effect()` is not a replacement for `computed()`. If you're deriving state, use `computed()`.

## Template

```html
@if (loading()) {
  <p-progressSpinner />
} @else if (items().length === 0) {
  <p>No items</p>
} @else {
  @for (item of items(); track item.id) {
    <app-item [item]="item" (selected)="onSelect($event)" />
  }
}

@switch (status()) {
  @case ('active')  { <span class="badge-active">Active</span> }
  @case ('pending') { <span class="badge-pending">Pending</span> }
  @default          { <span class="badge-default">–</span> }
}
```

Always read signals with `()`: `{{ count() }}`, `[disabled]="loading()"`.

## Service

```typescript
@Injectable({ providedIn: 'root' })
export class ItemsService {
  private readonly http = inject(HttpClient);

  private _items   = signal<Item[]>([]);
  private _loading = signal(false);

  readonly items   = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly count   = computed(() => this._items().length);

  load(): void {
    this._loading.set(true);
    this.http.get<Item[]>('/api/items').subscribe({
      next:  data => { this._items.set(data); this._loading.set(false); },
      error: _    => this._loading.set(false),
    });
  }

  add(item: Item): void {
    this._items.update(list => [...list, item]);
  }

  remove(id: number): void {
    this._items.update(list => list.filter(i => i.id !== id));
  }
}
```

Private mutable signals, public readonly signals. Components read, never mutate service state directly.

## Routing

```typescript
// app.routes.ts — always lazy
export const routes: Routes = [
  {
    path: 'items',
    loadComponent: () =>
      import('./pages/items/items.component').then(m => m.ItemsComponent),
  },
  { path: '', redirectTo: 'items', pathMatch: 'full' },
];
```

Read route params as inputs (requires `withComponentInputBinding`):

```typescript
// ✅ router injects param directly
id = input<string>();
```

## Forms

**Template-driven** (simple forms):
```html
<form #f="ngForm" (ngSubmit)="submit(f)">
  <p-fluid>
    <input pInputText name="title" [(ngModel)]="title" required />
  </p-fluid>
  <p-button type="submit" label="Save" [disabled]="f.invalid" />
</form>
```

**Reactive** (dynamic validation or complex forms):
```typescript
form = new FormGroup({
  title:    new FormControl('', [Validators.required, Validators.minLength(3)]),
  priority: new FormControl<'low'|'medium'|'high'>('medium'),
  tags:     new FormControl<string[]>([]),
});

onSubmit(): void {
  if (this.form.invalid) return;
  const data = this.form.getRawValue(); // fully typed
}
```

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <p-fluid>
    <input pInputText formControlName="title" />
    @if (form.controls.title.invalid && form.controls.title.touched) {
      <small class="input-error">Title is required</small>
    }
  </p-fluid>
  <p-button type="submit" label="Save" [disabled]="form.invalid" />
</form>
```

**Choose template-driven for:** simple CRUD forms, few fields, no cross-field validation.  
**Choose reactive for:** wizard steps, dynamic field arrays, complex validators, programmatic reset.

## HTTP + Signals

```typescript
// In service — standard approach
this.http.get<Item[]>('/api/items').subscribe({
  next:  data => this._items.set(data),
  error: err  => this._error.set(err.message),
});

// In component — Signal directly from Observable
items = toSignal(this.http.get<Item[]>('/api/items'), { initialValue: [] });

// Signal → Observable (for RxJS interop)
import { toObservable } from '@angular/core/rxjs-interop';
items$ = toObservable(this.items);
```

## File Structure

```
src/
├── app/
│   ├── app.ts / app.html / app.css
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── components/shared/   ← reusable components
│   ├── pages/               ← one folder per route
│   ├── services/
│   └── data/
│       ├── models/          ← TypeScript interfaces
│       └── mock/            ← mock data
└── styles.css               ← global tokens + PrimeNG overrides
```

Three files per component (`.ts` / `.html` / `.css`), no exceptions.

## Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `UserProfileComponent` |
| Services | PascalCase + `Service` | `AuthService` |
| Signals | camelCase, no `$` | `isLoading`, `items` |
| Files | kebab-case | `user-profile.component.ts` |
| CSS classes | kebab-case semantic | `.metric-card`, `.status-badge` |
