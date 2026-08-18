# Motor de Promociones — Qué tiene la app hoy

_Última actualización: 11 de agosto de 2026_

Este documento explica **qué puede hacer un usuario en la app**, no cómo está construida por dentro. Está pensado para negocio, producto y cualquiera que necesite entender el alcance actual sin leer código.

---

## Resumen en una frase

Hoy la app es un panel de administración de **Giftcards** (tarjetas de regalo/saldo) completo y funcional, corriendo sobre datos de prueba (no hay servidor real todavía). El segundo módulo anunciado, **Promociones**, todavía no existe — aparece en el menú marcado como "Próximamente".

---

## 1. Cómo se entra a la app (login)

La pantalla de login se ve y se siente completa, pero **no valida usuario ni contraseña de verdad**: cualquier clic en "Ingresar" te deja adentro. Es intencional en esta etapa — todavía no hay un sistema de autenticación real conectado.

Hay una excepción: si escribís el correo exacto de una cuenta de **Comprador Externo** ya creada (ver sección 6), la app te reconoce y te entra directo a su portal.

Además, una vez adentro, el menú lateral tiene un **selector de rol/empresa** que permite saltar libremente entre los distintos roles y tiendas sin volver a loguearse. Esto es una herramienta de demostración para poder mostrar todos los roles sin tener 5 usuarios distintos — no es una funcionalidad que deba llegar a producción tal cual.

**Qué falta:** autenticación real (usuario/contraseña validados, recuperación de clave real, sesiones reales).

---

## 2. Los 5 roles y qué puede hacer cada uno

El login promete "un panel, cinco niveles de acceso". Así funcionan hoy:

| Rol | Qué ve | Qué puede hacer |
|---|---|---|
| **Master** | Todas las empresas y holdings, sin restricción | Todo lo que puede hacer un Administrador Holding, pero sin límite de a qué empresa |
| **Administrador Holding** | Su holding completo + todas sus tiendas | Crear/gestionar giftcards y campañas de cualquier tienda de su holding. **Es el único rol que puede otorgar accesos a Compradores Externos** |
| **Administrador Tienda** | Solo su propia tienda | Crear/gestionar giftcards y campañas, pero solo de su tienda |
| **Usuario POS** | Solo su propia tienda | Pensado para operar en el punto de venta, no para administrar. *(Nota: hoy la pantalla no le oculta visualmente los botones de gestión que el rol no debería tener — ver "Qué falta")* |
| **Comprador Externo** | Solo "Mi Lote", nunca el resto de la app | Ver y activar las giftcards de los lotes que le otorgaron. No puede bloquear ni reiniciar ninguna giftcard |

Cada rol, al entrar, aterriza automáticamente en la pantalla que le corresponde (Comprador Externo va a "Mi Lote", el resto va a "Giftcards"). Si alguien intenta entrar a una pantalla que no le corresponde escribiendo la URL a mano, la app lo redirige solo, sin mostrar la pantalla prohibida.

**Qué falta:** que la pantalla de Giftcards oculte o desactive visualmente las acciones de gestión para el rol Usuario POS (hoy el modelo de datos ya sabe que POS no debería administrar, pero la interfaz todavía no le esconde los botones).

---

## 3. Empresas, tiendas y holdings

La app entiende una estructura de **holding → tiendas**. Por ejemplo: "Italmod" es un holding con dos tiendas ("Italmod Providencia" y "Italmod Ñuñoa"); "Autoplanet" es otra empresa aparte.

Un selector en el menú lateral permite cambiar el "foco" de la vista:
- Parado en el holding, se ven los datos combinados de todas sus tiendas.
- Parado en una tienda puntual, se ven solo los datos de esa tienda.

Los roles de tienda (Administrador Tienda, Usuario POS) no tienen este selector — están fijos en su propia tienda.

