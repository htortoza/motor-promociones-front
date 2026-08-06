# Gobernanza y Multi-tenencia — Módulo Giftcard
**Proyecto: Motor de Promociones · DOT Solutions**
Confidencial · versión 1.0 — spec validada, sucesora de v0.1

> Este documento reemplaza `Giftcard_Gobernanza_Multitenencia_v0.1.md`. Todas las decisiones marcadas **[✅ VALIDADO]** fueron cerradas en sesión de brainstorming del 2026-08-06 con el responsable de producto, resolviendo las preguntas abiertas de la v0.1. Los ítems marcados **[✅ FUENTE]** siguen siendo los que ya venían de transcripciones/sesiones UI-UX previas.

---

## 1. Punto de partida

El módulo Giftcard ya tiene un modelo de roles: **Master** (control global), **Administrador** (nivel empresa) y **Usuario** (operacional/POS). [✅ FUENTE] Existe un flujo de activación de lote pensado originalmente para el rol Administrador, pero **no como wizard global** — hoy la activación ocurre solo desde el drawer de detalle de una giftcard puntual o desde el drill-in a una campaña específica; un wizard de activación global fue removido deliberadamente por ser redundante con esos dos flujos. [✅ FUENTE — estado actual del código]

Este modelo asume que quien activa un lote pertenece a la misma empresa dueña de las giftcards. El caso que motiva esta spec lo rompe: el comprador del lote es una **empresa externa**, sin relación jerárquica con el retailer.

Verificación de contexto (2026-08-06): no existe hoy en el código ningún guard, `AuthService`, ni enum de roles — solo un placeholder de auditoría (`USUARIO_ACTUAL = 'Administrador'`). El modelo de `Empresa` es plano (`{id, nombre}`), sin holding ni jerarquía. Esta spec describe el modelo de **producto/negocio**; su implementación en Angular (guards, modelo de datos, pantallas) es un diseño técnico separado, a resolver en una spec de frontend posterior.

---

## 2. Dos dimensiones de gobernanza

### 2.1 Gobernanza interna (holding multi-tienda)
Estructura de una empresa cliente de DOT Solutions (ej. Italmod) con varias tiendas bajo un mismo holding. Ya existe como concepto para promociones [✅ FUENTE — reunión 23 jun] y se extiende a Giftcard.

### 2.2 Gobernanza externa (comprador B2B de lote)
Caso Italmod ↔ DOT Solutions: empresa que no es tenant de la plataforma ni parte del holding del retailer, que necesita un panel acotado para activar y asignar las giftcards que compró. No es una variación del rol Administrador — es un **tipo de acceso distinto**, con alcance limitado a un recurso específico.

---

## 3. Modelo de roles (validado)

Un solo enum de rol — 5 valores. El acceso externo **no** es un concepto de "grant" separado; es un valor más del mismo enum, con alcance definido de forma genérica. **[✅ VALIDADO]**

| Rol | Alcance | Puede ver | Puede hacer |
|---|---|---|---|
| **Master** | Global, todas las empresas (tenants) | Todas las empresas, tiendas y lotes | Todo — configuración de plataforma, alta de nuevas empresas |
| **Administrador Holding** | Una empresa/holding completa | Todas las tiendas y lotes de su holding | Crea lotes, crea cuentas de Comprador Externo, ve reportes consolidados |
| **Administrador Tienda** | Una tienda dentro del holding | Solo giftcards/lotes de su tienda | Igual que Administrador Holding pero acotado a su tienda |
| **Usuario POS** | Una tienda, operación diaria | Consulta de saldo, canje | Vender/canjear giftcards en punto de venta |
| **Comprador Externo** | `tipo_recurso + id_recurso` — uno o más recursos otorgados (hoy: lote(s) de giftcard); no pertenece a la empresa ni al holding | Solo el/los recurso(s) otorgado(s) y su historial de canje | Activar códigos vigentes del recurso otorgado y asignarlos a destinatarios. Nunca crea, modifica monto, ni extiende vigencia |

**Por qué genérico desde el inicio:** el alcance de Comprador Externo se modela como `tipo_recurso + id_recurso` (no como "lote de giftcard" fijo) para que el mismo rol sirva, sin reescribirse, cuando el patrón se necesite en otros módulos del motor de promociones (ej. cupones para influencers, cargas masivas — ya mencionado en reunión 30 jun). [✅ VALIDADO]

**Administrador Tienda incluido en el MVP** — se descartó la opción de dejarlo fuera; los holdings grandes necesitan delegar sin dar visibilidad total desde el día uno. [✅ VALIDADO]

---

## 4. Cuenta de Comprador Externo

### 4.1 Creación
- **Solo el Administrador Holding la crea** — no Master (evita acoplar operación comercial a soporte de plataforma), no Administrador Tienda (evita fragmentar el control de acceso externo). [✅ VALIDADO]
- **Manual**, por cada relación comercial B2B — no es self-service con link de invitación. [✅ VALIDADO]
- **Una cuenta puede acumular múltiples recursos en el tiempo**: si el mismo comprador (ej. DOT Solutions) vuelve a comprar, el Administrador Holding agrega el recurso nuevo a la cuenta existente, no crea una cuenta nueva. [✅ VALIDADO]
- Al crear o ampliar el acceso, el Administrador Holding define: recurso(s) otorgado(s) y fecha de expiración de cada grant.

