# Contexto general — Módulo Giftcard
**Proyecto: Motor de Promociones · DOT Solutions**
Confidencial · versión 0.1

---

## 1. Resumen ejecutivo

DOT Solutions está definiendo un **Motor de Promociones**: un motor de cálculo cloud, agnóstico de plataforma (no atado a Prisma), expuesto por API REST, pensado para operar de forma omnicanal (tiendas físicas, Mobile One, e-commerce, TC Post, etc.). Su valor diferencial frente a las alternativas del mercado es el cálculo de **"mejor promoción"**, capacidad que hoy no existe en Prisma ni en la mayoría de los motores que usan los clientes.

Dentro de ese mismo proyecto, se decidió que el módulo de **Giftcards** viva como parte del mismo microservicio que el motor de promociones, en lugar de ser un producto separado. [✅ FUENTE] Este documento es el punto de entrada para entender **qué es este módulo, qué se ha definido y qué se ha diseñado hasta ahora**.

---

## 2. Por qué Giftcard vive junto al Motor de Promociones

Conceptualmente son cosas distintas: una giftcard es una **forma de pago** (no reduce el carro, se aplica al momento de pagar), mientras que una promoción es un **descuento antes del pago**. [✅ FUENTE — reunión 23 jun] Sin embargo, se decidió fusionarlos en un único microservicio por una razón operativa, no conceptual: sus ciclos de vida y sus puntos de consulta (Mobile One, e-commerce, Prisma/Retail Pro) convergen, y mantenerlos separados generaría complejidad de infraestructura innecesaria (dos microservicios en vez de uno, con la misma base de clientes consultándolos). [✅ FUENTE]

La estrategia de desarrollo acordada es salir con un **MVP funcional** que cubra lo esencial, priorizando operatividad inmediata por sobre la arquitectura final (la migración completa a Nest queda para después del MVP). [✅ FUENTE]

---

## 3. Cómo llegamos hasta acá (línea de tiempo)

1. **23 jun 2026** — Reunión inicial: se define que el motor de promociones debe ser externo a Prisma, cloud, agnóstico, y se identifican los clientes con necesidades más relevantes (Autoplanet quiere "mejor promoción" vía Prisma; Mascota y Flores tienen casos particulares de cupones/selección manual).
2. **30 jun 2026** — Segunda reunión: se profundiza en tipos de promociones, lógica de "mejor promo" vs. prioridad vs. selección manual, casos de devoluciones/cambios, pagos con tarjeta, cupones, y se decide un scope de MVP acotado a los tipos de promoción más comunes.
3. **Documento de lógica de Giftcards** — Se formaliza la decisión de fusión con el motor de promociones, el modelo de estados (Vigente / Activa / Inactiva), la lógica de monto fijo vs. dinámico, la trazabilidad por SID, la arquitectura de integración con Mobile One, y la gobernanza de roles (Master / Administrador / Usuario).
4. **Trabajo de UI/UX (este momento)** — A partir de esa lógica, se construyeron mockups interactivos del panel de administración de giftcards y del flujo de activación de lotes corporativos, y se tradujeron a una especificación de diseño con metodología Atomic Design, independiente de la implementación técnica (PrimeNG/Angular).

---

## 4. Modelo de negocio del Giftcard (lo que ya está definido)

### 4.1 Estados — no es un solo eje, son dos preguntas distintas
- **Vigente**: el código existe en el sistema pero no ha sido vendido ni activado. Está "en inventario".
- **Activa**: el código fue vendido, el cliente pagó por él, y el sistema le asignó saldo real. **Es el único estado válido como medio de pago.**
- **Inactiva**: engloba dos causas distintas que conviene no confundir — bloqueo por seguridad (robo, uso indebido, anulación administrativa) y agotada (saldo llegó a 0).

### 4.2 Por qué existe el estado "Vigente" separado de "Activa"
Una empresa puede comprar un lote de 100 giftcards, que quedan en estado vigente pero no activas. La empresa las activa una por una, más adelante, al momento de entregarlas (ej. campaña de fin de año). Esto es una protección anti-fraude: si el lote físico es robado antes de ser entregado, los códigos no tienen saldo utilizable todavía.

