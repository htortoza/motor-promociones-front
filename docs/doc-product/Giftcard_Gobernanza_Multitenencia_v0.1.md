# Gobernanza y Multi-tenencia — Módulo Giftcard
**Proyecto: Motor de Promociones · DOT Solutions**
Confidencial · versión 0.1

> **Cómo leer este documento**
> - **[✅ FUENTE]** → tomado directamente de trabajo previo ya validado en el proyecto (transcripciones o sesión de diseño UI/UX de Giftcard).
> - **[⚠ POR VALIDAR]** → propuesta nueva, no cubierta explícitamente en las fuentes. Este documento es **mayormente POR VALIDAR**, porque la gobernanza para holdings multi-tienda y el acceso de compradores externos no se había discutido en las reuniones registradas. Se construye por extensión lógica del modelo de roles ya definido.

---

## 1. Punto de partida: lo ya definido

El módulo Giftcard ya tiene un modelo de roles de tres niveles: **Master** (control global sobre todas las empresas del sistema), **Administrador** (nivel empresa, gestiona usuarios/configuración/campañas solo de su propia empresa) y **Usuario** (operacional/vendedor, acceso restringido a ejecución de ventas y consultas básicas en punto de venta). [✅ FUENTE] También existe ya un flujo de **activación de lote** (wizard de 4 pasos: elegir lote → seleccionar código vigente → asignar destinatario → confirmar, con generación de nuevo SID), pensado originalmente para el rol Administrador. [✅ FUENTE]

Este modelo asume implícitamente que quien activa un lote **pertenece a la misma empresa dueña de las giftcards**. El caso que se plantea ahora rompe ese supuesto: el comprador del lote es una **empresa externa**, sin relación jerárquica con el retailer. Esto exige agregar una dimensión de gobernanza que hoy no existe. [⚠ POR VALIDAR]

---

## 2. Dos dimensiones de gobernanza, no una

Conviene separarlas porque resuelven problemas distintos y probablemente se implementan distinto:

### 2.1 Gobernanza interna (holding multi-tienda)
Es la estructura de una empresa cliente de DOT Solutions (ej. Italmod) que tiene varias tiendas o subsidiarias bajo un mismo holding. En las transcripciones esto ya aparece como concepto para promociones ("si tuviera más empresas, fueron un holding de varias empresas, esta promoción la pueden cambiar para distintas empresas... y aquí puedes seleccionar las tiendas") [✅ FUENTE — reunión 23 jun], y aplica igual de bien a Giftcard: un holding necesita ver el agregado de todas sus tiendas, pero también puede necesitar administración por tienda individual. [⚠ POR VALIDAR — la lógica de holding se discutió para promociones, no específicamente para Giftcard]

### 2.2 Gobernanza externa (comprador B2B de lote)
Es el caso Italmod ↔ DOT Solutions: una empresa que **no es tenant de la plataforma ni parte del holding del retailer**, pero necesita entrar a un panel acotado para activar y asignar las giftcards que compró. Esto no es una variación del rol Administrador — es un **tipo de acceso distinto**, con alcance limitado a un lote específico y sin visibilidad de nada más del sistema. [⚠ POR VALIDAR]

---

## 3. Modelo de roles ampliado

| Rol | Alcance | Puede ver | Puede hacer |
|---|---|---|---|
| **Master** [✅ FUENTE, nivel base] | Global, todas las empresas (tenants) | Todas las empresas, todas las tiendas, todos los lotes | Todo — configuración de plataforma, alta de nuevas empresas |
| **Administrador Holding** [⚠ POR VALIDAR — nuevo nivel dentro de "Administrador"] | Una empresa/holding completa | Todas las tiendas y lotes de su holding | Crea lotes, crea accesos externos (ver 4), ve reportes consolidados |
| **Administrador Tienda** [⚠ POR VALIDAR] | Una tienda dentro del holding | Solo los giftcards/lotes de su tienda | Igual que Administrador Holding pero acotado a su tienda — útil si el holding quiere delegar sin dar visibilidad total |
| **Usuario (POS)** [✅ FUENTE] | Una tienda, operación diaria | Consulta de saldo, canje | Vender/canjear giftcards en punto de venta |
| **Cliente Comprador Externo** [⚠ POR VALIDAR — rol nuevo] | Un lote específico (o varios lotes del mismo comprador) | Solo su(s) propio(s) lote(s) — nada del resto de la empresa | Activar códigos vigentes de su lote y asignarlos a destinatarios |

La fila nueva es la última. Todo lo demás es extensión directa de lo ya definido, no una arquitectura distinta.

---

## 4. Caso de uso: Italmod vende 50 giftcards a DOT Solutions

Paso a paso, contrastando qué pasa hoy (asumido) vs. qué se necesita:

