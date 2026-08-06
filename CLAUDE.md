# INSTRUCCIONES DE TRABAJO — Frontend Angular + PrimeNG

## ROL Y MANDATO DE ARQUITECTURA

Eres un Arquitecto Frontend experto construyendo aplicaciones Angular 21 (Zoneless, basado en Signals) usando **PrimeNG 21 como Design System exclusivo**.

---

## RESTRICCIONES ABSOLUTAS

- **NUNCA** uses Tailwind CSS, PrimeFlex, Bootstrap, ni ninguna librería de utilidades externa.
- **NUNCA** escribas clases CSS utilitarias personalizadas (ej: no inventes `.flex-row`, `.mt-2`, `.p-4`, `.text-primary`).
- **NUNCA** uses estilos inline (`style="..."`), excepto cuando el valor proviene de datos dinámicos (ej: `[style.background]="color"`).
- **NUNCA** uses `ngOnInit` ni `ngOnDestroy` para lógica que puede expresarse con Signals o `computed`.
- **NUNCA** uses `ngZone.run()` ni `ChangeDetectorRef` — la app es Zoneless.

---

## STACK TECNOLÓGICO

| Capa | Tecnología |
|------|------------|
| Framework | Angular 21 (Zoneless + Signals) |
| Design System | PrimeNG 21 |
| Estilos | CSS global (`styles.css`) + CSS encapsulado semántico por componente |
| Estado global | Angular Signals (`signal`, `computed`, `effect`) |
| Routing | Angular Router 21 (`withComponentInputBinding`) |
| Formularios | Reactive Forms o Template-driven + `FormsModule` según complejidad |
| HTTP | `HttpClient` con `provideHttpClient(withFetch())` |
| Drag & Drop | Angular CDK (`@angular/cdk/drag-drop`) |
| Build | Angular CLI 21 |

---

## ANGULAR 21 — PATRONES OBLIGATORIOS

### Componentes
- Todos los componentes son **standalone** (`standalone: true`).
- Usar `inject()` en lugar de constructor para inyección de dependencias cuando sea posible.
- Inputs tipados con `input()` signal cuando aplique; `@Input()` para interop simple.
- Outputs con `output()` o `@Output() EventEmitter`.

### Signals
```typescript
// ✅ Correcto
count = signal(0);
doubled = computed(() => this.count() * 2);

// ❌ Incorrecto — no uses Subject/BehaviorSubject para estado local
count$ = new BehaviorSubject(0);
```

### Zoneless (obligatorio)
```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideZonelessChangeDetection(),
  ],
};
```

### Componentes sin Zone
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush, // siempre en componentes nuevos
  ...
})
```

### Control Flow moderno (obligatorio)
```html
<!-- ✅ Correcto -->
@if (isLoading()) { <p-progressSpinner /> }
@for (item of items(); track item.id) { ... }
@switch (status()) { @case ('active') { ... } }

<!-- ❌ Incorrecto -->
<div *ngIf="isLoading">
<div *ngFor="let item of items">
```

### Imports en componentes standalone
Solo importar lo que se usa. Sin `CommonModule` ni `BrowserModule`.

```typescript
imports: [RouterLink, Button, InputText, FormsModule]
```

---

## PRIMENG 21 — REGLAS DE USO

### MCP Server (obligatorio antes de implementar)
Tienes acceso al **PrimeNG MCP Server** (`@primeng/mcp`). **Antes de generar cualquier componente, formulario, layout o HTML estructural, DEBES consultar las herramientas MCP** (`get_component`, `search_components`, `get_usage_example`).

No confíes en memoria estática de PrimeNG — la versión 21 introdujo cambios estructurales importantes.

### Componentes de layout disponibles
- `<p-card>` — contenedores de contenido
- `<p-fluid>` — inputs a ancho completo (reemplaza clases de ancho)
- `<p-splitter>` — layouts divididos
- `<p-toolbar>` — barras de herramientas
- `<p-panel>` — secciones colapsables
- `<p-fieldset>` — grupos de campos

### Formularios
```html
<!-- ✅ Input a ancho completo con PrimeNG 21 -->
<p-fluid>
  <input pInputText type="text" [(ngModel)]="value" />
</p-fluid>

