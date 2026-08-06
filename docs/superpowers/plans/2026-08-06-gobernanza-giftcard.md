# Gobernanza y Multi-tenencia Giftcard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar en el frontend Angular (mock, sin backend) el modelo de gobernanza validado en `docs/doc-product/Giftcard_Gobernanza_Multitenencia_v1.0.md`: 5 roles (Master, Administrador Holding, Administrador Tienda, Usuario POS, Comprador Externo), jerarquía de holding en `Empresa`, y el flujo de acceso externo acotado a un recurso (lote/campaña) con expiración.

**Architecture:** Un enum de rol único (`Rol`) con alcance del Comprador Externo modelado genéricamente (`tipo_recurso + id_recurso`, no específico de giftcard). Un nuevo `SesionService` simula la sesión activa (sin auth real, mismo patrón que `USUARIO_ACTUAL` hoy). `EmpresaService` resuelve qué empresas puede ver/seleccionar la sesión según su rol, y si la empresa activa es un holding (agregado) o una tienda puntual (drill-down). `GiftcardService`/`CampanaService` consumen ese alcance sin conocer roles. `AccesoExternoService` gestiona las cuentas de comprador externo como una entidad separada. Guards de ruta aplican el aislamiento (comprador externo nunca navega a pantallas internas, ni viceversa).

**Tech Stack:** Angular 21 (Zoneless, Signals, standalone components, `@if`/`@for`), PrimeNG 21, Vitest vía `@angular/build:unit-test` (`ng test`), TypeScript.

## Global Constraints

- Standalone components únicamente, `ChangeDetectionStrategy.OnPush` en todo componente nuevo.
- Sin Tailwind/PrimeFlex/Bootstrap ni clases utilitarias custom — CSS semántico con `var(--p-...)`.
- Sin `ngOnInit`/`ngOnDestroy` para lógica expresable con signals/computed.
- Control flow moderno (`@if`/`@for`/`@switch`), nunca `*ngIf`/`*ngFor`.
- `PrimeTemplate` de `primeng/api` importado en cualquier componente que use `pTemplate`.
- Antes de implementar cualquier componente PrimeNG nuevo (`p-dialog`, `p-datepicker`), consultar el MCP `@primeng/mcp` (`get_component`, `get_usage_example`) para confirmar la API vigente en PrimeNG 21 — no asumir de memoria.
- Todo `Movimiento` de giftcard sigue llevando `usuario: string` — ahora se obtiene de `SesionService`, no de la constante `USUARIO_ACTUAL` (que se elimina).
- No reintroducir un wizard de activación global — el comprador externo reutiliza `GiftcardDetailDrawer` vía una vista propia acotada a su recurso.
- Cada archivo de servicio/componente nuevo sigue el patrón de signals + `computed` ya usado en `EmpresaService`/`GiftcardService`/`CampanaService` — nunca `BehaviorSubject`/`Subject` para estado local.

---

## Task 1: Modelo de gobernanza + holding en `Empresa`

**Files:**
- Create: `src/app/data/governance.model.ts`
- Test: `src/app/data/governance.model.spec.ts`
- Modify: `src/app/data/giftcard.model.ts:42-45` (interfaz `Empresa`)
- Modify: `src/app/services/empresa.service.ts:5-19` (mock data)

**Interfaces:**
- Produces: `Rol`, `TipoRecurso`, `RecursoOtorgado`, `AccesoExterno`, `CrearAccesoExternoPayload`, `OtorgarRecursoPayload`, `recursoVigente(recurso, hoy): boolean` — usados por todas las tareas siguientes.
- Produces: `Empresa.holdingId: string | null` — `null` significa que la empresa es un holding (o standalone sin tiendas); si tiene valor, es una tienda de ese holding.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/app/data/governance.model.spec.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { recursoVigente } from './governance.model';