1. **Venta del lote.** Un Administrador de Italmod crea un lote corporativo de 50 giftcards de $100.000, monto fijo, canal "solo tienda" o "ambos" según corresponda. [✅ FUENTE — creación de lote corporativo ya existe en el flujo]. Estado inicial: **Vigente** (código existe, no activado) — el mismo estado pensado justamente para evitar fraude si las tarjetas físicas se pierden o son robadas en tránsito antes de ser entregadas. [✅ FUENTE]

2. **Entrega del lote sin activar.** Las 50 tarjetas físicas (o sus códigos) se entregan a DOT Solutions **todavía en estado Vigente**, no Activa. Esto es exactamente el caso anti-fraude para el que se diseñó el estado Vigente — nadie puede canjear una tarjeta vigente-no-activada aunque la tenga físicamente. [✅ FUENTE, aplicado al caso correcto]

3. **Acceso externo.** Italmod (o Master) genera una **cuenta de acceso acotada** para DOT Solutions, vinculada únicamente al lote recién creado. Esta cuenta: [⚠ POR VALIDAR — todo este punto es nuevo]
   - No ve otros lotes de Italmod, ni de otros clientes de Italmod, ni configuración alguna del sistema.
   - Solo tiene acceso al wizard de activación (el mismo de 4 pasos ya diseñado), pre-filtrado a su lote.
   - Probablemente debería tener vigencia temporal (expira tras usarse o tras N días) — a definir.

4. **Activación por DOT Solutions.** Un usuario de DOT Solutions entra con esa cuenta, recorre el wizard: elige el lote (ya viene preseleccionado, no hay "otro" que elegir) → selecciona cada código vigente → asigna destinatario (nombre del colaborador, y/o email para envío del código) → confirma. Cada confirmación genera un nuevo SID y el estado del código pasa a **Activa**. [✅ FUENTE, mecánica del wizard reutilizada]

5. **Trazabilidad cruzada.** Italmod, desde su propio panel, debería poder ver el **estado agregado** del lote que vendió (cuántos activos, cuántos pendientes) sin necesariamente ver el detalle de a qué colaborador de DOT Solutions se asignó cada tarjeta — eso es dato interno de DOT Solutions. [⚠ POR VALIDAR — decisión de privacidad/negocio pendiente, ver preguntas abiertas]

---

## 5. Reglas propuestas (todas POR VALIDAR)

- **Aislamiento estricto:** una cuenta de Cliente Comprador Externo jamás debe poder navegar fuera del lote que se le asignó, ni por URL directa ni por API. Es el mismo principio de "alcance visible" que ya se definió para roles internos, pero llevado a su versión más restrictiva.
- **Quién crea el acceso externo:** el Administrador Holding de la empresa vendedora (Italmod) debería ser quien genera la invitación/cuenta para el comprador — no Master, para no acoplar esta operación comercial a soporte de plataforma.
- **Expiración:** el acceso externo debería poder configurarse con fecha de expiración o "un solo uso completo" (se cierra automáticamente cuando se activan todos los códigos del lote).
- **Sin capacidad de creación:** el comprador externo activa y asigna, pero no puede crear nuevos códigos, ni modificar montos, ni extender la vigencia del lote — esas son atribuciones exclusivas del vendedor.
- **Trazabilidad con SID de dos partes:** cada activación queda registrada con el SID de la transacción y con qué cuenta externa la ejecutó, para que ante un reclamo se pueda reconstruir "quién activó, cuándo, y bajo qué acceso".

---

## 6. Preguntas abiertas

1. ¿El "Administrador Tienda" es realmente necesario para el MVP, o alcanza con Administrador Holding + Usuario POS? (afecta directamente el esfuerzo de desarrollo)
2. ¿La cuenta de Cliente Comprador Externo la crea Italmod manualmente por cada venta B2B, o debe ser un flujo self-service (Italmod configura un link/código de invitación que el comprador usa para crear su propia cuenta)?
3. ¿DOT Solutions (el comprador en el ejemplo) necesita ver historial de canje después de entregar las tarjetas activadas (ej. cuántas ya fueron usadas por sus colaboradores), o su responsabilidad termina en la activación?
4. ¿Un mismo comprador externo puede tener múltiples lotes acumulados en el tiempo (ej. compra recurrente cada evento) bajo la misma cuenta, o se crea una cuenta nueva por cada compra?
5. ¿Qué pasa si DOT Solutions nunca activa el lote completo? ¿Vence, se factura igual, se puede reasignar a otro comprador?
6. ¿Este acceso externo aplica solo a Giftcard o es un patrón que también necesitará el motor de promociones en otros módulos (ej. cupones para influencers, mencionado en la reunión del 30 jun como "cargas masivas" desde afuera)? [✅ FUENTE — la idea de acceso externo para cargar cupones ya se mencionó, aunque no se resolvió]