El módulo de Giftcards solo está habilitado para algunas empresas (hoy: Italmod y sus tiendas). Si entrás con una empresa que no lo tiene habilitado (como Autoplanet), el menú muestra el módulo atenuado con "No disponible para esta empresa".

**Qué falta:** una pantalla para administrar qué empresas existen y qué módulos tiene habilitados cada una — hoy esa lista está fija en el código, no se edita desde la app.

---

## 4. Giftcards — el corazón de la app

Es la pantalla más completa. Tiene dos formas de verla: como **lista de códigos** o como **grid de campañas**.

### Los 4 estados posibles de una giftcard

- **Sin activar** — existe, todavía no se le asignó cliente.
- **Activa** — ya se activó y todavía tiene saldo para usar.
- **Agotada** — se activó y ya se gastó todo el saldo. Es un estado final: una giftcard agotada "ya cumplió su ciclo" y no admite ninguna acción más (no se puede bloquear, ni reiniciar, ni tocar).
- **Inactiva** — fue bloqueada manualmente (por ejemplo por robo o fraude). También es un estado final e irreversible.

Estos estados nunca se "eligen" a mano — la app los calcula solo, mirando si tiene saldo, si está activada, etc. Esto evita que alguien deje una giftcard en un estado incoherente por error.

### Qué se puede hacer con una giftcard

- **Crearla** — sola, o en lote dentro de una campaña.
- **Activarla** — se le asigna un destinatario (y, si es de "monto dinámico", ahí se define cuánto vale). Esto solo se hace entrando al detalle de una giftcard puntual, no hay un botón masivo de "activar" — es una decisión de diseño para no duplicar el mismo flujo en dos lugares.
- **Bloquearla** — la deja Inactiva para siempre, pidiendo un motivo. Solo lo pueden hacer roles administradores.
- **Reiniciar su activación** — la vuelve a "Sin activar", por si alguien se equivocó vendiéndola. Solo administradores.

Cada una de estas acciones queda registrada en un historial con fecha, monto, saldo resultante y quién lo hizo — pensado para poder auditar después qué pasó con cada código.

### Tipos de monto y canal

- **Monto fijo** — se sabe de antemano cuánto vale.
- **Monto dinámico** — se define recién cuando se activa (pensado para casos donde el valor depende de lo que compre el cliente).
- **Canal** — cada giftcard puede usarse solo en ecommerce, solo en tienda física, o en ambos.

### Buscar y filtrar

Se puede buscar por código o por nombre de cliente, filtrar por estado, y agrupar por campaña. Las giftcards de campañas ya archivadas no aparecen en el listado general (para no ensuciar la vista con historial viejo), pero siguen visibles si entrás puntualmente a esa campaña archivada.

### Exportar informes

Hay un botón de "Informe" que permite filtrar movimientos por tipo y por fecha, y descargar un CSV con el detalle. Esta descarga sí es real (genera el archivo en el navegador), aunque por ahora solo con los datos de prueba.

**Qué falta:** que todo esto viva en un servidor real — hoy, si recargás la página, se pierden los cambios y vuelve todo a los datos de ejemplo.

---

## 5. Campañas / Lotes

Una campaña agrupa muchos códigos de giftcard bajo un nombre y una fecha de vigencia. Tiene una **política de monto**, que define cuánto pueden valer sus giftcards:

- **Abierta** — no hay monto fijo, se cobra según lo que gaste el cliente.
- **Monto único** — todas las giftcards del lote valen exactamente lo mismo.
- **Varios montos (tiers)** — la campaña ofrece distintas denominaciones (por ejemplo, 5 giftcards de $10.000 y 10 de $20.000), cada una con su propio cupo.

Cada campaña tiene un **cupo máximo** de giftcards que puede emitir en toda su vida, y la app avisa cuánto cupo queda disponible — para no emitir de más por error.

### Archivado