### 4.3 Tipo de monto
- **Monto fijo**: valor predeterminado, no editable al momento de la venta.
- **Monto dinámico**: producto "abierto", el cliente define el valor exacto al momento de la venta.
No se tratan como un SKU tradicional de inventario.

### 4.4 Trazabilidad
Todo movimiento (activación, consumo, ajuste) se registra con un **SID** (ID de transacción), lo que permite auditar cada peso descontado y reconstruir el historial de saldo ante un reclamo.

### 4.5 Integración con Mobile One
El motor de promociones actúa como el "cerebro" centralizado: cuando alguien paga con giftcard en Mobile One, el saldo **no se valida localmente**, sino con una petición al motor (¿código válido?, ¿pertenece al cliente/tienda?, ¿cuál es el saldo real?). Si el saldo no alcanza, el sistema permite pago mixto (giftcard + efectivo/débito). *(Nota: por decisión explícita, las pantallas de Mobile One no se están diseñando en este hilo de trabajo — solo se documenta la lógica de integración como contexto.)*

### 4.6 Gobernanza de roles
- **Master**: control global sobre todas las empresas del sistema.
- **Administrador (empresa)**: nivel corporativo, gestiona usuarios/configuraciones/campañas solo de su propia empresa.
- **Usuario (operacional/vendedor)**: acceso restringido a ejecución de ventas y consultas básicas en punto de venta.

---

## 5. Lo que se ha diseñado hasta ahora (UI/UX)

Todo el trabajo de diseño se ha hecho como mockups interactivos primero, y luego se formalizó en una especificación independiente de la tecnología de implementación:

1. **Panel de administración de giftcards** — listado con métricas (vigentes, activas, saldo real emitido, inactivas), tabla con código/tipo de monto/cliente/monto/saldo/SID/estado, búsqueda y filtro por estado, y modal de creación con dos modos: individual (fijo/dinámico) y lote corporativo (con aviso anti-fraude incorporado).
2. **Flujo de activación de lote** — wizard de 4 pasos (elegir lote → seleccionar código vigente → asignar destinatario → confirmar), pensado para el rol Administrador, con generación de nuevo SID al confirmar.
3. **Especificación de diseño Atomic Design** (`Giftcard_Especificacion_UIUX_AtomicDesign_v0.1.md`) — traduce ambos mockups a reglas de diseño (átomos, moléculas, organismos, templates, páginas) sin prescribir componentes de PrimeNG ni sintaxis Angular, para que el equipo de desarrollo decida libremente la implementación.

---

## 6. Documentos del proyecto

| Documento | Contenido |
|---|---|
| Transcripción 23 jun 2026 | Reunión inicial sobre motor de promociones externo, agnóstico, casos de clientes |
| Transcripción 30 jun 2026 | Profundización en tipos de promoción, mejor promo, devoluciones, pagos con tarjeta |
| Documento de lógica Giftcard | Fusión con motor de promociones, estados, monto fijo/dinámico, SID, roles, integración Mobile One |
| `Giftcard_Especificacion_UIUX_AtomicDesign_v0.1.md` | Especificación de diseño de las pantallas de Giftcard |
| Este documento | Contexto general para entender el conjunto del trabajo |

---

## 7. Pendiente / próximos pasos posibles

- Vista de gobernanza (qué ve y qué puede hacer cada rol: Master / Administrador / Usuario) — mencionada pero no diseñada aún.
- Documentar formalmente el detalle de la integración con Mobile One (fuera del alcance de diseño de este hilo, pero pendiente de documentación técnica).
- Definir si esta especificación de Giftcard se integra como sección adicional al documento general de definición de producto del Motor de Promociones (v0.1), o si queda como anexo independiente.
- Validación con David sobre alcance comercial y compromisos de MVP, en línea con lo ya pendiente para el resto del proyecto.

---

## 8. Personas y clientes mencionados

**Equipo**: Henry Tortoza, Cristian Huerta, Charles Sepulveda (definición de producto/arquitectura), David (validación de alcance comercial y MVP).
**Clientes de referencia**: Autoplanet, Flores, Mascota, C Beauty, Ital — cada uno con casuísticas distintas de promoción que sirvieron de insumo para el diseño del MVP.
