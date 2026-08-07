# Pantalla de Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pantalla `/login` decorativa (sin auth real) que se interpone antes de `''`/`giftcards`/`accesos-externos`/`mi-lote` una vez por sesión de pestaña, con diseño de marca (DOT Solutions / Motor de Promociones) inspirado en la referencia aprobada — split-screen, vectores de giftcards, glass card.

**Architecture:** `SesionService` gana un flag `autenticado` (signal en memoria, sin persistencia). Un guard nuevo `autenticadoGuard` se antepone a los guards existentes en las rutas protegidas y redirige a `/login` si el flag está en `false`. El botón "Ingresar" de `LoginScreen` llama `iniciarSesion()` y renavega a `/`, dejando que los guards existentes (`rolRedirectGuard`, etc.) resuelvan el destino de siempre.

**Tech Stack:** Angular 21 (Zoneless, Signals, standalone), PrimeNG 21 (`InputText`, `Password`, `Button`), CSS con tokens `var(--p-...)` (paleta completa de PrimeUIX: `emerald`, `violet`, `slate`, confirmada en `@primeuix/styled` — shades `0/50/100/200/300/400/500/600/700/800/900/950`), Vitest.

## Global Constraints

- Sin auth real, sin validación de credenciales — cualquier valor en los campos permite ingresar.
- El login **no persiste** entre reloads (signal en memoria) — se pide una vez por sesión de pestaña.
- No reemplaza `SesionSwitcher` ni el modelo de roles — capa ortogonal.
- Sin Tailwind/clases utilitarias/estilos inline estáticos — todo en `login-screen.css` con `var(--p-...)`. Las excepciones de transparencia (`rgba(255,255,255,.08)` para el efecto glass, y los colores de los vectores SVG que no son marca sino decoración) son aceptables como valores estructurales, no de marca.
- `ChangeDetectionStrategy.OnPush` en `LoginScreen`, control flow moderno (`@for`), `FormsModule` para los `[ngModel]`/`(ngModelChange)`.
- Logo real no existe — usar el glyph SVG geométrico simple ya validado en el mockup (cuadrado redondeado + signo "+").

---

## Task 1: `SesionService.autenticado` + `autenticadoGuard` + wiring de rutas

**Files:**
- Modify: `src/app/services/sesion.service.ts`
- Modify: `src/app/services/sesion.service.spec.ts`
- Create: `src/app/guards/autenticado.guard.ts`
- Create: `src/app/guards/autenticado.guard.spec.ts`
- Modify: `src/app/app.routes.ts`

**Interfaces:**
- Produces: `SesionService.autenticado(): boolean`, `SesionService.iniciarSesion(): void` — usados por el guard (este task) y por `LoginScreen` (Task 2).
- Produces: `autenticadoGuard: CanActivateFn` — antepuesto en `canActivate` de `''`, `giftcards`, `accesos-externos`, `mi-lote`.

- [ ] **Step 1: Escribir el test que falla — `SesionService.autenticado`**

En `src/app/services/sesion.service.spec.ts`, agregar dentro del `describe` existente:

```typescript
  it('arranca no autenticado, e iniciarSesion() lo marca true', () => {
    expect(service.autenticado()).toBe(false);
    service.iniciarSesion();
    expect(service.autenticado()).toBe(true);
  });
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `ng test --include='**/sesion.service.spec.ts'`
Expected: FAIL — `service.autenticado is not a function`

- [ ] **Step 3: Agregar el flag a `SesionService`**

En `src/app/services/sesion.service.ts`, reemplazar:

```typescript
@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly _sesion = signal<SesionState>(SESION_INICIAL);

  readonly rol = computed(() => this._sesion().rol);
```

por:

```typescript
@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly _sesion = signal<SesionState>(SESION_INICIAL);
  private readonly _autenticado = signal(false);

  readonly autenticado = this._autenticado.asReadonly();

  readonly rol = computed(() => this._sesion().rol);
```

Y agregar el método junto a `entrarComoInterno`/`entrarComoCompradorExterno`:

```typescript
  iniciarSesion(): void {
    this._autenticado.set(true);
  }
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `ng test --include='**/sesion.service.spec.ts'`
Expected: PASS (5 tests)

- [ ] **Step 5: Escribir el test que falla — `autenticadoGuard`**