Se puede archivar una campaña a mano (con aviso si todavía le quedan códigos sin activar), y la app también la archiva **sola**, automáticamente, cuando todos sus códigos ya llegaron a un estado final (agotados o bloqueados). Las campañas archivadas se ven en una sección separada, "Ver archivadas".

Cada campaña muestra sus números clave: total de códigos, cuántos activos, cuántos sin activar, cuántos canjeados y cuántos cancelados. Haciendo clic en una campaña se entra a ver solo los códigos de esa campaña puntual.

---

## 6. Accesos Externos (venta B2B de lotes)

Pantalla exclusiva del Administrador Holding, para darle acceso a un socio comercial externo (por ejemplo Falabella o Cencosud, en los datos de prueba) a un lote de giftcards específico, con su propia fecha de vencimiento de ese acceso.

Reglas importantes:

- El **correo** identifica a la cuenta externa. Si le otorgás un lote nuevo a un correo que ya tenía cuenta, no se crea una cuenta duplicada — simplemente se le suma el nuevo lote a la cuenta existente.
- No se puede repetir el mismo correo en dos cuentas distintas.
- Se puede crear una campaña nueva sin salir del mismo formulario de otorgar acceso, como atajo.
- Cada acceso otorgado deja de estar disponible solo al pasar su fecha de vencimiento — no hace falta desactivarlo a mano.
- Hay un botón de "enviar enlace para restablecer contraseña" y un aviso de "credenciales enviadas por correo" al crear una cuenta — **ninguno de los dos envía un correo real todavía**, solo muestran el mensaje de confirmación en pantalla. Es simulado a propósito, a la espera de tener un sistema de envío de correos real.

---

## 7. Portal Externo ("Mi Lote")

Es la única pantalla que ve un Comprador Externo. Ahí aparecen únicamente las giftcards de los lotes que le otorgaron y que todavía están vigentes (si el acceso venció, deja de verlas). Puede entrar al detalle de cada giftcard y activarla, pero no tiene ni ve los botones de bloquear ni reiniciar activación — esas acciones están apagadas a propósito para este rol, tanto en la pantalla como por debajo.

---

## 8. Lo que todavía no existe

- **Promociones** — aparece en el menú, con ícono y todo, pero literalmente dice "Próximamente". No tiene pantalla ni funcionalidad todavía. Sería el segundo gran módulo del "Motor de Promociones" (descuentos, códigos QR, fidelización, según el material de marketing del login), pero hoy es solo una promesa visual.
- **Autenticación real** (ver sección 1).
- **Persistencia real** — nada de lo que se crea o edita sobrevive a recargar la página; es todo simulado en memoria del navegador.
- **Envío real de correos** (credenciales, restablecimiento de contraseña).
- **Administración de empresas/holdings** desde la app — hoy la lista de empresas y qué módulos tiene cada una está fija en el código.
- **Ocultar acciones de gestión al rol Usuario POS** en la pantalla de Giftcards (hoy el permiso ya existe a nivel de datos, falta reflejarlo en la interfaz).

---

## 9. Qué podríamos hacer a continuación

Con lo que ya existe funcionando de punta a punta en modo simulado, los pasos naturales para pasar de demo a producto real serían, en orden de impacto:

1. **Conectar un backend real** — es el bloqueador más grande: sin esto, nada de lo creado sobrevive, y no se puede confiar en la app para operar un negocio real.
2. **Autenticación real** — reemplazar el login de fachada y el selector de roles de demo por un sistema de usuarios real con contraseña y sesión persistente.
3. **Envío real de correos** — activar el envío de credenciales y de restablecimiento de contraseña, hoy solo simulados.
4. **Terminar de acotar la pantalla de Giftcards para Usuario POS**, para que ese rol no vea botones de acciones que no debería poder ejecutar.
5. **Construir el módulo de Promociones** — la otra mitad del producto que hoy solo es una promesa en el menú.
6. **Pantalla de administración de empresas/holdings**, para no depender de tocar código cada vez que se suma un cliente nuevo.