describe('recursoVigente', () => {
  it('es vigente si la fecha de expiración es igual a hoy', () => {
    expect(recursoVigente({ tipoRecurso: 'lote_giftcard', idRecurso: 'campana-1', fechaExpiracion: '2026-08-06' }, '2026-08-06')).toBe(true);
  });

  it('es vigente si la fecha de expiración es futura', () => {
    expect(recursoVigente({ tipoRecurso: 'lote_giftcard', idRecurso: 'campana-1', fechaExpiracion: '2026-09-01' }, '2026-08-06')).toBe(true);
  });

  it('no es vigente si la fecha de expiración ya pasó', () => {
    expect(recursoVigente({ tipoRecurso: 'lote_giftcard', idRecurso: 'campana-1', fechaExpiracion: '2026-07-01' }, '2026-08-06')).toBe(false);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `ng test --include='**/governance.model.spec.ts'`
Expected: FAIL — `Cannot find module './governance.model'`

- [ ] **Step 3: Crear `governance.model.ts`**

Crear `src/app/data/governance.model.ts`:

```typescript
export type Rol = 'master' | 'administrador-holding' | 'administrador-tienda' | 'usuario-pos' | 'comprador-externo';

export type TipoRecurso = 'lote_giftcard';

export interface RecursoOtorgado {
  tipoRecurso: TipoRecurso;
  idRecurso: string;
  fechaExpiracion: string;
}

export interface AccesoExterno {
  id: string;
  nombre: string;
  empresaVendedoraId: string;
  recursos: RecursoOtorgado[];
}

export interface CrearAccesoExternoPayload {
  nombre: string;
  recurso: RecursoOtorgado;
}

export interface OtorgarRecursoPayload {
  accesoExternoId: string;
  recurso: RecursoOtorgado;
}

/** Un recurso otorgado deja de ser accesible al vencer su fecha de expiración. */
export function recursoVigente(recurso: RecursoOtorgado, hoy: string): boolean {
  return recurso.fechaExpiracion >= hoy;
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `ng test --include='**/governance.model.spec.ts'`
Expected: PASS (3 tests)

- [ ] **Step 5: Agregar `holdingId` a `Empresa`**

En `src/app/data/giftcard.model.ts:42-45`, reemplazar:

```typescript
export interface Empresa {
  id: string;
  nombre: string;
}
```

por:

```typescript
export interface Empresa {
  id: string;
  nombre: string;
  /** null = holding (o empresa standalone sin tiendas); si tiene valor, es una tienda de ese holding. */
  holdingId: string | null;
}
```

- [ ] **Step 6: Actualizar datos mock de empresas**

En `src/app/services/empresa.service.ts:5-19`, reemplazar:

```typescript
const MOCK_EMPRESAS: Empresa[] = [
  { id: 'empresa-1', nombre: 'Italmod' },
  { id: 'empresa-2', nombre: 'Autoplanet' },
];

/** Motor de Promociones es el único módulo raíz — Giftcards es una parte de él, no un módulo paralelo. */
const MOTOR_PROMOCIONES: Modulo = {
  clave: 'motor-promociones',
  etiqueta: 'Motor de Promociones',
  empresasHabilitadas: ['empresa-1'],
  submodulos: [
    { clave: 'giftcards', etiqueta: 'Giftcards', icono: 'pi pi-credit-card', ruta: '/giftcards', implementado: true },
    { clave: 'promociones', etiqueta: 'Promociones', icono: 'pi pi-percentage', ruta: '/promociones', implementado: false },
  ],
};
```

por:

```typescript
const MOCK_EMPRESAS: Empresa[] = [
  { id: 'empresa-1', nombre: 'Italmod', holdingId: null },
  { id: 'empresa-1a', nombre: 'Italmod Providencia', holdingId: 'empresa-1' },
  { id: 'empresa-1b', nombre: 'Italmod Ñuñoa', holdingId: 'empresa-1' },
  { id: 'empresa-2', nombre: 'Autoplanet', holdingId: null },
];

/** Motor de Promociones es el único módulo raíz — Giftcards es una parte de él, no un módulo paralelo. */
const MOTOR_PROMOCIONES: Modulo = {
  clave: 'motor-promociones',
  etiqueta: 'Motor de Promociones',
  empresasHabilitadas: ['empresa-1', 'empresa-1a', 'empresa-1b'],
  submodulos: [
    { clave: 'giftcards', etiqueta: 'Giftcards', icono: 'pi pi-credit-card', ruta: '/giftcards', implementado: true },
    { clave: 'promociones', etiqueta: 'Promociones', icono: 'pi pi-percentage', ruta: '/promociones', implementado: false },
  ],
};
```

- [ ] **Step 7: Verificar que el proyecto compila**

Run: `ng build`
Expected: build exitoso, sin errores de tipo (el resto de `empresa.service.ts` no referencia campos removidos).

- [ ] **Step 8: Commit**

```bash
git add src/app/data/governance.model.ts src/app/data/governance.model.spec.ts src/app/data/giftcard.model.ts src/app/services/empresa.service.ts
git commit -m "feat(gobernanza): modelo de roles y holding en Empresa"
```

---

## Task 2: `SesionService` (rol/empresa/acceso externo simulados)

**Files:**
- Create: `src/app/services/sesion.service.ts`
- Test: `src/app/services/sesion.service.spec.ts`

**Interfaces:**
- Consumes: `Rol` de `governance.model.ts` (Task 1).
- Produces: `SesionService` con `rol()`, `empresaId()`, `accesoExternoId()`, `nombreUsuarioActual()`, `esCompradorExterno()`, `puedeAdministrarGiftcards()`, `puedeCrearAccesoExterno()`, `entrarComoInterno(rol, empresaId, nombreUsuario)`, `entrarComoCompradorExterno(accesoExternoId, nombreUsuario)` — usados por `EmpresaService`, `GiftcardService`, `CampanaService`, `AccesoExternoService`, guards, y componentes de UI en las tareas siguientes.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/app/services/sesion.service.spec.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SesionService } from './sesion.service';

describe('SesionService', () => {
  let service: SesionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SesionService);
  });

  it('arranca como administrador-holding de empresa-1', () => {
    expect(service.rol()).toBe('administrador-holding');
    expect(service.empresaId()).toBe('empresa-1');
    expect(service.puedeAdministrarGiftcards()).toBe(true);
    expect(service.puedeCrearAccesoExterno()).toBe(true);
  });

  it('usuario-pos no puede administrar giftcards ni crear accesos externos', () => {
    service.entrarComoInterno('usuario-pos', 'empresa-1a', 'Vendedor Providencia');
    expect(service.rol()).toBe('usuario-pos');
    expect(service.nombreUsuarioActual()).toBe('Vendedor Providencia');
    expect(service.puedeAdministrarGiftcards()).toBe(false);
    expect(service.puedeCrearAccesoExterno()).toBe(false);
  });

  it('administrador-tienda puede administrar giftcards pero no crear accesos externos', () => {
    service.entrarComoInterno('administrador-tienda', 'empresa-1a', 'Admin Providencia');
    expect(service.puedeAdministrarGiftcards()).toBe(true);
    expect(service.puedeCrearAccesoExterno()).toBe(false);
  });

  it('comprador-externo queda marcado, sin empresaId, con accesoExternoId', () => {
    service.entrarComoCompradorExterno('acceso-1', 'DOT Solutions');
    expect(service.esCompradorExterno()).toBe(true);
    expect(service.empresaId()).toBeNull();
    expect(service.accesoExternoId()).toBe('acceso-1');
    expect(service.puedeAdministrarGiftcards()).toBe(false);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `ng test --include='**/sesion.service.spec.ts'`
Expected: FAIL — `Cannot find module './sesion.service'`

- [ ] **Step 3: Implementar `SesionService`**

Crear `src/app/services/sesion.service.ts`:

```typescript
import { Injectable, computed, signal } from '@angular/core';
import { Rol } from '../data/governance.model';

interface SesionState {
  rol: Rol;
  empresaId: string | null;
  accesoExternoId: string | null;
  nombreUsuario: string;
}

const SESION_INICIAL: SesionState = {
  rol: 'administrador-holding',
  empresaId: 'empresa-1',
  accesoExternoId: null,
  nombreUsuario: 'Administrador',
};

const ROLES_ADMINISTRADORES: Rol[] = ['master', 'administrador-holding', 'administrador-tienda'];

// No hay sistema de autenticación aún — esta sesión se simula desde el selector de rol del BackOffice.
@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly _sesion = signal<SesionState>(SESION_INICIAL);

  readonly rol = computed(() => this._sesion().rol);
  readonly empresaId = computed(() => this._sesion().empresaId);
  readonly accesoExternoId = computed(() => this._sesion().accesoExternoId);
  readonly nombreUsuarioActual = computed(() => this._sesion().nombreUsuario);

  readonly esCompradorExterno = computed(() => this.rol() === 'comprador-externo');
  readonly puedeAdministrarGiftcards = computed(() => ROLES_ADMINISTRADORES.includes(this.rol()));
  readonly puedeCrearAccesoExterno = computed(() => this.rol() === 'administrador-holding');

  entrarComoInterno(rol: Exclude<Rol, 'comprador-externo'>, empresaId: string, nombreUsuario: string): void {
    this._sesion.set({ rol, empresaId, accesoExternoId: null, nombreUsuario });
  }

  entrarComoCompradorExterno(accesoExternoId: string, nombreUsuario: string): void {
    this._sesion.set({ rol: 'comprador-externo', empresaId: null, accesoExternoId, nombreUsuario });
  }
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `ng test --include='**/sesion.service.spec.ts'`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/app/services/sesion.service.ts src/app/services/sesion.service.spec.ts
git commit -m "feat(gobernanza): SesionService simula rol/empresa/acceso externo activo"
```

---

## Task 3: `EmpresaService` — visibilidad por rol + agregado de holding

**Files:**
- Modify: `src/app/services/empresa.service.ts` (completo)
- Test: `src/app/services/empresa.service.spec.ts`

**Interfaces:**
- Consumes: `SesionService.rol()`, `SesionService.empresaId()` (Task 2).
- Produces: `EmpresaService.empresasVisibles()`, `EmpresaService.empresaActiva(): Empresa | null` (cambia de no-nulo a nulo cuando no hay empresa visible), `EmpresaService.empresasIncluidasEnVistaActiva(): string[]` — usado por `GiftcardService`/`CampanaService` (Task 4) y `AccesoExternoService` (Task 5).

- [ ] **Step 1: Escribir el test que falla**

Crear `src/app/services/empresa.service.spec.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EmpresaService } from './empresa.service';
import { SesionService } from './sesion.service';

describe('EmpresaService', () => {
  let empresaService: EmpresaService;
  let sesionService: SesionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    empresaService = TestBed.inject(EmpresaService);
    sesionService = TestBed.inject(SesionService);
  });

  it('administrador-holding ve el holding y sus tiendas, activo por defecto el holding (vista agregada)', () => {
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    expect(empresaService.empresasVisibles().map((e) => e.id)).toEqual(['empresa-1', 'empresa-1a', 'empresa-1b']);
    expect(empresaService.empresaActiva()?.id).toBe('empresa-1');
    expect(empresaService.empresasIncluidasEnVistaActiva()).toEqual(['empresa-1', 'empresa-1a', 'empresa-1b']);
  });

  it('al cambiar a una tienda puntual, la vista se acota solo a esa tienda', () => {
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    empresaService.cambiarEmpresa('empresa-1a');
    expect(empresaService.empresaActiva()?.id).toBe('empresa-1a');
    expect(empresaService.empresasIncluidasEnVistaActiva()).toEqual(['empresa-1a']);
  });

  it('administrador-tienda solo ve su propia tienda, sin agregado de holding', () => {
    sesionService.entrarComoInterno('administrador-tienda', 'empresa-1a', 'Admin Providencia');
    expect(empresaService.empresasVisibles().map((e) => e.id)).toEqual(['empresa-1a']);
    expect(empresaService.empresasIncluidasEnVistaActiva()).toEqual(['empresa-1a']);
  });

  it('master ve todas las empresas, incluidas todas las tiendas', () => {
    sesionService.entrarComoInterno('master', 'empresa-1', 'Master');
    expect(empresaService.empresasVisibles().map((e) => e.id)).toEqual(['empresa-1', 'empresa-1a', 'empresa-1b', 'empresa-2']);
  });

  it('comprador-externo no tiene empresas visibles ni empresa activa', () => {
    sesionService.entrarComoCompradorExterno('acceso-1', 'DOT Solutions');
    expect(empresaService.empresasVisibles()).toEqual([]);
    expect(empresaService.empresaActiva()).toBeNull();
    expect(empresaService.empresasIncluidasEnVistaActiva()).toEqual([]);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `ng test --include='**/empresa.service.spec.ts'`
Expected: FAIL — `empresaService.empresasVisibles is not a function`

- [ ] **Step 3: Reescribir `EmpresaService`**

Reemplazar el contenido completo de `src/app/services/empresa.service.ts`:

```typescript
import { Injectable, computed, inject, signal } from '@angular/core';
import { Empresa } from '../data/giftcard.model';
import { Modulo } from '../data/shell.model';
import { SesionService } from './sesion.service';

const MOCK_EMPRESAS: Empresa[] = [
  { id: 'empresa-1', nombre: 'Italmod', holdingId: null },
  { id: 'empresa-1a', nombre: 'Italmod Providencia', holdingId: 'empresa-1' },
  { id: 'empresa-1b', nombre: 'Italmod Ñuñoa', holdingId: 'empresa-1' },
  { id: 'empresa-2', nombre: 'Autoplanet', holdingId: null },
];

/** Motor de Promociones es el único módulo raíz — Giftcards es una parte de él, no un módulo paralelo. */
const MOTOR_PROMOCIONES: Modulo = {
  clave: 'motor-promociones',
  etiqueta: 'Motor de Promociones',
  empresasHabilitadas: ['empresa-1', 'empresa-1a', 'empresa-1b'],
  submodulos: [
    { clave: 'giftcards', etiqueta: 'Giftcards', icono: 'pi pi-credit-card', ruta: '/giftcards', implementado: true },
    { clave: 'promociones', etiqueta: 'Promociones', icono: 'pi pi-percentage', ruta: '/promociones', implementado: false },
  ],
};

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private readonly sesionService = inject(SesionService);
  private readonly _empresas = signal<Empresa[]>(MOCK_EMPRESAS);
  private readonly _empresaActivaId = signal<string>(MOCK_EMPRESAS[0].id);
  private readonly _cambiandoContexto = signal(false);

  readonly empresas = this._empresas.asReadonly();
  readonly cambiandoContexto = this._cambiandoContexto.asReadonly();
  readonly modulo = MOTOR_PROMOCIONES;

  /** Empresas que la sesión activa puede seleccionar, según su rol y alcance. */
  readonly empresasVisibles = computed<Empresa[]>(() => {
    const rol = this.sesionService.rol();
    const empresaId = this.sesionService.empresaId();
    const todas = this._empresas();

    if (rol === 'master') return todas;
    if (rol === 'comprador-externo') return [];
    if (!empresaId) return [];

    if (rol === 'administrador-holding') {
      const holding = todas.find((e) => e.id === empresaId);
      if (!holding) return [];
      return [holding, ...todas.filter((e) => e.holdingId === holding.id)];
    }

    // administrador-tienda / usuario-pos: acotado a su propia tienda.
    const propia = todas.find((e) => e.id === empresaId);
    return propia ? [propia] : [];
  });

  readonly empresaActiva = computed<Empresa | null>(() => {
    const visibles = this.empresasVisibles();
    if (visibles.length === 0) return null;
    const activaId = this._empresaActivaId();
    return visibles.find((e) => e.id === activaId) ?? visibles[0];
  });

  readonly moduloHabilitadoParaEmpresa = computed(() => {
    const activa = this.empresaActiva();
    return activa !== null && this.modulo.empresasHabilitadas.includes(activa.id);
  });

  /** Empresas incluidas en la vista actual: agregado (holding + tiendas) si la activa es un holding, acotado a una sola tienda si no. */
  readonly empresasIncluidasEnVistaActiva = computed<string[]>(() => {
    const activa = this.empresaActiva();
    if (!activa) return [];
    if (activa.holdingId === null) {
      return [activa.id, ...this._empresas().filter((e) => e.holdingId === activa.id).map((e) => e.id)];
    }
    return [activa.id];
  });

  cambiarEmpresa(empresaId: string): void {
    this._cambiandoContexto.set(true);
    this._empresaActivaId.set(empresaId);
    setTimeout(() => this._cambiandoContexto.set(false), 500);
  }
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `ng test --include='**/empresa.service.spec.ts'`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/app/services/empresa.service.ts src/app/services/empresa.service.spec.ts
git commit -m "feat(gobernanza): EmpresaService resuelve visibilidad por rol y agregado de holding"
```

---

## Task 4: `GiftcardService` y `CampanaService` — agregado/drill-down + usuario desde sesión

**Files:**
- Modify: `src/app/services/giftcard.service.ts` (completo)
- Modify: `src/app/services/campana.service.ts:11-22, 56-66`
- Test: `src/app/services/giftcard.service.spec.ts`

**Interfaces:**
- Consumes: `EmpresaService.empresasIncluidasEnVistaActiva()`, `EmpresaService.empresaActiva()` (Task 3), `SesionService.nombreUsuarioActual()` (Task 2).
- Produces: `GiftcardService.giftcardsDeEmpresaActiva()` (ahora agregado/drill-down), sin cambios de firma pública en el resto de métodos.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/app/services/giftcard.service.spec.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { GiftcardService } from './giftcard.service';
import { EmpresaService } from './empresa.service';
import { SesionService } from './sesion.service';

describe('GiftcardService — alcance por holding', () => {
  let giftcardService: GiftcardService;
  let empresaService: EmpresaService;
  let sesionService: SesionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    giftcardService = TestBed.inject(GiftcardService);
    empresaService = TestBed.inject(EmpresaService);
    sesionService = TestBed.inject(SesionService);
  });

  it('administrador-holding con el holding activo ve las giftcards de empresa-1 (agregado)', () => {
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    expect(giftcardService.giftcardsDeEmpresaActiva().length).toBeGreaterThan(0);
    expect(giftcardService.giftcardsDeEmpresaActiva().every((g) => g.empresaId === 'empresa-1')).toBe(true);
  });

  it('al acotar a una tienda sin giftcards propias, la lista queda vacía', () => {
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    empresaService.cambiarEmpresa('empresa-1a');
    expect(giftcardService.giftcardsDeEmpresaActiva()).toEqual([]);
  });

  it('el movimiento de creación registra el usuario de la sesión activa, no una constante fija', () => {
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    giftcardService.crear({ modo: 'individual', tipoMonto: 'fijo', canal: 'ambos', montoFijo: 5000, crearSoloComoVigente: true });
    const nueva = giftcardService.giftcardsDeEmpresaActiva()[0];
    expect(nueva.movimientos[0].usuario).toBe('Admin Italmod');
  });

  it('crear() no falla si no hay empresa activa (sesión de comprador externo)', () => {
    sesionService.entrarComoCompradorExterno('acceso-1', 'DOT Solutions');
    const antes = giftcardService.giftcardsDeEmpresaActiva().length;
    giftcardService.crear({ modo: 'individual', tipoMonto: 'fijo', canal: 'ambos', montoFijo: 5000, crearSoloComoVigente: true });
    expect(giftcardService.giftcardsDeEmpresaActiva().length).toBe(antes);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `ng test --include='**/giftcard.service.spec.ts'`
Expected: FAIL — el test de tienda vacía falla porque hoy `giftcardsDeEmpresaActiva` solo filtra por `empresaId === empresaActiva().id` sin resolver agregado/drill-down, y `empresaActiva()` puede ser `null` (rompe con `.id` sobre `null` en runtime real, aunque el mock actual no lo dispara — el test de "no falla sin empresa activa" es el que expone el bug).

- [ ] **Step 3: Reescribir `GiftcardService`**

Reemplazar el contenido completo de `src/app/services/giftcard.service.ts`:

```typescript
import { Injectable, computed, inject, signal } from '@angular/core';
import {
  ActivarGiftcardPayload,
  BloquearGiftcardPayload,
  CrearGiftcardPayload,
  Giftcard,
  MovimientoTipo,
  ReiniciarActivacionPayload,
  calcularEstadoGiftcard,
} from '../data/giftcard.model';
import { EmpresaService } from './empresa.service';
import { SesionService } from './sesion.service';

const MOCK_GIFTCARDS: Giftcard[] = [
  {
    id: '1',
    empresaId: 'empresa-1',
    codigo: 'GC-8F2A-01',
    tipoMonto: 'fijo',
    canal: 'ambos',
    cliente: null,
    monto: 20000,
    saldo: 20000,
    sid: 'SID-10021',
    vigente: true,
    fechaActivacion: null,
    campanaId: 'campana-1',
    movimientos: [movimiento('creacion', 'SID-10021', '2026-06-15', 20000, 20000, 'Generada en campaña corporativa', 'Administrador')],
  },
  {
    id: '2',
    empresaId: 'empresa-1',
    codigo: 'GC-8F2A-02',
    tipoMonto: 'fijo',
    canal: 'ambos',
    cliente: null,
    monto: 20000,
    saldo: 20000,
    sid: 'SID-10022',
    vigente: true,
    fechaActivacion: null,
    campanaId: 'campana-1',
    movimientos: [movimiento('creacion', 'SID-10022', '2026-06-15', 20000, 20000, 'Generada en campaña corporativa', 'Administrador')],
  },
  {
    id: '3',
    empresaId: 'empresa-1',
    codigo: 'GC-4B19-07',
    tipoMonto: 'dinamico',
    canal: 'tienda',
    cliente: 'Constanza Rivas',
    monto: 35000,
    saldo: 12500,
    sid: 'SID-10087',
    vigente: true,
    fechaActivacion: '2026-05-02',
    campanaId: null,
    movimientos: [
      movimiento('creacion', 'SID-10085', '2026-05-02', 35000, 35000, 'Creada individual', 'Administrador'),
      movimiento('venta', 'SID-10086', '2026-05-02', 35000, 35000, 'Venta en tienda Providencia', 'Vendedor Providencia'),
      movimiento('uso', 'SID-10087', '2026-06-20', -22500, 12500, 'Consumo en compra #4821', 'Constanza Rivas'),
    ],
  },
  {
    id: '4',
    empresaId: 'empresa-1',
    codigo: 'GC-4B19-08',
    tipoMonto: 'fijo',
    canal: 'tienda',
    cliente: 'Tomás Herrera',
    monto: 15000,
    saldo: 15000,
    sid: 'SID-10088',
    vigente: true,
    fechaActivacion: '2026-05-10',
    campanaId: null,
    movimientos: [
      movimiento('creacion', 'SID-10083', '2026-05-10', 15000, 15000, 'Creada individual', 'Administrador'),
      movimiento('venta', 'SID-10088', '2026-05-10', 15000, 15000, 'Venta en tienda Ñuñoa', 'Vendedor Ñuñoa'),
    ],
  },
  {
    id: '5',
    empresaId: 'empresa-1',
    codigo: 'GC-2C77-03',
    tipoMonto: 'fijo',
    canal: 'ecommerce',
    cliente: 'Javiera Soto',
    monto: 10000,
    saldo: 0,
    sid: 'SID-10101',
    vigente: true,
    fechaActivacion: '2026-04-01',
    campanaId: null,
    movimientos: [
      movimiento('creacion', 'SID-10099', '2026-04-01', 10000, 10000, 'Creada individual', 'Administrador'),
      movimiento('venta', 'SID-10100', '2026-04-01', 10000, 10000, 'Venta en tienda Las Condes', 'Vendedor Las Condes'),
      movimiento('uso', 'SID-10101', '2026-04-18', -10000, 0, 'Consumo total en compra #3390', 'Javiera Soto'),
    ],
  },
  {
    id: '6',
    empresaId: 'empresa-1',
    codigo: 'GC-9A44-05',
    tipoMonto: 'dinamico',
    canal: 'ambos',
    cliente: 'Pedro Álvarez',
    monto: 50000,
    saldo: 50000,
    sid: 'SID-10112',
    vigente: false,
    fechaActivacion: '2026-06-01',
    campanaId: null,
    movimientos: [
      movimiento('creacion', 'SID-10110', '2026-06-01', 50000, 50000, 'Creada individual', 'Administrador'),
      movimiento('venta', 'SID-10111', '2026-06-01', 50000, 50000, 'Venta en tienda Maipú', 'Vendedor Maipú'),
      movimiento('ajuste', 'SID-10112', '2026-06-05', 0, 50000, 'Bloqueada por robo reportado por el cliente', 'Administrador'),
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class GiftcardService {
  private readonly empresaService = inject(EmpresaService);
  private readonly sesionService = inject(SesionService);
  private readonly _giftcards = signal<Giftcard[]>(MOCK_GIFTCARDS);
  private secuencia = MOCK_GIFTCARDS.length;

  readonly giftcardsDeEmpresaActiva = computed(() => {
    const idsIncluidos = this.empresaService.empresasIncluidasEnVistaActiva();
    return this._giftcards().filter((g) => idsIncluidos.includes(g.empresaId));
  });

  readonly metricas = computed(() => {
    const lista = this.giftcardsDeEmpresaActiva();
    const estados = lista.map((g) => calcularEstadoGiftcard(g));
    return {
      vigentesSinVender: estados.filter((e) => e === 'sin-activar').length,
      activas: estados.filter((e) => e === 'activa').length,
      saldoRealEmitido: lista.filter((g, i) => estados[i] === 'activa').reduce((total, g) => total + g.saldo, 0),
      inactivas: estados.filter((e) => e === 'agotada' || e === 'inactiva').length,
    };
  });

  crear(payload: CrearGiftcardPayload): void {
    const empresaActiva = this.empresaService.empresaActiva();
    if (!empresaActiva) return;

    const monto = payload.tipoMonto === 'fijo' ? (payload.montoFijo ?? 0) : 0;
    const cantidad = payload.modo === 'lote' ? payload.cantidad : 1;
    // Monto dinámico se asigna al activar — nunca puede nacer ya activada.
    const crearActivada = payload.tipoMonto === 'fijo' && payload.modo === 'individual' && !payload.crearSoloComoVigente;
    const prefijo = generarPrefijoCodigo();
    const hoy = new Date().toISOString().slice(0, 10);
    const campanaId = payload.modo === 'lote' ? payload.campanaId : null;
    const empresaId = empresaActiva.id;
    const usuario = this.sesionService.nombreUsuarioActual();

    const nuevas: Giftcard[] = Array.from({ length: cantidad }, (_, indice) => {
      this.secuencia += 1;
      const sid = `SID-${10000 + this.secuencia}`;
      return {
        id: `giftcard-${this.secuencia}`,
        empresaId,
        codigo: `GC-${prefijo}-${String(indice + 1).padStart(2, '0')}`,
        tipoMonto: payload.tipoMonto,
        canal: payload.canal,
        cliente: null,
        monto,
        saldo: monto,
        sid,
        vigente: true,
        fechaActivacion: crearActivada ? hoy : null,
        campanaId,
        movimientos: [
          {
            sid,
            tipo: 'creacion',
            fecha: hoy,
            monto,
            saldoResultante: monto,
            detalle: payload.modo === 'lote' ? 'Generada en campaña corporativa' : 'Creada individual',
            usuario,
          },
        ],
      };
    });

    this._giftcards.update((lista) => [...nuevas, ...lista]);
  }

  activar(payload: ActivarGiftcardPayload): void {
    this.secuencia += 1;
    const nuevoSid = `SID-${10000 + this.secuencia}`;
    const hoy = new Date().toISOString().slice(0, 10);
    const usuario = this.sesionService.nombreUsuarioActual();

    this._giftcards.update((lista) =>
      lista.map((g) => {
        if (g.id !== payload.giftcardId) return g;
        const monto = payload.monto ?? g.monto;
        return {
          ...g,
          monto,
          cliente: payload.destinatario,
          fechaActivacion: hoy,
          saldo: monto,
          sid: nuevoSid,
          movimientos: [
            ...g.movimientos,
            { sid: nuevoSid, tipo: 'venta', fecha: hoy, monto, saldoResultante: monto, detalle: `Activada para ${payload.destinatario}`, usuario },
          ],
        };
      }),
    );
  }

  bloquear(payload: BloquearGiftcardPayload): void {
    this.secuencia += 1;
    const nuevoSid = `SID-${10000 + this.secuencia}`;
    const hoy = new Date().toISOString().slice(0, 10);
    const usuario = this.sesionService.nombreUsuarioActual();

    this._giftcards.update((lista) =>
      lista.map((g) =>
        g.id === payload.giftcardId
          ? {
              ...g,
              vigente: false,
              sid: nuevoSid,
              movimientos: [
                ...g.movimientos,
                { sid: nuevoSid, tipo: 'ajuste', fecha: hoy, monto: 0, saldoResultante: g.saldo, detalle: `Bloqueada — ${payload.motivo}`, usuario },
              ],
            }
          : g,
      ),
    );
  }

  reiniciarActivacion(payload: ReiniciarActivacionPayload): void {
    this.secuencia += 1;
    const nuevoSid = `SID-${10000 + this.secuencia}`;
    const hoy = new Date().toISOString().slice(0, 10);
    const usuario = this.sesionService.nombreUsuarioActual();

    this._giftcards.update((lista) =>
      lista.map((g) =>
        g.id === payload.giftcardId
          ? {
              ...g,
              fechaActivacion: null,
              cliente: null,
              saldo: g.monto,
              sid: nuevoSid,
              movimientos: [
                ...g.movimientos,
                {
                  sid: nuevoSid,
                  tipo: 'ajuste',
                  fecha: hoy,
                  monto: 0,
                  saldoResultante: g.monto,
                  detalle: 'Activación reiniciada — código vuelve a Sin activar',
                  usuario,
                },
              ],
            }
          : g,
      ),
    );
  }
}

function generarPrefijoCodigo(): string {
  return Math.floor(Math.random() * 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0');
}

function movimiento(tipo: MovimientoTipo, sid: string, fecha: string, monto: number, saldoResultante: number, detalle: string, usuario: string) {
  return { sid, tipo, fecha, monto, saldoResultante, detalle, usuario };
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `ng test --include='**/giftcard.service.spec.ts'`
Expected: PASS (4 tests)

- [ ] **Step 5: Aplicar el mismo alcance agregado/drill-down a `CampanaService`**

En `src/app/services/campana.service.ts:17`, reemplazar:

```typescript
  readonly campanasDeEmpresaActiva = computed(() => this._campanas().filter((c) => c.empresaId === this.empresaService.empresaActiva().id));
```

por:

```typescript
  readonly campanasDeEmpresaActiva = computed(() => {
    const idsIncluidos = this.empresaService.empresasIncluidasEnVistaActiva();
    return this._campanas().filter((c) => idsIncluidos.includes(c.empresaId));
  });
```

En `src/app/services/campana.service.ts:56-66`, reemplazar:

```typescript
  crear(payload: CrearCampanaPayload): void {
    this.secuencia += 1;
    const campana: Campana = {
      id: `campana-${this.secuencia}`,
      empresaId: this.empresaService.empresaActiva().id,
      archivada: false,
      fechaCreacion: new Date().toISOString().slice(0, 10),
      ...payload,
    };
    this._campanas.update((lista) => [campana, ...lista]);
  }
```

por:

```typescript
  crear(payload: CrearCampanaPayload): void {
    const empresaActiva = this.empresaService.empresaActiva();
    if (!empresaActiva) return;

    this.secuencia += 1;
    const campana: Campana = {
      id: `campana-${this.secuencia}`,
      empresaId: empresaActiva.id,
      archivada: false,
      fechaCreacion: new Date().toISOString().slice(0, 10),
      ...payload,
    };
    this._campanas.update((lista) => [campana, ...lista]);
  }
```

- [ ] **Step 6: Correr toda la suite de servicios y verificar que pasa**

Run: `ng test --include='**/services/*.spec.ts'`
Expected: PASS — todos los tests de `sesion.service`, `empresa.service`, `giftcard.service` en verde.

- [ ] **Step 7: Commit**

```bash
git add src/app/services/giftcard.service.ts src/app/services/giftcard.service.spec.ts src/app/services/campana.service.ts
git commit -m "feat(gobernanza): giftcards y campañas resuelven alcance agregado/drill-down por holding"
```

---

## Task 5: `AccesoExternoService`

**Files:**
- Create: `src/app/services/acceso-externo.service.ts`
- Test: `src/app/services/acceso-externo.service.spec.ts`

**Interfaces:**
- Consumes: `EmpresaService.empresaActiva()` (Task 3), `SesionService.accesoExternoId()` (Task 2), `AccesoExterno`, `CrearAccesoExternoPayload`, `OtorgarRecursoPayload`, `recursoVigente` (Task 1).
- Produces: `AccesoExternoService.accesosDeHoldingActivo()`, `AccesoExternoService.recursosVigentesDeSesion()`, `AccesoExternoService.todos()`, `crear(payload)`, `otorgarRecurso(payload)` — usados por `GiftcardService` (Task 9), `AccesoExternoList` (Task 8), `SesionSwitcher` (Task 7).

- [ ] **Step 1: Escribir el test que falla**

Crear `src/app/services/acceso-externo.service.spec.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AccesoExternoService } from './acceso-externo.service';
import { SesionService } from './sesion.service';

describe('AccesoExternoService', () => {
  let service: AccesoExternoService;
  let sesionService: SesionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccesoExternoService);
    sesionService = TestBed.inject(SesionService);
  });

  it('crea una cuenta externa vinculada al holding activo', () => {
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    service.crear({ nombre: 'DOT Solutions', recurso: { tipoRecurso: 'lote_giftcard', idRecurso: 'campana-1', fechaExpiracion: '2026-12-31' } });
    expect(service.accesosDeHoldingActivo().length).toBe(1);
    expect(service.accesosDeHoldingActivo()[0].nombre).toBe('DOT Solutions');
    expect(service.accesosDeHoldingActivo()[0].empresaVendedoraId).toBe('empresa-1');
  });

  it('otorga un recurso adicional a una cuenta existente en vez de crear una nueva', () => {
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    service.crear({ nombre: 'DOT Solutions', recurso: { tipoRecurso: 'lote_giftcard', idRecurso: 'campana-1', fechaExpiracion: '2026-12-31' } });
    const [acceso] = service.accesosDeHoldingActivo();

    service.otorgarRecurso({ accesoExternoId: acceso.id, recurso: { tipoRecurso: 'lote_giftcard', idRecurso: 'campana-2', fechaExpiracion: '2027-01-31' } });

    expect(service.accesosDeHoldingActivo().length).toBe(1);
    expect(service.accesosDeHoldingActivo()[0].recursos.length).toBe(2);
  });

  it('recursosVigentesDeSesion excluye recursos vencidos', () => {
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    service.crear({ nombre: 'DOT Solutions', recurso: { tipoRecurso: 'lote_giftcard', idRecurso: 'campana-1', fechaExpiracion: '2000-01-01' } });
    const [acceso] = service.accesosDeHoldingActivo();

    sesionService.entrarComoCompradorExterno(acceso.id, 'DOT Solutions');

    expect(service.recursosVigentesDeSesion()).toEqual([]);
  });

  it('recursosVigentesDeSesion incluye recursos vigentes', () => {
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    service.crear({ nombre: 'DOT Solutions', recurso: { tipoRecurso: 'lote_giftcard', idRecurso: 'campana-1', fechaExpiracion: '2099-01-01' } });
    const [acceso] = service.accesosDeHoldingActivo();

    sesionService.entrarComoCompradorExterno(acceso.id, 'DOT Solutions');

    expect(service.recursosVigentesDeSesion().map((r) => r.idRecurso)).toEqual(['campana-1']);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `ng test --include='**/acceso-externo.service.spec.ts'`
Expected: FAIL — `Cannot find module './acceso-externo.service'`

- [ ] **Step 3: Implementar `AccesoExternoService`**

Crear `src/app/services/acceso-externo.service.ts`:

```typescript
import { Injectable, computed, inject, signal } from '@angular/core';
import { AccesoExterno, CrearAccesoExternoPayload, OtorgarRecursoPayload, recursoVigente } from '../data/governance.model';
import { EmpresaService } from './empresa.service';
import { SesionService } from './sesion.service';

const MOCK_ACCESOS_EXTERNOS: AccesoExterno[] = [];

@Injectable({ providedIn: 'root' })
export class AccesoExternoService {
  private readonly empresaService = inject(EmpresaService);
  private readonly sesionService = inject(SesionService);
  private readonly _accesos = signal<AccesoExterno[]>(MOCK_ACCESOS_EXTERNOS);
  private secuencia = MOCK_ACCESOS_EXTERNOS.length;

  /** Todas las cuentas externas — solo para el selector de sesión de demo, nunca para una vista de negocio. */
  readonly todos = this._accesos.asReadonly();

  /** Cuentas creadas por el holding actualmente activo. */
  readonly accesosDeHoldingActivo = computed(() => {
    const empresa = this.empresaService.empresaActiva();
    if (!empresa) return [];
    const holdingId = empresa.holdingId ?? empresa.id;
    return this._accesos().filter((a) => a.empresaVendedoraId === holdingId);
  });

  /** Recursos no vencidos de la cuenta externa con sesión activa. */
  readonly recursosVigentesDeSesion = computed(() => {
    const accesoId = this.sesionService.accesoExternoId();
    if (!accesoId) return [];
    const acceso = this._accesos().find((a) => a.id === accesoId);
    if (!acceso) return [];
    const hoy = new Date().toISOString().slice(0, 10);
    return acceso.recursos.filter((r) => recursoVigente(r, hoy));
  });

  crear(payload: CrearAccesoExternoPayload): void {
    const empresa = this.empresaService.empresaActiva();
    if (!empresa) return;

    this.secuencia += 1;
    const holdingId = empresa.holdingId ?? empresa.id;
    const acceso: AccesoExterno = {
      id: `acceso-externo-${this.secuencia}`,
      nombre: payload.nombre,
      empresaVendedoraId: holdingId,
      recursos: [payload.recurso],
    };
    this._accesos.update((lista) => [acceso, ...lista]);
  }

  otorgarRecurso(payload: OtorgarRecursoPayload): void {
    this._accesos.update((lista) =>
      lista.map((a) => (a.id === payload.accesoExternoId ? { ...a, recursos: [...a.recursos, payload.recurso] } : a)),
    );
  }
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `ng test --include='**/acceso-externo.service.spec.ts'`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/app/services/acceso-externo.service.ts src/app/services/acceso-externo.service.spec.ts
git commit -m "feat(gobernanza): AccesoExternoService gestiona cuentas y recursos otorgados"
```

---

## Task 6: Guards de gobernanza + rutas

**Files:**
- Create: `src/app/guards/rol-redirect.guard.ts`
- Create: `src/app/guards/solo-interno.guard.ts`
- Create: `src/app/guards/solo-administrador-holding.guard.ts`
- Create: `src/app/guards/solo-comprador-externo.guard.ts`
- Test: `src/app/guards/gobernanza.guards.spec.ts`
- Modify: `src/app/app.routes.ts` (completo)

**Interfaces:**
- Consumes: `SesionService.esCompradorExterno()`, `SesionService.puedeCrearAccesoExterno()` (Task 2).
- Produces: 4 `CanActivateFn` usados en `app.routes.ts`.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/app/guards/gobernanza.guards.spec.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { rolRedirectGuard } from './rol-redirect.guard';
import { soloInternoGuard } from './solo-interno.guard';
import { soloAdministradorHoldingGuard } from './solo-administrador-holding.guard';
import { soloCompradorExternoGuard } from './solo-comprador-externo.guard';
import { SesionService } from '../services/sesion.service';

describe('Guards de gobernanza', () => {
  let sesionService: SesionService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    sesionService = TestBed.inject(SesionService);
    router = TestBed.inject(Router);
  });

  it('rolRedirectGuard manda a /giftcards para roles internos', () => {
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    const resultado = TestBed.runInInjectionContext(() => rolRedirectGuard({} as any, {} as any)) as UrlTree;
    expect(router.serializeUrl(resultado)).toBe('/giftcards');
  });

  it('rolRedirectGuard manda a /mi-lote para comprador externo', () => {
    sesionService.entrarComoCompradorExterno('acceso-1', 'DOT Solutions');
    const resultado = TestBed.runInInjectionContext(() => rolRedirectGuard({} as any, {} as any)) as UrlTree;
    expect(router.serializeUrl(resultado)).toBe('/mi-lote');
  });

  it('soloInternoGuard bloquea a comprador externo y lo manda a /mi-lote', () => {
    sesionService.entrarComoCompradorExterno('acceso-1', 'DOT Solutions');
    const resultado = TestBed.runInInjectionContext(() => soloInternoGuard({} as any, {} as any)) as UrlTree;
    expect(router.serializeUrl(resultado)).toBe('/mi-lote');
  });

  it('soloInternoGuard deja pasar a roles internos', () => {
    sesionService.entrarComoInterno('usuario-pos', 'empresa-1a', 'Vendedor Providencia');
    expect(TestBed.runInInjectionContext(() => soloInternoGuard({} as any, {} as any))).toBe(true);
  });

  it('soloAdministradorHoldingGuard bloquea a quien no es administrador-holding', () => {
    sesionService.entrarComoInterno('administrador-tienda', 'empresa-1a', 'Admin Providencia');
    const resultado = TestBed.runInInjectionContext(() => soloAdministradorHoldingGuard({} as any, {} as any)) as UrlTree;
    expect(router.serializeUrl(resultado)).toBe('/giftcards');
  });

  it('soloAdministradorHoldingGuard deja pasar a administrador-holding', () => {
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    expect(TestBed.runInInjectionContext(() => soloAdministradorHoldingGuard({} as any, {} as any))).toBe(true);
  });

  it('soloCompradorExternoGuard bloquea a roles internos', () => {
    sesionService.entrarComoInterno('master', 'empresa-1', 'Master');
    const resultado = TestBed.runInInjectionContext(() => soloCompradorExternoGuard({} as any, {} as any)) as UrlTree;
    expect(router.serializeUrl(resultado)).toBe('/giftcards');
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `ng test --include='**/gobernanza.guards.spec.ts'`
Expected: FAIL — `Cannot find module './rol-redirect.guard'`

- [ ] **Step 3: Implementar los 4 guards**

Crear `src/app/guards/rol-redirect.guard.ts`:

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from '../services/sesion.service';

export const rolRedirectGuard: CanActivateFn = () => {
  const sesionService = inject(SesionService);
  const router = inject(Router);
  return router.parseUrl(sesionService.esCompradorExterno() ? '/mi-lote' : '/giftcards');
};
```

Crear `src/app/guards/solo-interno.guard.ts`:

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from '../services/sesion.service';

/** Aislamiento estricto: el comprador externo nunca navega a pantallas internas, ni por URL directa. */
export const soloInternoGuard: CanActivateFn = () => {
  const sesionService = inject(SesionService);
  const router = inject(Router);
  return sesionService.esCompradorExterno() ? router.parseUrl('/mi-lote') : true;
};
```

Crear `src/app/guards/solo-administrador-holding.guard.ts`:

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from '../services/sesion.service';

export const soloAdministradorHoldingGuard: CanActivateFn = () => {
  const sesionService = inject(SesionService);
  const router = inject(Router);
  return sesionService.puedeCrearAccesoExterno() ? true : router.parseUrl('/giftcards');
};
```

Crear `src/app/guards/solo-comprador-externo.guard.ts`:

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from '../services/sesion.service';

export const soloCompradorExternoGuard: CanActivateFn = () => {
  const sesionService = inject(SesionService);
  const router = inject(Router);
  return sesionService.esCompradorExterno() ? true : router.parseUrl('/giftcards');
};
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `ng test --include='**/gobernanza.guards.spec.ts'`
Expected: PASS (7 tests)

- [ ] **Step 5: Wire de las rutas**

Reemplazar `src/app/app.routes.ts` completo:

```typescript
import { Routes } from '@angular/router';
import { rolRedirectGuard } from './guards/rol-redirect.guard';
import { soloInternoGuard } from './guards/solo-interno.guard';
import { soloAdministradorHoldingGuard } from './guards/solo-administrador-holding.guard';
import { soloCompradorExternoGuard } from './guards/solo-comprador-externo.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [rolRedirectGuard], children: [] },
  {
    path: 'giftcards',
    canActivate: [soloInternoGuard],
    loadComponent: () => import('./components/giftcard/giftcard-list/giftcard-list').then((m) => m.GiftcardList),
  },
  {
    path: 'accesos-externos',
    canActivate: [soloInternoGuard, soloAdministradorHoldingGuard],
    loadComponent: () => import('./components/giftcard/acceso-externo-list/acceso-externo-list').then((m) => m.AccesoExternoList),
  },
  {
    path: 'mi-lote',
    canActivate: [soloCompradorExternoGuard],
    loadComponent: () => import('./components/giftcard/portal-externo/portal-externo').then((m) => m.PortalExterno),
  },
];
```

Nota: `accesos-externos` y `portal-externo` todavía no existen como componentes — se crean en Tasks 8 y 9. El build fallará hasta completarlas; no correr `ng build` en este paso, solo los tests de guards.

- [ ] **Step 6: Commit**

```bash
git add src/app/guards/ src/app/app.routes.ts
git commit -m "feat(gobernanza): guards de rol y rutas de accesos externos / portal comprador"
```

---

## Task 7: `SesionSwitcher` (selector de rol de demo) + wiring en `AppShell`

**Files:**
- Create: `src/app/components/shared/sesion-switcher/sesion-switcher.ts`
- Create: `src/app/components/shared/sesion-switcher/sesion-switcher.html`
- Create: `src/app/components/shared/sesion-switcher/sesion-switcher.css`
- Test: `src/app/components/shared/sesion-switcher/sesion-switcher.spec.ts`
- Modify: `src/app/components/shared/app-shell/app-shell.ts` (completo)
- Modify: `src/app/components/shared/app-shell/app-shell.html` (completo)

**Interfaces:**
- Consumes: `SesionService` (Task 2), `EmpresaService.empresas()` (Task 3), `AccesoExternoService.todos()` (Task 5), `Rol` (Task 1).

- [ ] **Step 1: Escribir el test que falla**

Crear `src/app/components/shared/sesion-switcher/sesion-switcher.spec.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SesionSwitcher } from './sesion-switcher';
import { SesionService } from '../../../services/sesion.service';

describe('SesionSwitcher', () => {
  let fixture: ComponentFixture<SesionSwitcher>;
  let component: SesionSwitcher;
  let sesionService: SesionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SesionSwitcher] }).compileComponents();
    fixture = TestBed.createComponent(SesionSwitcher);
    component = fixture.componentInstance;
    sesionService = TestBed.inject(SesionService);
    fixture.detectChanges();
  });

  it('cambiar a usuario-pos entra con la primera tienda disponible', () => {
    component.cambiarRol('usuario-pos');
    expect(sesionService.rol()).toBe('usuario-pos');
    expect(sesionService.empresaId()).toBe('empresa-1a');
  });

  it('cambiar a administrador-holding entra con el primer holding disponible', () => {
    component.cambiarRol('administrador-holding');
    expect(sesionService.rol()).toBe('administrador-holding');
    expect(sesionService.empresaId()).toBe('empresa-1');
  });

  it('cambiar a comprador-externo sin cuentas disponibles entra con id vacío', () => {
    component.cambiarRol('comprador-externo');
    expect(sesionService.rol()).toBe('comprador-externo');
    expect(sesionService.accesoExternoId()).toBe('');
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `ng test --include='**/sesion-switcher.spec.ts'`
Expected: FAIL — `Cannot find module './sesion-switcher'`

- [ ] **Step 3: Implementar `SesionSwitcher`**

Crear `src/app/components/shared/sesion-switcher/sesion-switcher.ts`:

```typescript
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { SesionService } from '../../../services/sesion.service';
import { EmpresaService } from '../../../services/empresa.service';
import { AccesoExternoService } from '../../../services/acceso-externo.service';
import { Rol } from '../../../data/governance.model';

const OPCIONES_ROL: { label: string; value: Rol }[] = [
  { label: 'Master', value: 'master' },
  { label: 'Administrador Holding', value: 'administrador-holding' },
  { label: 'Administrador Tienda', value: 'administrador-tienda' },
  { label: 'Usuario POS', value: 'usuario-pos' },
  { label: 'Comprador Externo', value: 'comprador-externo' },
];

@Component({
  selector: 'app-sesion-switcher',
  imports: [FormsModule, Select],
  templateUrl: './sesion-switcher.html',
  styleUrl: './sesion-switcher.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SesionSwitcher {
  private readonly sesionService = inject(SesionService);
  private readonly empresaService = inject(EmpresaService);
  private readonly accesoExternoService = inject(AccesoExternoService);

  readonly opcionesRol = OPCIONES_ROL;
  readonly rolActual = computed(() => this.sesionService.rol());

  readonly opcionesHolding = computed(() => this.empresaService.empresas().filter((e) => e.holdingId === null));
  readonly opcionesTienda = computed(() => this.empresaService.empresas().filter((e) => e.holdingId !== null));
  readonly opcionesAccesoExterno = computed(() => this.accesoExternoService.todos());

  cambiarRol(rol: Rol): void {
    if (rol === 'comprador-externo') {
      const primero = this.opcionesAccesoExterno()[0];
      this.sesionService.entrarComoCompradorExterno(primero?.id ?? '', primero?.nombre ?? 'Comprador Externo');
      return;
    }
    if (rol === 'master' || rol === 'administrador-holding') {
      const primerHolding = this.opcionesHolding()[0];
      this.sesionService.entrarComoInterno(rol, primerHolding?.id ?? '', rol === 'master' ? 'Master' : 'Administrador Holding');
      return;
    }
    const primeraTienda = this.opcionesTienda()[0];
    this.sesionService.entrarComoInterno(rol, primeraTienda?.id ?? '', rol === 'usuario-pos' ? 'Usuario POS' : 'Administrador Tienda');
  }

  cambiarEmpresaSesion(empresaId: string): void {
    const rol = this.sesionService.rol();
    if (rol === 'comprador-externo') return;
    const nombre = this.empresaService.empresas().find((e) => e.id === empresaId)?.nombre ?? '';
    this.sesionService.entrarComoInterno(rol, empresaId, nombre);
  }

  cambiarAccesoExterno(accesoId: string): void {
    const nombre = this.opcionesAccesoExterno().find((a) => a.id === accesoId)?.nombre ?? '';
    this.sesionService.entrarComoCompradorExterno(accesoId, nombre);
  }
}
```

Crear `src/app/components/shared/sesion-switcher/sesion-switcher.html`:

```html
<div class="sesion-switcher">
  <p-select [options]="opcionesRol" optionLabel="label" optionValue="value" [ngModel]="rolActual()" (ngModelChange)="cambiarRol($event)" [fluid]="true" />

  @if (rolActual() === 'administrador-holding' || rolActual() === 'master') {
    <p-select [options]="opcionesHolding()" optionLabel="nombre" optionValue="id" placeholder="Holding" (ngModelChange)="cambiarEmpresaSesion($event)" [fluid]="true" />
  }

  @if (rolActual() === 'administrador-tienda' || rolActual() === 'usuario-pos') {
    <p-select [options]="opcionesTienda()" optionLabel="nombre" optionValue="id" placeholder="Tienda" (ngModelChange)="cambiarEmpresaSesion($event)" [fluid]="true" />
  }

  @if (rolActual() === 'comprador-externo') {
    <p-select [options]="opcionesAccesoExterno()" optionLabel="nombre" optionValue="id" placeholder="Cuenta compradora" (ngModelChange)="cambiarAccesoExterno($event)" [fluid]="true" />
  }
</div>
```

Crear `src/app/components/shared/sesion-switcher/sesion-switcher.css`:

```css
.sesion-switcher {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid var(--p-content-border-color);
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `ng test --include='**/sesion-switcher.spec.ts'`
Expected: PASS (3 tests)

- [ ] **Step 5: Wire en `AppShell`**

Reemplazar `src/app/components/shared/app-shell/app-shell.ts` completo:

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { EmpresaService } from '../../../services/empresa.service';
import { SesionService } from '../../../services/sesion.service';
import { SesionSwitcher } from '../sesion-switcher/sesion-switcher';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, FormsModule, Select, SesionSwitcher],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShell {
  readonly empresaService = inject(EmpresaService);
  readonly sesionService = inject(SesionService);
}
```

Reemplazar `src/app/components/shared/app-shell/app-shell.html` completo:

```html
<div class="shell">
  <aside class="shell-nav">
    <app-sesion-switcher />

    @if (!sesionService.esCompradorExterno()) {
      <div class="empresa-selector">
        <p-select
          [options]="empresaService.empresasVisibles()"
          optionLabel="nombre"
          optionValue="id"
          [ngModel]="empresaService.empresaActiva()?.id"
          (ngModelChange)="empresaService.cambiarEmpresa($event)"
          [fluid]="true"
        />
        @if (empresaService.cambiandoContexto()) {
          <span class="empresa-cargando">Cargando módulos disponibles…</span>
        }
      </div>

      <nav class="modulos-lista">
        <div class="modulo-titulo" [class.modulo-titulo--deshabilitado]="!empresaService.moduloHabilitadoParaEmpresa()">
          {{ empresaService.modulo.etiqueta }}
        </div>

        @if (!empresaService.moduloHabilitadoParaEmpresa()) {
          <p class="modulo-nota">No disponible para esta empresa</p>
        }

        @for (submodulo of empresaService.modulo.submodulos; track submodulo.clave) {
          @if (empresaService.moduloHabilitadoParaEmpresa() && submodulo.implementado) {
            <a [routerLink]="submodulo.ruta" routerLinkActive="submodulo-activo" class="submodulo-item">
              <i [class]="submodulo.icono"></i>
              <span>{{ submodulo.etiqueta }}</span>
            </a>
          } @else {
            <span class="submodulo-item submodulo-item--deshabilitado">
              <i [class]="submodulo.icono"></i>
              <span>{{ submodulo.etiqueta }}</span>
              @if (empresaService.moduloHabilitadoParaEmpresa() && !submodulo.implementado) {
                <span class="submodulo-etiqueta-estado">Próximamente</span>
              }
            </span>
          }
        }

        @if (sesionService.puedeCrearAccesoExterno()) {
          <a routerLink="/accesos-externos" routerLinkActive="submodulo-activo" class="submodulo-item">
            <i class="pi pi-users"></i>
            <span>Accesos Externos</span>
          </a>
        }
      </nav>
    }
  </aside>

  <main class="shell-contenido">
    <router-outlet />
  </main>
</div>
```

- [ ] **Step 6: Verificar que el proyecto compila**

Run: `ng build`
Expected: FAIL esperado — `accesos-externos` y `portal-externo` aún no existen (se agregan en Tasks 8 y 9). Confirmar que el único error es la resolución de esos dos imports dinámicos, no otro.

- [ ] **Step 7: Commit**

```bash
git add src/app/components/shared/sesion-switcher/ src/app/components/shared/app-shell/
git commit -m "feat(gobernanza): selector de sesión de demo y wiring en el shell"
```

---

## Task 8: Pantalla "Accesos Externos" (crear/listar) — Administrador Holding

**Files:**
- Create: `src/app/components/giftcard/acceso-externo-list/acceso-externo-list.ts`
- Create: `src/app/components/giftcard/acceso-externo-list/acceso-externo-list.html`
- Create: `src/app/components/giftcard/acceso-externo-list/acceso-externo-list.css`
- Test: `src/app/components/giftcard/acceso-externo-list/acceso-externo-list.spec.ts`

**Interfaces:**
- Consumes: `AccesoExternoService.accesosDeHoldingActivo()`, `AccesoExternoService.crear()` (Task 5), `CampanaService.campanasDeEmpresaActiva()`, `recursoVigente` (Task 1).

- [ ] **Step 0 (obligatorio por CLAUDE.md): consultar PrimeNG MCP**

Antes de escribir el HTML, consultar `@primeng/mcp` (`get_component p-dialog`, `get_component p-datepicker`, `get_usage_example`) para confirmar la API vigente en PrimeNG 21 de `Dialog` y `DatePicker` (nombres de propiedades, eventos, binding de `visible`). Si el MCP no está disponible en el entorno de ejecución, verificar contra la documentación oficial de PrimeNG 21 antes de continuar — no asumir de memoria.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/app/components/giftcard/acceso-externo-list/acceso-externo-list.spec.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccesoExternoList } from './acceso-externo-list';
import { SesionService } from '../../../services/sesion.service';
import { AccesoExternoService } from '../../../services/acceso-externo.service';

describe('AccesoExternoList', () => {
  let fixture: ComponentFixture<AccesoExternoList>;
  let component: AccesoExternoList;
  let sesionService: SesionService;
  let accesoExternoService: AccesoExternoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AccesoExternoList] }).compileComponents();
    fixture = TestBed.createComponent(AccesoExternoList);
    component = fixture.componentInstance;
    sesionService = TestBed.inject(SesionService);
    accesoExternoService = TestBed.inject(AccesoExternoService);
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    fixture.detectChanges();
  });

  it('puedeCrear es false hasta completar nombre, campaña y fecha', () => {
    expect(component.puedeCrear()).toBe(false);
    component.nombre.set('DOT Solutions');
    component.campanaId.set('campana-1');
    component.fechaExpiracion.set(new Date('2026-12-31'));
    expect(component.puedeCrear()).toBe(true);
  });

  it('confirmarCreacion crea el acceso y cierra el modal', () => {
    component.nombre.set('DOT Solutions');
    component.campanaId.set('campana-1');
    component.fechaExpiracion.set(new Date('2026-12-31'));
    component.modalVisible.set(true);

    component.confirmarCreacion();

    expect(accesoExternoService.accesosDeHoldingActivo().length).toBe(1);
    expect(component.modalVisible()).toBe(false);
  });

  it('confirmarCreacion no hace nada si falta un campo obligatorio', () => {
    component.nombre.set('DOT Solutions');
    component.confirmarCreacion();
    expect(accesoExternoService.accesosDeHoldingActivo().length).toBe(0);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `ng test --include='**/acceso-externo-list.spec.ts'`
Expected: FAIL — `Cannot find module './acceso-externo-list'`

- [ ] **Step 3: Implementar `AccesoExternoList`**

Crear `src/app/components/giftcard/acceso-externo-list/acceso-externo-list.ts`:

```typescript
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrimeTemplate } from 'primeng/api';
import { Card } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Tag } from 'primeng/tag';
import { AccesoExternoService } from '../../../services/acceso-externo.service';
import { CampanaService } from '../../../services/campana.service';
import { RecursoOtorgado, recursoVigente } from '../../../data/governance.model';

@Component({
  selector: 'app-acceso-externo-list',
  imports: [FormsModule, PrimeTemplate, Card, TableModule, Button, Dialog, InputText, Select, DatePicker, Tag],
  templateUrl: './acceso-externo-list.html',
  styleUrl: './acceso-externo-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccesoExternoList {
  private readonly accesoExternoService = inject(AccesoExternoService);
  private readonly campanaService = inject(CampanaService);

  readonly accesos = this.accesoExternoService.accesosDeHoldingActivo;
  readonly campanasDisponibles = this.campanaService.campanasDeEmpresaActiva;

  readonly modalVisible = signal(false);
  readonly nombre = signal('');
  readonly campanaId = signal<string | null>(null);
  readonly fechaExpiracion = signal<Date | null>(null);

  readonly puedeCrear = computed(() => this.nombre().trim().length > 0 && this.campanaId() !== null && this.fechaExpiracion() !== null);

  esVigente(recurso: RecursoOtorgado): boolean {
    return recursoVigente(recurso, new Date().toISOString().slice(0, 10));
  }

  abrirModal(): void {
    this.modalVisible.set(true);
  }

  cerrarModal(): void {
    this.modalVisible.set(false);
    this.nombre.set('');
    this.campanaId.set(null);
    this.fechaExpiracion.set(null);
  }

  confirmarCreacion(): void {
    const campanaId = this.campanaId();
    const fecha = this.fechaExpiracion();
    if (!this.puedeCrear() || !campanaId || !fecha) return;

    this.accesoExternoService.crear({
      nombre: this.nombre().trim(),
      recurso: { tipoRecurso: 'lote_giftcard', idRecurso: campanaId, fechaExpiracion: fecha.toISOString().slice(0, 10) },
    });
    this.cerrarModal();
  }
}
```

Crear `src/app/components/giftcard/acceso-externo-list/acceso-externo-list.html`:

```html
<p-card>
  <div class="encabezado">
    <h2>Accesos Externos</h2>
    <p-button label="Nueva cuenta" icon="pi pi-plus" (onClick)="abrirModal()" />
  </div>

  <p-table [value]="accesos()" dataKey="id">
    <ng-template pTemplate="header">
      <tr>
        <th>Comprador</th>
        <th>Recursos otorgados</th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-acceso>
      <tr>
        <td>{{ acceso.nombre }}</td>
        <td>
          @for (recurso of acceso.recursos; track recurso.idRecurso) {
            <p-tag [value]="recurso.idRecurso + ' · vence ' + recurso.fechaExpiracion" [severity]="esVigente(recurso) ? 'success' : 'secondary'" />
          }
        </td>
      </tr>
    </ng-template>
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="2">Sin cuentas de comprador externo todavía.</td>
      </tr>
    </ng-template>
  </p-table>
</p-card>

<p-dialog header="Nueva cuenta de Comprador Externo" [(visible)]="modalVisible" [modal]="true" [style]="{ width: '28rem' }">
  <label>
    Nombre del comprador
    <input pInputText type="text" [ngModel]="nombre()" (ngModelChange)="nombre.set($event)" />
  </label>

  <label>
    Campaña / lote a otorgar
    <p-select [options]="campanasDisponibles()" optionLabel="nombre" optionValue="id" [ngModel]="campanaId()" (ngModelChange)="campanaId.set($event)" [fluid]="true" />
  </label>

  <label>
    Fecha de expiración del acceso
    <p-datepicker [ngModel]="fechaExpiracion()" (ngModelChange)="fechaExpiracion.set($event)" dateFormat="yy-mm-dd" [fluid]="true" />
  </label>

  <div class="dialog-acciones">
    <p-button label="Cancelar" severity="secondary" (onClick)="cerrarModal()" />
    <p-button label="Crear acceso" [disabled]="!puedeCrear()" (onClick)="confirmarCreacion()" />
  </div>
</p-dialog>
```

Crear `src/app/components/giftcard/acceso-externo-list/acceso-externo-list.css`:

```css
.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.dialog-acciones {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `ng test --include='**/acceso-externo-list.spec.ts'`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/app/components/giftcard/acceso-externo-list/
git commit -m "feat(gobernanza): pantalla de gestión de Accesos Externos para Administrador Holding"
```

---

## Task 9: Portal de Comprador Externo + gating de acciones en el drawer

**Files:**
- Modify: `src/app/services/giftcard.service.ts` (agregar `giftcardsDelAccesoExterno`)
- Modify: `src/app/components/giftcard/giftcard-detail-drawer/giftcard-detail-drawer.ts` (gating por rol)
- Test: agregar casos a `src/app/components/giftcard/giftcard-detail-drawer/giftcard-detail-drawer.spec.ts` (nuevo archivo)
- Create: `src/app/components/giftcard/portal-externo/portal-externo.ts`
- Create: `src/app/components/giftcard/portal-externo/portal-externo.html`
- Create: `src/app/components/giftcard/portal-externo/portal-externo.css`

**Interfaces:**
- Consumes: `AccesoExternoService.recursosVigentesDeSesion()` (Task 5), `SesionService.puedeAdministrarGiftcards()` (Task 2), `GiftcardDetailDrawer` (existente).
- Produces: `GiftcardService.giftcardsDelAccesoExterno()`, `PortalExterno` (componente de ruta `/mi-lote`).

- [ ] **Step 1: Escribir el test que falla — gating del drawer**

Crear `src/app/components/giftcard/giftcard-detail-drawer/giftcard-detail-drawer.spec.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GiftcardDetailDrawer } from './giftcard-detail-drawer';
import { SesionService } from '../../../services/sesion.service';
import { Giftcard } from '../../../data/giftcard.model';

const GIFTCARD_ACTIVA: Giftcard = {
  id: '1',
  empresaId: 'empresa-1',
  codigo: 'GC-TEST-01',
  tipoMonto: 'fijo',
  canal: 'ambos',
  cliente: 'Cliente Test',
  monto: 10000,
  saldo: 10000,
  sid: 'SID-1',
  vigente: true,
  fechaActivacion: '2026-01-01',
  campanaId: null,
  movimientos: [],
};

const GIFTCARD_SIN_ACTIVAR: Giftcard = { ...GIFTCARD_ACTIVA, id: '2', fechaActivacion: null, cliente: null };

describe('GiftcardDetailDrawer — gating por rol', () => {
  let fixture: ComponentFixture<GiftcardDetailDrawer>;
  let component: GiftcardDetailDrawer;
  let sesionService: SesionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [GiftcardDetailDrawer] }).compileComponents();
    fixture = TestBed.createComponent(GiftcardDetailDrawer);
    component = fixture.componentInstance;
    sesionService = TestBed.inject(SesionService);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('giftcard', GIFTCARD_ACTIVA);
  });

  it('administrador-holding puede bloquear y reiniciar activación', () => {
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    fixture.detectChanges();
    expect(component.puedeBloquear()).toBe(true);
    expect(component.puedeReiniciarActivacion()).toBe(true);
  });

  it('comprador-externo no puede bloquear ni reiniciar activación', () => {
    sesionService.entrarComoCompradorExterno('acceso-1', 'DOT Solutions');
    fixture.detectChanges();
    expect(component.puedeBloquear()).toBe(false);
    expect(component.puedeReiniciarActivacion()).toBe(false);
  });

  it('usuario-pos no puede bloquear ni reiniciar activación', () => {
    sesionService.entrarComoInterno('usuario-pos', 'empresa-1a', 'Vendedor Providencia');
    fixture.detectChanges();
    expect(component.puedeBloquear()).toBe(false);
    expect(component.puedeReiniciarActivacion()).toBe(false);
  });

  it('comprador-externo sí puede activar una giftcard sin activar', () => {
    sesionService.entrarComoCompradorExterno('acceso-1', 'DOT Solutions');
    fixture.componentRef.setInput('giftcard', GIFTCARD_SIN_ACTIVAR);
    fixture.detectChanges();
    expect(component.puedeActivar()).toBe(true);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `ng test --include='**/giftcard-detail-drawer.spec.ts'`
Expected: FAIL — `puedeBloquear`/`puedeReiniciarActivacion` hoy no dependen del rol, así que los tests de `comprador-externo`/`usuario-pos` (esperan `false`) fallan.

- [ ] **Step 3: Gating por rol en `GiftcardDetailDrawer`**

En `src/app/components/giftcard/giftcard-detail-drawer/giftcard-detail-drawer.ts:12`, agregar el import de `SesionService`:

```typescript
import { ActivarGiftcardPayload, BloquearGiftcardPayload, Giftcard, GiftcardEstado, MovimientoTipo, ReiniciarActivacionPayload, calcularEstadoGiftcard } from '../../../data/giftcard.model';
import { CampanaService } from '../../../services/campana.service';
import { SesionService } from '../../../services/sesion.service';
```

En `src/app/components/giftcard/giftcard-detail-drawer/giftcard-detail-drawer.ts:41`, agregar la inyección:

```typescript
  private readonly campanaService = inject(CampanaService);
  private readonly sesionService = inject(SesionService);
```

En `src/app/components/giftcard/giftcard-detail-drawer/giftcard-detail-drawer.ts:84-87`, reemplazar:

```typescript
  readonly puedeActivar = computed(() => this.estadoCalculado() === 'sin-activar');
  readonly esDinamico = computed(() => this.giftcard()?.tipoMonto === 'dinamico');
  readonly puedeBloquear = computed(() => this.estadoCalculado() !== 'inactiva' && this.estadoCalculado() !== null);
  readonly puedeReiniciarActivacion = computed(() => this.giftcard()?.fechaActivacion !== null && this.estadoCalculado() !== 'inactiva');
```

por:

```typescript
  readonly puedeActivar = computed(() => this.estadoCalculado() === 'sin-activar');
  readonly esDinamico = computed(() => this.giftcard()?.tipoMonto === 'dinamico');
  readonly puedeBloquear = computed(
    () => this.sesionService.puedeAdministrarGiftcards() && this.estadoCalculado() !== 'inactiva' && this.estadoCalculado() !== null,
  );
  readonly puedeReiniciarActivacion = computed(
    () => this.sesionService.puedeAdministrarGiftcards() && this.giftcard()?.fechaActivacion !== null && this.estadoCalculado() !== 'inactiva',
  );
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `ng test --include='**/giftcard-detail-drawer.spec.ts'`
Expected: PASS (4 tests)

- [ ] **Step 5: Agregar `giftcardsDelAccesoExterno` a `GiftcardService`**

En `src/app/services/giftcard.service.ts`, agregar el import de `AccesoExternoService`:

```typescript
import { EmpresaService } from './empresa.service';
import { SesionService } from './sesion.service';
import { AccesoExternoService } from './acceso-externo.service';
```

Agregar la inyección junto a las existentes:

```typescript
  private readonly empresaService = inject(EmpresaService);
  private readonly sesionService = inject(SesionService);
  private readonly accesoExternoService = inject(AccesoExternoService);
```

Agregar el computed justo después de `giftcardsDeEmpresaActiva`:

```typescript
  /** Giftcards visibles para la sesión de comprador externo — solo las de sus recursos vigentes. */
  readonly giftcardsDelAccesoExterno = computed(() => {
    const idsRecursos = this.accesoExternoService.recursosVigentesDeSesion().map((r) => r.idRecurso);
    return this._giftcards().filter((g) => g.campanaId !== null && idsRecursos.includes(g.campanaId));
  });
```

- [ ] **Step 6: Escribir el test que falla — `giftcardsDelAccesoExterno`**

En `src/app/services/giftcard.service.spec.ts`, agregar el import de `AccesoExternoService` al inicio del archivo:

```typescript
import { AccesoExternoService } from './acceso-externo.service';
```

Reemplazar la declaración de variables y el `beforeEach` existentes:

```typescript
describe('GiftcardService — alcance por holding', () => {
  let giftcardService: GiftcardService;
  let empresaService: EmpresaService;
  let sesionService: SesionService;
```

por:

```typescript
describe('GiftcardService — alcance por holding', () => {
  let giftcardService: GiftcardService;
  let empresaService: EmpresaService;
  let sesionService: SesionService;
  let accesoExternoService: AccesoExternoService;
```

y dentro del `beforeEach`, agregar la línea `accesoExternoService = TestBed.inject(AccesoExternoService);` junto a las otras inyecciones existentes. Luego agregar dentro del mismo `describe`:

```typescript
  it('giftcardsDelAccesoExterno solo muestra giftcards de campañas otorgadas y vigentes', () => {
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    // MOCK_GIFTCARDS trae 2 giftcards con campanaId: 'campana-1' (ids '1' y '2').
    accesoExternoService.crear({ nombre: 'DOT Solutions', recurso: { tipoRecurso: 'lote_giftcard', idRecurso: 'campana-1', fechaExpiracion: '2099-01-01' } });
    const [acceso] = accesoExternoService.accesosDeHoldingActivo();

    sesionService.entrarComoCompradorExterno(acceso.id, 'DOT Solutions');

    const visibles = giftcardService.giftcardsDelAccesoExterno();
    expect(visibles.map((g) => g.id).sort()).toEqual(['1', '2']);
  });

  it('giftcardsDelAccesoExterno queda vacío si el recurso otorgado ya venció', () => {
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    accesoExternoService.crear({ nombre: 'DOT Solutions', recurso: { tipoRecurso: 'lote_giftcard', idRecurso: 'campana-1', fechaExpiracion: '2000-01-01' } });
    const [acceso] = accesoExternoService.accesosDeHoldingActivo();

    sesionService.entrarComoCompradorExterno(acceso.id, 'DOT Solutions');

    expect(giftcardService.giftcardsDelAccesoExterno()).toEqual([]);
  });
```

Run: `ng test --include='**/giftcard.service.spec.ts'`
Expected: PASS — ambos casos ejercitan `giftcardsDelAccesoExterno` end-to-end contra `AccesoExternoService` real (no un mock), confirmando que un recurso vigente muestra las giftcards de esa campaña y uno vencido no muestra ninguna.

- [ ] **Step 7: Implementar `PortalExterno`**

Crear `src/app/components/giftcard/portal-externo/portal-externo.ts`:

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { PrimeTemplate } from 'primeng/api';
import { Card } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { GiftcardService } from '../../../services/giftcard.service';
import { ActivarGiftcardPayload, BloquearGiftcardPayload, Giftcard, ReiniciarActivacionPayload, calcularEstadoGiftcard } from '../../../data/giftcard.model';
import { GiftcardDetailDrawer } from '../giftcard-detail-drawer/giftcard-detail-drawer';

@Component({
  selector: 'app-portal-externo',
  imports: [CurrencyPipe, PrimeTemplate, Card, TableModule, Tag, Button, GiftcardDetailDrawer],
  templateUrl: './portal-externo.html',
  styleUrl: './portal-externo.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalExterno {
  private readonly giftcardService = inject(GiftcardService);

  readonly giftcards = this.giftcardService.giftcardsDelAccesoExterno;
  readonly detalleVisible = signal(false);
  readonly giftcardSeleccionada = signal<Giftcard | null>(null);

  estado(giftcard: Giftcard) {
    return calcularEstadoGiftcard(giftcard);
  }

  verDetalle(giftcard: Giftcard): void {
    this.giftcardSeleccionada.set(giftcard);
    this.detalleVisible.set(true);
  }

  activarGiftcard(payload: ActivarGiftcardPayload): void {
    this.giftcardService.activar(payload);
  }

  // El comprador externo nunca puede bloquear ni reiniciar — el drawer ya lo restringe (Step 3), pero los outputs deben cablearse igual.
  bloquearGiftcard(_payload: BloquearGiftcardPayload): void {}
  reiniciarActivacionGiftcard(_payload: ReiniciarActivacionPayload): void {}
}
```

Crear `src/app/components/giftcard/portal-externo/portal-externo.html`:

```html
<p-card>
  <h2>Mis giftcards</h2>

  <p-table [value]="giftcards()" dataKey="id">
    <ng-template pTemplate="header">
      <tr>
        <th>Código</th>
        <th>Monto</th>
        <th>Estado</th>
        <th></th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-giftcard>
      <tr>
        <td>{{ giftcard.codigo }}</td>
        <td>{{ giftcard.monto | currency: 'CLP' : 'symbol' : '1.0-0' }}</td>
        <td><p-tag [value]="estado(giftcard)" /></td>
        <td><p-button label="Ver" (onClick)="verDetalle(giftcard)" /></td>
      </tr>
    </ng-template>
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="4">Sin giftcards otorgadas, o todas vencidas.</td>
      </tr>
    </ng-template>
  </p-table>
</p-card>

<app-giftcard-detail-drawer
  [(visible)]="detalleVisible"
  [giftcard]="giftcardSeleccionada()"
  (activar)="activarGiftcard($event)"
  (bloquear)="bloquearGiftcard($event)"
  (reiniciarActivacion)="reiniciarActivacionGiftcard($event)"
/>
```

Crear `src/app/components/giftcard/portal-externo/portal-externo.css`:

```css
p-card h2 {
  margin-bottom: 1rem;
}
```

- [ ] **Step 8: Verificar que el proyecto compila completo**

Run: `ng build`
Expected: build exitoso — ya existen `acceso-externo-list` (Task 8) y `portal-externo`, así que las rutas de `app.routes.ts` (Task 6) resuelven.

- [ ] **Step 9: Correr toda la suite de tests**

Run: `ng test`
Expected: PASS — todos los specs de Tasks 1 a 9 en verde.

- [ ] **Step 10: Commit**

```bash
git add src/app/services/giftcard.service.ts src/app/services/giftcard.service.spec.ts src/app/components/giftcard/giftcard-detail-drawer/giftcard-detail-drawer.ts src/app/components/giftcard/giftcard-detail-drawer/giftcard-detail-drawer.spec.ts src/app/components/giftcard/portal-externo/
git commit -m "feat(gobernanza): portal de Comprador Externo y gating de acciones administrativas en el drawer"
```

---

## Task 10: Ocultar creación de giftcards/campañas para Usuario POS

**Files:**
- Modify: `src/app/components/giftcard/giftcard-list/giftcard-list.html:57`
- Modify: `src/app/components/giftcard/giftcard-list/giftcard-list.ts` (completo, agregar `sesionService`)
- Modify: `src/app/components/giftcard/campana-card-grid/campana-card-grid.html:11-13`
- Modify: `src/app/components/giftcard/campana-card-grid/campana-card-grid.ts` (agregar `sesionService`)
- Test: `src/app/components/giftcard/giftcard-list/giftcard-list.spec.ts`

**Interfaces:**
- Consumes: `SesionService.puedeAdministrarGiftcards()` (Task 2).

- [ ] **Step 1: Escribir el test que falla**

Crear `src/app/components/giftcard/giftcard-list/giftcard-list.spec.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GiftcardList } from './giftcard-list';
import { SesionService } from '../../../services/sesion.service';

describe('GiftcardList — gating de creación por rol', () => {
  let fixture: ComponentFixture<GiftcardList>;
  let sesionService: SesionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [GiftcardList] }).compileComponents();
    fixture = TestBed.createComponent(GiftcardList);
    sesionService = TestBed.inject(SesionService);
  });

  it('usuario-pos no ve el botón "Crear giftcard"', () => {
    sesionService.entrarComoInterno('usuario-pos', 'empresa-1a', 'Vendedor Providencia');
    fixture.detectChanges();
    const boton = fixture.nativeElement.querySelector('.filtro-crear');
    expect(boton).toBeNull();
  });

  it('administrador-holding sí ve el botón "Crear giftcard"', () => {
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    fixture.detectChanges();
    const boton = fixture.nativeElement.querySelector('.filtro-crear');
    expect(boton).not.toBeNull();
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `ng test --include='**/giftcard-list.spec.ts'`
Expected: FAIL — hoy el botón `.filtro-crear` siempre está presente, así que el primer test falla.

- [ ] **Step 3: Gating en `GiftcardList`**

En `src/app/components/giftcard/giftcard-list/giftcard-list.ts:1`, agregar el import:

```typescript
import { GiftcardService } from '../../../services/giftcard.service';
import { CampanaService } from '../../../services/campana.service';
import { SesionService } from '../../../services/sesion.service';
```

En `src/app/components/giftcard/giftcard-list/giftcard-list.ts:81-82`, agregar la inyección:

```typescript
  private readonly giftcardService = inject(GiftcardService);
  private readonly campanaService = inject(CampanaService);
  readonly sesionService = inject(SesionService);
```

En `src/app/components/giftcard/giftcard-list/giftcard-list.html:57`, reemplazar:

```html
      <p-button label="Crear giftcard" icon="pi pi-plus" class="filtro-crear" (onClick)="modalCrearVisible.set(true)" />
```

por:

```html
      @if (sesionService.puedeAdministrarGiftcards()) {
        <p-button label="Crear giftcard" icon="pi pi-plus" class="filtro-crear" (onClick)="modalCrearVisible.set(true)" />
      }
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `ng test --include='**/giftcard-list.spec.ts'`
Expected: PASS (2 tests)

- [ ] **Step 5: Mismo gating en `CampanaCardGrid`**

En `src/app/components/giftcard/campana-card-grid/campana-card-grid.ts:1`, agregar el import:

```typescript
import { CampanaService } from '../../../services/campana.service';
import { SesionService } from '../../../services/sesion.service';
```

En `src/app/components/giftcard/campana-card-grid/campana-card-grid.ts:22-23`, agregar la inyección:

```typescript
  private readonly campanaService = inject(CampanaService);
  private readonly confirmationService = inject(ConfirmationService);
  readonly sesionService = inject(SesionService);
```

En `src/app/components/giftcard/campana-card-grid/campana-card-grid.html:11-13`, reemplazar:

```html
      @if (!verArchivadas()) {
        <p-button label="Crear campaña" icon="pi pi-plus" (onClick)="modalCrearVisible.set(true)" />
      }
```

por:

```html
      @if (!verArchivadas() && sesionService.puedeAdministrarGiftcards()) {
        <p-button label="Crear campaña" icon="pi pi-plus" (onClick)="modalCrearVisible.set(true)" />
      }
```

- [ ] **Step 6: Correr toda la suite y verificar el build final**

Run: `ng test`
Expected: PASS — toda la suite (Tasks 1-10) en verde.

Run: `ng build`
Expected: build exitoso sin errores ni warnings de presupuesto.

- [ ] **Step 7: Commit**

```bash
git add src/app/components/giftcard/giftcard-list/ src/app/components/giftcard/campana-card-grid/
git commit -m "feat(gobernanza): oculta creación de giftcards/campañas para Usuario POS"
```

---

## Resumen de cobertura vs. la spec de producto

| Sección de la spec | Task(s) |
|---|---|
| §3 Modelo de roles (5 roles, alcance genérico) | 1, 2 |
| §3 Administrador Tienda / holding | 1, 3 |
| §4.1 Creación manual por Administrador Holding, multi-recurso por cuenta | 5, 8 |
| §4.2 Vencimiento por recurso | 1, 5, 8 |
| §4.3 Aislamiento (nunca navega fuera, sin crear/modificar) | 6, 9 |
| §4.4 Trazabilidad (SID + usuario de sesión) | 4 |
| §4.5 Sin wizard global, reutiliza drawer/drill-in | 9 |
| §6 Preguntas abiertas resueltas | cubiertas transversalmente por 1, 2, 5, 8, 9 |