### 4.2 Vencimiento
- Cada grant de recurso tiene **fecha de expiración obligatoria**, definida por el Administrador Holding. [✅ VALIDADO]
- Al vencer: el recurso queda no-accesible para esa cuenta. Códigos en estado Vigente-no-activada **no se activan solos** — quedan bloqueados hasta que el Administrador Holding reasigne o extienda el acceso.
- La cuenta no vence en sí misma si tiene otros recursos vigentes (multi-recurso); solo vence el grant puntual.

### 4.3 Aislamiento
- Una cuenta de Comprador Externo **nunca** navega fuera del/de los recurso(s) otorgado(s), ni por URL directa ni por API. Mismo principio de "alcance visible" de los roles internos, en su versión más restrictiva.
- No ve otros lotes de la empresa vendedora, ni de otros compradores, ni configuración alguna del sistema.
- Sin capacidad de creación: activa y asigna, pero no crea códigos, no modifica montos, no extiende vigencia.

### 4.4 Trazabilidad
- Cada activación queda registrada con el SID de la transacción y qué cuenta externa la ejecutó — reconstruible: quién activó, cuándo, bajo qué acceso.
- El **vendedor** (Administrador Holding) ve el estado agregado del recurso vendido (cuántos activos, cuántos pendientes) sin ver a qué destinatario final asignó el comprador cada código — eso es dato interno del comprador.
- El **comprador externo** ve el historial de canje de su(s) recurso(s) — cuántos usados/no usados — sin ver detalle interno del retailer. [✅ VALIDADO]

### 4.5 Flujo de activación
No se reintroduce un wizard global. El comprador externo entra a una vista filtrada equivalente al patrón de drawer/drill-in ya vigente en el producto, acotada a su recurso. [✅ VALIDADO — corrige la v0.1, que asumía reutilizar un wizard que no existe en el código actual]

---

## 5. Caso de uso: Italmod vende 50 giftcards a DOT Solutions

1. **Venta del lote.** Administrador Holding de Italmod crea un lote corporativo de 50 giftcards de $100.000. Estado inicial: **Vigente** (código existe, no activado) — anti-fraude si las tarjetas se pierden o son robadas en tránsito. [✅ FUENTE]

2. **Entrega sin activar.** Las 50 tarjetas se entregan a DOT Solutions todavía en estado Vigente. Nadie puede canjear una tarjeta vigente-no-activada aunque la tenga físicamente. [✅ FUENTE]

3. **Alta de cuenta externa.** Administrador Holding de Italmod crea (o reutiliza, si DOT Solutions ya tiene cuenta de una compra anterior) la cuenta de Comprador Externo, otorgándole el recurso `lote_giftcard:123` con fecha de expiración definida. La cuenta no ve otros lotes de Italmod ni de otros clientes; accede a la vista tipo drawer/drill-in filtrada a ese lote.

4. **Activación por DOT Solutions.** Un usuario de DOT Solutions entra con esa cuenta, ve solo su lote, selecciona cada código vigente y asigna destinatario (nombre y/o email). Cada confirmación genera un nuevo SID; el código pasa a **Activa**. [✅ FUENTE, mecánica reutilizada]

5. **Post-activación.** DOT Solutions mantiene acceso de solo lectura al historial de canje de su lote (cuántas usadas/no usadas), sin ver a qué colaborador propio se asignó cada una desde el lado de Italmod.

6. **Trazabilidad cruzada.** Italmod ve, desde su propio panel, el estado agregado del lote vendido (activos/pendientes), sin ver el detalle de a qué colaborador de DOT Solutions se asignó cada tarjeta.

7. **Si el lote no se activa completo.** Al llegar la fecha de expiración del grant, los códigos Vigente-no-activada quedan bloqueados para esa cuenta. Italmod decide manualmente si reasigna el acceso o extiende el vencimiento.

---

## 6. Preguntas abiertas de la v0.1 — resueltas

| # | Pregunta | Resolución |
|---|---|---|
| 1 | ¿Administrador Tienda necesario para el MVP? | **Sí**, incluido desde el MVP |
| 2 | ¿Alta de cuenta externa manual o self-service? | **Manual**, la crea el Administrador Holding |
| 3 | ¿Comprador externo ve historial de canje post-activación? | **Sí**, de su(s) recurso(s) propio(s) |
| 4 | ¿Cuenta nueva por compra o acumula lotes? | **Misma cuenta**, múltiples recursos acumulados en el tiempo |
| 5 | ¿Qué pasa si nunca activa el lote completo? | **Vence** tras fecha/plazo definido por el Administrador Holding |
| 6 | ¿Patrón específico de Giftcard o genérico? | **Genérico desde el inicio** (`tipo_recurso + id_recurso`) |

---

## 7. Decisiones de arquitectura de producto (resumen)

- **Un solo enum de rol** (5 valores) en vez de separar el acceso externo en un modelo de "grant" independiente — más simple de explicar y de gobernar en una única tabla de roles.
- El campo de alcance de **Comprador Externo** es genérico (`tipo_recurso + id_recurso`) para no requerir un rediseño cuando el patrón se extienda a otros módulos.
- **Sin wizard global de activación** — se reutiliza el patrón drawer/drill-in ya vigente en el producto, acotado al recurso otorgado.

---

## 8. Siguiente paso

Esta spec cierra el modelo de **producto/negocio**. El diseño de implementación en frontend (Angular): modelo de datos (`Empresa` con holding, `Rol`, grant de recurso), guards, pantallas de gestión de cuentas externas y de activación acotada — es una spec técnica separada, a brainstormear después de esta.