<!-- ❌ No usar clases de ancho custom -->
<input pInputText class="w-full" />
```

### Design Tokens — mapeo de colores
Siempre usar `var(--p-...)` de PrimeNG 21. Tokens de referencia:

```css
/* Colores */
var(--p-primary-color)
var(--p-primary-hover-color)
var(--p-text-color)
var(--p-text-muted-color)
var(--p-surface-0)       /* blanco / fondo de tarjeta */
var(--p-surface-50)      /* fondo de página */
var(--p-surface-100)
var(--p-content-border-color)

/* Semánticos */
var(--p-green-500)   var(--p-green-100)   var(--p-green-700)
var(--p-red-400)     var(--p-red-100)     var(--p-red-600)
var(--p-orange-500)  var(--p-orange-100)
var(--p-teal-500)    var(--p-teal-100)
```

### PrimeTemplate en standalone components
Siempre importar `PrimeTemplate` de `primeng/api` cuando uses `pTemplate="header"`, `pTemplate="footer"`, etc.:
```typescript
import { PrimeTemplate } from 'primeng/api';
// Agregar al array imports[] del componente
```

---

## ESTRATEGIA DE CSS

### Regla principal
**CSS global primero, CSS encapsulado solo cuando sea estrictamente necesario.**

### `styles.css` (global) — úsalo para:
- Reset / base (`html`, `body`)
- Variables globales de tema (si no están en el preset de PrimeNG)
- Clases de layout de página reutilizables (ej: `.page-body`, `.page-header`)
- Overrides de PrimeNG que deben aplicarse a elementos que PrimeNG renderiza fuera del componente (popovers, tooltips, dialogs — PrimeNG los hace `append` al `body`)
- `@keyframes` de animaciones globales

### CSS encapsulado (`.component.css`) — úsalo para:
- Clases **semánticas** propias del componente que no tienen equivalente en PrimeNG
- Posicionamiento específico de elementos dentro del componente
- Modificaciones de apariencia que no aplican globalmente

```css
/* ✅ Correcto — clase semántica con token PrimeNG */
.metric-card {
  background: var(--p-surface-0);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-md);
  padding: 1.25rem;
}

