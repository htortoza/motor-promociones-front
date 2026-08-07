# Pantalla de Login — Diseño

**Proyecto:** Motor de Promociones · Motor-front-web
**Estado:** aprobado en brainstorming (mockup visual validado 2026-08-07)

## 1. Propósito y alcance

Pantalla de entrada decorativa con form usuario/contraseña **mock** (no valida nada, no hay backend de auth). Reemplaza el acceso directo a la app: hoy `''` redirige según rol vía `rolRedirectGuard`; ahora antes de eso se exige haber "iniciado sesión" una vez por sesión de pestaña.

No reemplaza el selector de rol del sidebar (`SesionSwitcher`) — ese sigue simulando qué rol/empresa/acceso externo está activo, como hoy. El login es una capa nueva, ortogonal.

## 2. Mecánica (routing + estado)

- `SesionService` gana:
  - `private readonly _autenticado = signal(false)`
  - `readonly autenticado = this._autenticado.asReadonly()`
  - `iniciarSesion(): void` → `this._autenticado.set(true)`
- Nuevo guard `autenticadoGuard` (`src/app/guards/autenticado.guard.ts`): si `!sesionService.autenticado()` → `router.parseUrl('/login')`; si no, `true`.
- Se agrega **primero** en el array `canActivate` de las rutas `''`, `giftcards`, `accesos-externos`, `mi-lote` (antes de los guards existentes — Angular evalúa en orden y corta en el primer `false`/`UrlTree`).
- Nueva ruta `login` (`loadComponent` a `LoginScreen`), sin guard (siempre accesible).
- `LoginScreen.ingresar()`: llama `sesionService.iniciarSesion()` y luego `router.navigateByUrl('/')` — desde ahí el flujo de guards de siempre decide destino según rol.
- **No persiste entre reloads** (signal en memoria) — decisión ya tomada: dura mientras la pestaña esté abierta.

## 3. Estructura del componente

`src/app/components/login/login-screen/` — standalone, **no usa `AppShell`** (pantalla completa, ruta hermana de nivel raíz, no hija de ningún shell con sidebar).

Layout split-screen (2 columnas en desktop, columna única apilada en mobile):

- **Panel izquierdo — marca/producto** (`~55%` ancho):
  - Wordmark: icono cuadrado redondeado (fondo `var(--p-primary-500)`, glyph "+" simple) + "Motor de Promociones" + subtítulo pequeño "BY DOT SOLUTIONS".
  - Headline de 2 líneas + una 3ª línea en color de acento: *"Toda tu gobernanza de giftcards. En un solo panel."* (la 3ª línea con `var(--p-primary-300)` o similar tono claro sobre fondo oscuro).
  - Descripción corta (1 línea, ~2 renglones máx).
  - 3 features con icono + título + descripción, extraídos directamente de lo ya construido (no copy genérico):
    1. **Activación segura** — códigos vigentes se activan solo cuando corresponde, con SID trazable.
    2. **Gobernanza por holding** — visibilidad acotada por tienda, holding o comprador externo.
    3. **Acceso externo controlado** — comparte lotes con compradores B2B sin exponer el resto del sistema.
  - Separador + label "UN PANEL, CINCO NIVELES DE ACCESO" + 5 chips (uno por `Rol`: Master, Administrador Holding, Administrador Tienda, Usuario POS, Comprador Externo) — reutiliza las mismas etiquetas que `SesionSwitcher.OPCIONES_ROL`, no un enum nuevo.
  - Tag de versión: string fijo `"MVP · Gobernanza Giftcard"` (decidido — no viene de `package.json`).
  - Vectores decorativos: 2-3 giftcards SVG apiladas con leve rotación (colores `var(--p-primary-...)`, violeta y dorado de acento), esquina inferior derecha del panel, sin recorte del contenido de texto.
  - Fondo: gradiente oscuro (`var(--p-primary-900)`/slate) + dos radiales de color (verde y violeta, baja opacidad) + patrón de grid SVG sutil (stroke blanco, opacidad ~0.1-0.15).

- **Panel derecho — form** (`~45%` ancho): mismo fondo con textura que el panel izquierdo (continúa el gradiente, no es un bloque blanco separado), centrado verticalmente:
  - Card **glass**: `background: rgba(255,255,255,.08-.12)`, `border: 1px solid rgba(255,255,255,.15-.2)`, `backdrop-filter: blur(12-16px)`, `border-radius` grande (`var(--p-border-radius-xl)` o 16px), sombra suave.
  - Dentro: icono pequeño (mismo wordmark-glyph), título *"Bienvenido **de vuelta**"* (segunda parte en acento), subtítulo corto.
  - Campo "Usuario" (PrimeNG `InputText`), campo "Contraseña" (PrimeNG `Password`, con toggle mostrar/ocultar — prop `[toggleMask]="true"` de PrimeNG).
  - Botón "Ingresar" ancho completo, color `var(--p-primary-color)`.
  - Nota pequeña debajo: *"Acceso interno — sin registro público."*
  - **Sin validación real**: cualquier valor (incluso vacío) en los campos permite ingresar — es decorativo. El botón simplemente dispara `ingresar()`.

## 4. Responsive

Bajo un breakpoint (ej. `768px`), el split-screen pasa a columna única: panel de marca arriba (versión compacta — sin los 3 features detallados, solo headline + chips), panel de form abajo. Implementado con CSS (`@media`), no con lógica de componente.

## 5. Fuera de alcance (explícito)

- Sin backend, sin validación de credenciales, sin recuperación de contraseña real (el link "¿Olvidaste tu contraseña?" de la referencia **no se incluye** — no hay flujo detrás).
- No cambia `SesionSwitcher` ni el modelo de roles — el login es una capa de entrada, no reemplaza la simulación de sesión ya construida.
- Logo real de DOT Solutions no existe como asset — se usa un glyph geométrico simple en SVG, no un logo corporativo real.