Crear `src/app/guards/autenticado.guard.spec.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { autenticadoGuard } from './autenticado.guard';
import { SesionService } from '../services/sesion.service';

describe('autenticadoGuard', () => {
  let sesionService: SesionService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    sesionService = TestBed.inject(SesionService);
    router = TestBed.inject(Router);
  });

  it('redirige a /login si no hay sesión iniciada', () => {
    const resultado = TestBed.runInInjectionContext(() => autenticadoGuard({} as any, {} as any)) as UrlTree;
    expect(router.serializeUrl(resultado)).toBe('/login');
  });

  it('deja pasar si la sesión ya fue iniciada', () => {
    sesionService.iniciarSesion();
    expect(TestBed.runInInjectionContext(() => autenticadoGuard({} as any, {} as any))).toBe(true);
  });
});
```

- [ ] **Step 6: Correr el test y verificar que falla**

Run: `ng test --include='**/autenticado.guard.spec.ts'`
Expected: FAIL — `Cannot find module './autenticado.guard'`

- [ ] **Step 7: Implementar `autenticadoGuard`**

Crear `src/app/guards/autenticado.guard.ts`:

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from '../services/sesion.service';

export const autenticadoGuard: CanActivateFn = () => {
  const sesionService = inject(SesionService);
  const router = inject(Router);
  return sesionService.autenticado() ? true : router.parseUrl('/login');
};
```

- [ ] **Step 8: Correr el test y verificar que pasa**

Run: `ng test --include='**/autenticado.guard.spec.ts'`
Expected: PASS (2 tests)

- [ ] **Step 9: Wire de rutas**

Reemplazar `src/app/app.routes.ts` completo:

```typescript
import { Routes } from '@angular/router';
import { autenticadoGuard } from './guards/autenticado.guard';
import { rolRedirectGuard } from './guards/rol-redirect.guard';
import { soloInternoGuard } from './guards/solo-interno.guard';
import { soloAdministradorHoldingGuard } from './guards/solo-administrador-holding.guard';
import { soloCompradorExternoGuard } from './guards/solo-comprador-externo.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login-screen/login-screen').then((m) => m.LoginScreen),
  },
  { path: '', pathMatch: 'full', canActivate: [autenticadoGuard, rolRedirectGuard], children: [] },
  {
    path: 'giftcards',
    canActivate: [autenticadoGuard, soloInternoGuard],
    loadComponent: () => import('./components/giftcard/giftcard-list/giftcard-list').then((m) => m.GiftcardList),
  },
  {
    path: 'accesos-externos',
    canActivate: [autenticadoGuard, soloInternoGuard, soloAdministradorHoldingGuard],
    loadComponent: () => import('./components/giftcard/acceso-externo-list/acceso-externo-list').then((m) => m.AccesoExternoList),
  },
  {
    path: 'mi-lote',
    canActivate: [autenticadoGuard, soloCompradorExternoGuard],
    loadComponent: () => import('./components/giftcard/portal-externo/portal-externo').then((m) => m.PortalExterno),
  },
];
```

(`LoginScreen` todavía no existe — se crea en Task 2. El build fallará hasta completar ese task; no correr `ng build` en este paso, solo los tests de guards/servicio.)

- [ ] **Step 10: Commit**

```bash
git add src/app/services/sesion.service.ts src/app/services/sesion.service.spec.ts src/app/guards/autenticado.guard.ts src/app/guards/autenticado.guard.spec.ts src/app/app.routes.ts
git commit -m "feat(login): SesionService.autenticado + autenticadoGuard antepuesto a rutas protegidas"
```

---

## Task 2: `LoginScreen` — componente, contenido de marca y estilos

**Files:**
- Create: `src/app/components/login/login-screen/login-screen.ts`
- Create: `src/app/components/login/login-screen/login-screen.html`
- Create: `src/app/components/login/login-screen/login-screen.css`
- Test: `src/app/components/login/login-screen/login-screen.spec.ts`

**Interfaces:**
- Consumes: `SesionService.iniciarSesion()` (Task 1), `Router.navigateByUrl` (Angular Router).

- [ ] **Step 1: Escribir el test que falla**

Crear `src/app/components/login/login-screen/login-screen.spec.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { LoginScreen } from './login-screen';
import { SesionService } from '../../../services/sesion.service';