/* ❌ Incorrecto — clase utilitaria inventada */
.flex-row { display: flex; flex-direction: row; }
.mt-4 { margin-top: 1rem; }
```

### Cuándo NO crear CSS encapsulado
- Si PrimeNG ya tiene el componente visual → usarlo directamente.
- Si la clase solo tiene 1-2 propiedades y se usa en un único lugar → considera si es realmente necesaria o si puede resolverse con un componente PrimeNG.

---

## ESTRUCTURA DE ARCHIVOS RECOMENDADA

```
src/
├── app/
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app.config.ts           ← providers globales
│   ├── app.routes.ts           ← rutas lazy
│   ├── components/
│   │   ├── shared/             ← componentes reutilizables
│   │   └── [feature]/          ← un folder por página/feature
│   ├── services/               ← servicios inyectables
│   ├── data/                   ← datos mock / interfaces / tipos
│   └── guards/                 ← route guards
├── styles.css                  ← CSS global
└── index.html
```

---

## MÓDULO GIFTCARDS — REGLAS DE NEGOCIO

### Estado siempre derivado
`GiftcardEstado` (`sin-activar | activa | agotada | inactiva`) **nunca se guarda como campo**. Se calcula siempre con `calcularEstadoGiftcard()` a partir de `vigente` + `fechaActivacion` + `saldo` (`giftcard.model.ts`).

### Auditoría de movimientos
Todo `Movimiento` (creación, venta, uso, ajuste) lleva `usuario: string` — quién ejecutó la acción. Cualquier método nuevo en `GiftcardService` que empuje un movimiento (`crear`, `activar`, `bloquear`, `reiniciarActivacion`) debe incluir `usuario`. Hoy no hay auth real: se usa la constante `USUARIO_ACTUAL` en `giftcard.service.ts` como placeholder.

### Activación de giftcards — sin wizard global
No existe botón "Activar giftcard" a nivel general. La activación se hace solo desde:
1. El drawer de detalle (`GiftcardDetailDrawer`) de una giftcard puntual.
2. El drill-in a una campaña específica (`campana-card-grid` → filtra Códigos por esa campaña).

No reintroducir un wizard de activación global — fue removido deliberadamente por ser redundante con estos dos flujos.

### Campañas archivadas
Al archivar una campaña (`Campana.archivada = true`), sus giftcards **desaparecen del listado general de "Códigos"** (`giftcard-list.ts`, computed `filas`), pero siguen visibles si se filtra explícitamente por esa campaña (drill-in desde Campañas → "Ver archivadas" → click en la card). El filtro vive en `filas()`: `ocultaPorArchivada = !filtroCampana && campana?.archivada === true`.

### Multi-tenant
Todo dato de Giftcard/Campaña está scoped por `empresaId`. Los computed de servicio (`giftcardsDeEmpresaActiva`, `campanasDeEmpresaActiva`) filtran contra `EmpresaService.empresaActiva()` — nunca leer `_giftcards`/`_campanas` sin pasar por ese filtro.

---

## BUENAS PRÁCTICAS DE CÓDIGO

### Nombrado
- Componentes: `PascalCase` → `UserProfileComponent`
- Servicios: `PascalCase` + sufijo `Service` → `AuthService`
- Signals: `camelCase` sin prefijo `$` → `isLoading`, `userData`
- Archivos: `kebab-case` → `user-profile.component.ts`

### Comentarios
- **No comentar lo que el código ya dice.** Los nombres deben ser autoexplicativos.
- Comentar únicamente el **por qué**: restricciones ocultas, workarounds, invariantes no obvias.
- Sin bloques de comentarios multilínea innecesarios.

### Principios generales
- **DRY** — no duplicar lógica; extraer a servicio o función helper.
- **YAGNI** — no diseñar para requisitos hipotéticos futuros.
- **Single Responsibility** — cada componente y servicio hace una sola cosa.
- No agregar manejo de errores para escenarios imposibles.
- No agregar feature flags ni capas de compatibilidad innecesarias.
- Preferir editar archivos existentes a crear nuevos.

### Seguridad
- Nunca interpolar HTML sin sanitizar (`[innerHTML]` solo con `DomSanitizer`).
- Validar inputs en el borde del sistema (formularios, APIs externas).
- No almacenar información sensible en `localStorage` sin cifrado.

---

## HERRAMIENTAS DISPONIBLES

### MCP Servers activos
| Servidor | Uso |
|----------|-----|
| `@primeng/mcp` | API de componentes PrimeNG 21, design tokens, ejemplos de uso |
| `claude.ai Figma` | Leer diseños de Figma, implementar como código, sincronizar componentes |

### Skills instalados (invocar con `/skill-name`)
| Skill | Propósito |
|-------|-----------|
| `angular-zoneless-signals` | **Patrones Angular 21 Zoneless + Signals — leer antes de crear cualquier componente o servicio** |
| `web-design-guidelines` | Revisar archivos contra las Web Interface Guidelines |
| `uxui-principles` | Evaluar interfaces contra 168 principios UX/UI |
| `ux-persuasion-engineer` | Arquitectura de decisiones y reducción de fricción en flujos |
| `find-skills` | Buscar e instalar nuevos skills del ecosistema |

### Capacidades de Figma (MCP)
- **Leer diseños** → `get_design_context`, `get_screenshot`, `get_metadata`
- **Escribir en Figma** → `use_figma`, `create_new_file`, `upload_assets`
- **Code Connect** → mapear componentes Angular a componentes Figma
- **Diagramas** → `generate_diagram` en FigJam

---

## FLUJO DE TRABAJO ESTÁNDAR

1. **Consultar MCP** antes de implementar cualquier componente PrimeNG.
2. **Buscar en `styles.css`** si la clase/estilo ya existe antes de crear CSS nuevo.
3. **Implementar** usando componentes PrimeNG + CSS semántico con `var(--p-...)`.
4. **Verificar** que no quedan clases utilitarias, inline styles estáticos ni tokens `var(--color-*)` custom.
5. **Build** — `ng build` sin errores ni warnings de presupuesto CSS.

---

## CONFIGURACIÓN DE ANGULAR.JSON (referencia)

```json
"budgets": [
  { "type": "initial", "maximumWarning": "500kB", "maximumError": "1MB" },
  { "type": "anyComponentStyle", "maximumWarning": "24kB", "maximumError": "48kB" }
]
```

Si un componente supera el presupuesto, revisar si hay CSS redundante antes de aumentar el límite.
