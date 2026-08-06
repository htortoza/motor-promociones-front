# PrimeNG 21

## Always Query the MCP First

Before implementing any component, form, or layout, query the **PrimeNG MCP Server**:

```
get_component("button")
search_components("form input")
get_usage_example("datatable")
```

PrimeNG 21 has structural changes from v17/v18. Don't rely on memory.

## Layout Components

| Component | Use for |
|-----------|---------|
| `<p-fluid>` | Full-width inputs — replaces `class="w-full"` |
| `<p-card>` | Content containers |
| `<p-toolbar>` | Toolbars with filters/actions |
| `<p-panel>` | Collapsible sections |
| `<p-splitter>` | Split layouts |

## Full-Width Inputs — use `<p-fluid>`

```html
<!-- ✅ -->
<p-fluid>
  <input pInputText [(ngModel)]="value" />
  <p-select [options]="opts" [(ngModel)]="selected" />
</p-fluid>

<!-- ❌ -->
<input pInputText class="w-full" />
```

## PrimeTemplate Import

Required when using `pTemplate="header"`, `pTemplate="footer"`, etc.:

```typescript
import { PrimeTemplate } from 'primeng/api';

@Component({
  imports: [Card, PrimeTemplate],  // add PrimeTemplate
})
```

## Icons — SVG Inline Only

PrimeIcons font files don't load reliably with Angular 21's esbuild:

```html
<!-- ✅ SVG inline — inherits color via currentColor -->
<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
  <path d="M12 5v14M5 12l7-7 7 7"/>
</svg>

<!-- ❌ font icon — unreliable -->
<i class="pi pi-arrow-up"></i>
```

`stroke="currentColor"` means the icon automatically follows the parent's color, including hover and disabled states.

## Common Host Fixes

Some PrimeNG components default to `display: inline`. Fix in the component's CSS:

```css
/* When p-iconfield is inside flex/grid */
p-iconfield { display: block; }

/* p-password narrower than other inputs */
p-password { display: block; width: 100%; }

/* p-button not filling available width */
.btn-wrap { display: grid; }  /* child stretches as grid item */
```

## PrimeNG Overrides

Don't use `::ng-deep` — it's deprecated. Put overrides in `styles.css`:

```css
/* styles.css */
.p-inputtext { border-radius: 8px; }
.p-button    { font-weight: 500; }
```

For per-instance styles, use `styleClass` or `inputStyleClass` props:

```html
<p-button styleClass="my-custom-btn" />
<p-password inputStyleClass="my-input" />
```

## Common Component Imports

```typescript
// Forms
import { InputText }    from 'primeng/inputtext';
import { Password }     from 'primeng/password';
import { Select }       from 'primeng/select';
import { Textarea }     from 'primeng/textarea';
import { Checkbox }     from 'primeng/checkbox';
import { RadioButton }  from 'primeng/radiobutton';
import { Fluid }        from 'primeng/fluid';

// Buttons
import { Button }       from 'primeng/button';

// Data
import { Table }        from 'primeng/table';
import { DataView }     from 'primeng/dataview';

// Overlay
import { Dialog }       from 'primeng/dialog';
import { Popover }      from 'primeng/popover';
import { Toast }        from 'primeng/toast';

// Display
import { Tag }          from 'primeng/tag';
import { Badge }        from 'primeng/badge';
import { Avatar }       from 'primeng/avatar';
import { Card }         from 'primeng/card';
import { Toolbar }      from 'primeng/toolbar';
import { ProgressSpinner } from 'primeng/progressspinner';

// Always for pTemplate
import { PrimeTemplate } from 'primeng/api';
```

## MessageService (Toast)

Must be provided at app level:

```typescript
// app.config.ts
providers: [MessageService, ...]

// component
private readonly msg = inject(MessageService);

this.msg.add({ severity: 'success', summary: 'Saved', detail: 'Record updated.' });
```

## Severity Reference

| Value | Color | Use for |
|-------|-------|---------|
| `success` | Green | Completed actions |
| `info` | Blue | Neutral info |
| `warn` | Amber | Warnings |
| `error` | Red | Errors |
| `secondary` | Gray | Neutral/inactive |
| `contrast` | Inverted | Special emphasis |