describe('LoginScreen', () => {
  let fixture: ComponentFixture<LoginScreen>;
  let component: LoginScreen;
  let sesionService: SesionService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LoginScreen], providers: [provideRouter([])] }).compileComponents();
    fixture = TestBed.createComponent(LoginScreen);
    component = fixture.componentInstance;
    sesionService = TestBed.inject(SesionService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('ingresar() marca la sesión como autenticada y navega a la raíz', () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');
    component.ingresar();
    expect(sesionService.autenticado()).toBe(true);
    expect(navigateSpy).toHaveBeenCalledWith('/');
  });

  it('ingresar() funciona sin importar el contenido de los campos (decorativo, sin validación)', () => {
    component.usuario.set('');
    component.clave.set('');
    component.ingresar();
    expect(sesionService.autenticado()).toBe(true);
  });

  it('muestra los 5 niveles de acceso como chips', () => {
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Master');
    expect(texto).toContain('Administrador Holding');
    expect(texto).toContain('Administrador Tienda');
    expect(texto).toContain('Usuario POS');
    expect(texto).toContain('Comprador Externo');
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `ng test --include='**/login-screen.spec.ts'`
Expected: FAIL — `Cannot find module './login-screen'`

- [ ] **Step 3: Implementar `LoginScreen` (TypeScript)**

Crear `src/app/components/login/login-screen/login-screen.ts`:

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { SesionService } from '../../../services/sesion.service';

const NIVELES_ACCESO: string[] = ['Master', 'Administrador Holding', 'Administrador Tienda', 'Usuario POS', 'Comprador Externo'];

@Component({
  selector: 'app-login-screen',
  imports: [FormsModule, InputText, Password, Button],
  templateUrl: './login-screen.html',
  styleUrl: './login-screen.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginScreen {
  private readonly sesionService = inject(SesionService);
  private readonly router = inject(Router);

  readonly nivelesAcceso = NIVELES_ACCESO;
  readonly usuario = signal('');
  readonly clave = signal('');

  ingresar(): void {
    this.sesionService.iniciarSesion();
    this.router.navigateByUrl('/');
  }
}
```

- [ ] **Step 4: Implementar el template**

Crear `src/app/components/login/login-screen/login-screen.html`:

```html
<div class="login-screen">
  <section class="login-marca">
    <svg class="login-marca__grid" aria-hidden="true">
      <defs>
        <pattern id="loginGrid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0H0V28" fill="none" stroke="white" stroke-width="0.6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#loginGrid)" />
    </svg>

    <svg class="login-marca__vectores" viewBox="0 0 230 230" aria-hidden="true">
      <g transform="rotate(-8 115 115)">
        <rect x="35" y="70" width="150" height="95" rx="14" class="login-vector login-vector--cyan" />
      </g>
      <g transform="rotate(6 115 115)">
        <rect x="45" y="55" width="150" height="95" rx="14" class="login-vector login-vector--violet" />
        <circle cx="170" cy="70" r="14" class="login-vector__moneda" />
        <path d="M164 70h12M170 64v12" class="login-vector__moneda-signo" />
      </g>
      <g transform="rotate(-3 115 115)">
        <rect x="55" y="45" width="150" height="95" rx="14" class="login-vector login-vector--emerald" />
        <line x1="55" y1="80" x2="205" y2="80" class="login-vector__linea" />
        <text x="70" y="70" class="login-vector__texto">GIFTCARD</text>
        <text x="70" y="120" class="login-vector__monto">$20.000</text>
      </g>
    </svg>

    <div class="login-marca__contenido">
      <div>
        <div class="login-wordmark">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="22" height="22" rx="6" class="login-wordmark__fondo" />
            <path d="M7 12h10M12 7v10" class="login-wordmark__signo" />
          </svg>
          <div>
            <div class="login-wordmark__nombre">Motor de Promociones</div>
            <div class="login-wordmark__subtitulo">BY DOT SOLUTIONS</div>
          </div>
        </div>

        <h1 class="login-headline">
          Toda tu gobernanza<br />
          de giftcards.<br />
          <span class="login-headline__acento">En un solo panel.</span>
        </h1>
        <p class="login-descripcion">
          Activa, asigna y controla giftcards y campañas en toda tu red de tiendas — con roles y accesos externos acotados por diseño.
        </p>

        <ul class="login-features">
          <li class="login-feature">
            <span class="login-feature__icono">🔒</span>
            <div>
              <div class="login-feature__titulo">Activación segura</div>
              <div class="login-feature__detalle">Códigos vigentes se activan solo cuando corresponde, con SID trazable.</div>
            </div>
          </li>
          <li class="login-feature">
            <span class="login-feature__icono">🏢</span>
            <div>
              <div class="login-feature__titulo">Gobernanza por holding</div>
              <div class="login-feature__detalle">Visibilidad acotada por tienda, holding o comprador externo.</div>
            </div>
          </li>
          <li class="login-feature">
            <span class="login-feature__icono">🤝</span>
            <div>
              <div class="login-feature__titulo">Acceso externo controlado</div>
              <div class="login-feature__detalle">Comparte lotes con compradores B2B sin exponer el resto del sistema.</div>
            </div>
          </li>
        </ul>
      </div>

      <div class="login-roles">
        <div class="login-roles__label">Un panel, cinco niveles de acceso</div>
        <div class="login-roles__chips">
          @for (nivel of nivelesAcceso; track nivel) {
            <span class="login-chip">{{ nivel }}</span>
          }
        </div>
      </div>
    </div>
  </section>

  <section class="login-form">
    <div class="login-card">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="login-card__icono">
        <rect x="1" y="1" width="22" height="22" rx="6" class="login-wordmark__fondo" />
        <path d="M7 12h10M12 7v10" class="login-wordmark__signo" />
      </svg>

      <h2 class="login-card__titulo">Bienvenido <span class="login-headline__acento">de vuelta</span></h2>
      <p class="login-card__subtitulo">Ingresa con tu cuenta para administrar giftcards, campañas y accesos.</p>

      <label class="login-card__campo">
        Usuario
        <input pInputText type="text" [ngModel]="usuario()" (ngModelChange)="usuario.set($event)" placeholder="nombre@dotsolutions.io" [fluid]="true" />
      </label>

      <label class="login-card__campo">
        Contraseña
        <p-password [ngModel]="clave()" (ngModelChange)="clave.set($event)" [toggleMask]="true" [feedback]="false" [fluid]="true" />
      </label>

      <p-button label="Ingresar" class="login-card__boton" [fluid]="true" (onClick)="ingresar()" />

      <p class="login-card__nota">Acceso interno — sin registro público.</p>
    </div>
  </section>
</div>
```

- [ ] **Step 5: Implementar los estilos**

Crear `src/app/components/login/login-screen/login-screen.css`:

```css
.login-screen {
  min-height: 100vh;
  display: flex;
  flex-wrap: wrap;
}

.login-marca {
  position: relative;
  flex: 1 1 55%;
  min-width: 320px;
  overflow: hidden;
  padding: 3rem 2.5rem;
  display: flex;
  color: var(--p-surface-0);
  background:
    radial-gradient(circle at 15% 15%, color-mix(in srgb, var(--p-emerald-500) 35%, transparent), transparent 40%),
    radial-gradient(circle at 85% 75%, color-mix(in srgb, var(--p-violet-600) 30%, transparent), transparent 45%),
    linear-gradient(135deg, var(--p-emerald-950) 0%, var(--p-slate-900) 100%);
}

.login-marca__grid {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.15;
}

.login-marca__vectores {
  position: absolute;
  right: 1rem;
  bottom: -0.5rem;
  width: 230px;
  height: 230px;
}

.login-vector {
  opacity: 0.9;
}

.login-vector--cyan {
  fill: var(--p-cyan-700);
  opacity: 0.55;
}

.login-vector--violet {
  fill: var(--p-violet-600);
  opacity: 0.85;
}

.login-vector--emerald {
  fill: var(--p-emerald-500);
}

.login-vector__moneda {
  fill: var(--p-amber-400);
}

.login-vector__moneda-signo {
  stroke: var(--p-violet-600);
  stroke-width: 2;
  stroke-linecap: round;
}

.login-vector__linea {
  stroke: white;
  stroke-opacity: 0.4;
  stroke-dasharray: 4 4;
}

.login-vector__texto {
  fill: white;
  font-size: 11px;
  font-weight: 700;
}

.login-vector__monto {
  fill: white;
  font-size: 14px;
  font-weight: 700;
}

.login-marca__contenido {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
}

.login-wordmark {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.login-wordmark__fondo {
  fill: var(--p-emerald-500);
}

.login-wordmark__signo {
  stroke: var(--p-emerald-950);
  stroke-width: 2;
  stroke-linecap: round;
}

.login-wordmark__nombre {
  font-weight: 700;
  font-size: 0.95rem;
}

.login-wordmark__subtitulo {
  font-size: 0.65rem;
  opacity: 0.65;
  letter-spacing: 0.05em;
}

.login-headline {
  margin-top: 2rem;
  font-size: 1.7rem;
  font-weight: 700;
  line-height: 1.25;
}

.login-headline__acento {
  color: var(--p-emerald-300);
}

.login-descripcion {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  opacity: 0.75;
  max-width: 26rem;
  line-height: 1.5;
}

.login-features {
  margin-top: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  list-style: none;
  padding: 0;
}

.login-feature {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
}

.login-feature__icono {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.45rem;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.login-feature__titulo {
  font-size: 0.8rem;
  font-weight: 600;
}

.login-feature__detalle {
  font-size: 0.7rem;
  opacity: 0.65;
}

.login-roles {
  margin-top: 1.5rem;
  padding-top: 0.9rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.login-roles__label {
  font-size: 0.6rem;
  opacity: 0.6;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 0.6rem;
}

.login-roles__chips {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.login-chip {
  font-size: 0.65rem;
  background: rgba(255, 255, 255, 0.12);
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
}

.login-form {
  flex: 1 1 45%;
  min-width: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background:
    radial-gradient(circle at 15% 15%, color-mix(in srgb, var(--p-emerald-500) 35%, transparent), transparent 40%),
    radial-gradient(circle at 85% 75%, color-mix(in srgb, var(--p-violet-600) 30%, transparent), transparent 45%),
    linear-gradient(135deg, var(--p-emerald-950) 0%, var(--p-slate-900) 100%);
}

.login-card {
  width: 100%;
  max-width: 22rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--p-border-radius-xl, 16px);
  padding: 1.75rem 1.5rem;
  backdrop-filter: blur(14px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  color: var(--p-surface-0);
}

.login-card__icono {
  margin-bottom: 0.6rem;
}

.login-card__titulo {
  font-size: 1.1rem;
  font-weight: 700;
}

.login-card__subtitulo {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 0.4rem;
  line-height: 1.4;
}

.login-card__campo {
  display: block;
  margin-top: 1.1rem;
  font-size: 0.7rem;
  opacity: 0.85;
}

.login-card__campo input,
.login-card__campo p-password {
  margin-top: 0.3rem;
}

.login-card__boton {
  display: block;
  margin-top: 1.2rem;
}

.login-card__nota {
  text-align: center;
  margin-top: 0.9rem;
  font-size: 0.65rem;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .login-marca {
    padding: 2rem 1.5rem;
  }

  .login-features,
  .login-marca__vectores {
    display: none;
  }
}
```

Nota: el selector `p-password` en `.login-card__campo p-password` apunta al elemento host del componente (no perfora su encapsulación) — Angular aplica el scoping del padre a ese tag igual que a `input`, sin necesitar `::ng-deep`.

- [ ] **Step 6: Correr el test y verificar que pasa**

Run: `ng test --include='**/login-screen.spec.ts'`
Expected: PASS (3 tests)

- [ ] **Step 7: Build completo**

Run: `ng build`
Expected: build exitoso (el warning de presupuesto ya preexistente puede crecer un poco por el nuevo componente — no es un error).

- [ ] **Step 8: Correr toda la suite**

Run: `ng test`
Expected: PASS — toda la suite (incluidas Tasks 1 y 2) en verde.

- [ ] **Step 9: QA manual en browser**

Levantar `ng serve`, navegar a `http://localhost:4200/` con la pestaña recién abierta (sin `autenticado`):
1. Debe redirigir a `/login` — confirmar visualmente el split-screen, vectores, glass card.
2. Cargar cualquier valor en usuario/contraseña (o dejarlos vacíos) y click "Ingresar" — debe navegar a `/giftcards` (rol por defecto `administrador-holding`).
3. Navegar manualmente a `http://localhost:4200/mi-lote` en una pestaña nueva (sin autenticar) — debe redirigir a `/login`, no a `/giftcards` (confirma que `autenticadoGuard` corre antes que `soloCompradorExternoGuard`).
4. Cambiar de rol en el `SesionSwitcher` del sidebar tras haber iniciado sesión — no debe volver a pedir login (el flag `autenticado` no se resetea al cambiar de rol).
5. Verificar responsive: achicar la ventana bajo 768px, confirmar que el panel de marca colapsa arriba y oculta features/vectores, dejando headline + chips + form.

- [ ] **Step 10: Commit**

```bash
git add src/app/components/login/
git commit -m "feat(login): pantalla de login decorativa con marca DOT Solutions / Motor de Promociones"
```

---

## Resumen de cobertura vs. la spec de diseño

| Sección de la spec | Task(s) |
|---|---|
| §2 Mecánica (guard, signal, orden) | 1 |
| §3 Panel izquierdo (marca, headline, features, chips, vectores) | 2 |
| §3 Panel derecho (glass card, campos, botón, nota) | 2 |
| §4 Responsive | 2 (Step 5, media query) |
| §5 Fuera de alcance (sin validación, sin "olvidé mi contraseña", sin logo real) | 2 |
