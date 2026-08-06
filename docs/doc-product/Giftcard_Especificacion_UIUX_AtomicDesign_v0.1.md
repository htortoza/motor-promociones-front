# Especificación de diseño UI/UX — Módulo Giftcard
**Motor de Promociones · DOT Solutions**
Versión 0.1 — confidencial

---

## Cómo usar este documento

Este documento define **qué se ve, dónde se ubica y cómo se relaciona jerárquicamente** cada elemento de la interfaz del módulo Giftcard. Está organizado con la metodología **Atomic Design** (átomos → moléculas → organismos → templates → páginas) para que el equipo de desarrollo pueda mapear cada nivel a sus propios componentes de PrimeNG/Angular.

**Lo que este documento NO define:** qué componente de PrimeNG usar, nombres de clases Angular, estructura de módulos/servicios, ni sintaxis de binding. Esas decisiones quedan enteramente a criterio del equipo de desarrollo.

**Lo que sí define:** jerarquía visual, espaciados, alineaciones, agrupaciones, estados visuales y el criterio de cuándo mostrar qué.

Referencia de negocio base: modelo de estados (Vigente / Activa / Inactiva), tipo de monto (fijo / dinámico), trazabilidad por SID, gobernanza de roles (Master / Administrador / Usuario) y flujo de activación de lotes corporativos.

---

## 1. Átomos

Elementos indivisibles. Se reutilizan tal cual en toda la pantalla de Giftcard.

### 1.1 Color semántico de estado
No es un color decorativo: comunica el estado real del código.

| Estado | Tono | Criterio de uso |
|---|---|---|
| Vigente | Neutro (gris) | Código existe, sin vender/activar. Nunca debe usar un color de "alerta" — es un estado normal de inventario. |
| Activa | Éxito (verde) | Único estado válido como medio de pago. |
| Inactiva: bloqueada | Advertencia (ámbar) | Bloqueo por seguridad — requiere distinguirse de "agotada". |
| Inactiva: agotada | Neutro/atenuado, no rojo de error | Saldo en 0 es un fin de ciclo normal, no un error del sistema. |

Regla: nunca usar rojo de error para "agotada" — rojo se reserva para fallas reales (código inválido, rechazo de transacción).

### 1.2 Tipografía
- Título de sección: peso medio, tamaño mayor, una sola línea.
- Etiqueta de campo/columna: tamaño pequeño, color secundario (atenuado), siempre sobre el valor, nunca al lado en la misma línea si el espacio es angosto.
- Valor numérico destacado (montos, saldos, contadores): tamaño mayor al texto de cuerpo, peso medio. Los montos siempre alineados a la derecha en tablas.
- Código de giftcard (identificador): tipografía monoespaciada, para que los caracteres ambiguos (0/O, 1/I) se distingan.

### 1.3 Espaciado base
Grid de 4px como unidad mínima; agrupar en múltiplos de 8px para paddings de componentes y de 16px/24px para separación entre bloques.
- Padding interno de tarjetas/filas: 12–16px vertical, 14–16px horizontal.
- Separación entre bloques mayores de la página (métricas → filtros → tabla): 24px.
- Separación entre campos de un formulario: 10–12px.

### 1.4 Iconografía
- Un ícono por concepto, nunca decorativo sin función (no rellenar espacio vacío con íconos).
- Ícono de información junto a texto aclaratorio de estados (no como tooltip oculto): la aclaración del modelo Vigente/Activa/Inactiva debe estar siempre visible, no escondida detrás de un hover.

### 1.5 Botón primario
Máximo un botón de acción primaria (alto contraste) visible por pantalla o por modal. El resto de acciones son secundarias (contorno). Ejemplo: en el listado, "Crear giftcard" es la única acción primaria; búsqueda y filtro no compiten visualmente con ella.

### 1.6 Badge de estado
Pastilla con texto del estado, fondo tenue del color semántico correspondiente (ver 1.1), texto en el tono oscuro de la misma familia de color (no negro genérico). Ancho ajustado al contenido, nunca ancho fijo forzado.

---

## 2. Moléculas

Combinaciones pequeñas de átomos con una única responsabilidad.

### 2.1 Tarjeta de métrica
Estructura: etiqueta pequeña arriba (color secundario) + valor numérico grande abajo. Sin ícono decorativo salvo que aporte lectura rápida del signo (ej. alerta de vencimiento próximo). En grupos de 4 tarjetas por fila en desktop; en pantallas angostas, pasan a 2 por fila antes que a 1 por fila.

Contenido fijo del set para Giftcard: **vigentes sin vender**, **activas**, **saldo real emitido**, **inactivas**. Este orden no es arbitrario: sigue el ciclo de vida (inventario → venta/activación → consumo/estado final).

### 2.2 Fila de listado
Estructura de columnas en este orden fijo, de izquierda a derecha: **código** (monoespaciado) → **tipo de monto** (fijo/dinámico) → **cliente/destinatario** (o "sin vender" en gris atenuado si no aplica) → **monto** → **saldo** → **SID del último movimiento** (monoespaciado, color secundario) → **estado** (badge, ver 1.6).
El estado siempre va al final de la fila — es la columna que el ojo debe encontrar última, como confirmación, no como punto de partida.

### 2.3 Barra de búsqueda + filtro
Campo de búsqueda de texto libre ocupa el espacio disponible (flexible); el selector de estado tiene ancho fijo y va inmediatamente a la derecha del campo de búsqueda, nunca arriba en su propia fila — ambos deben leerse como una sola unidad de filtrado.

### 2.4 Grupo de campo de formulario
Etiqueta arriba (no al costado), campo abajo ocupando el 100% del ancho disponible del formulario, texto de ayuda (si existe) debajo del campo en tamaño menor y color atenuado. Separación vertical constante entre grupos (ver 1.3).

### 2.5 Selector de tipo de monto (fijo/dinámico)
Es una decisión binaria excluyente, no un checkbox ni un dropdown: debe representarse como dos opciones de igual peso visual, una de las cuales queda marcada como seleccionada (contraste alto) y la otra en reposo. Al cambiar la selección, el bloque de campos correspondiente (monto fijo vs. rango dinámico) se intercambia — nunca deben coexistir ambos bloques visibles al mismo tiempo.

### 2.6 Indicador de paso (stepper)
Para el flujo de activación: 4 nodos conectados por una línea horizontal, con etiqueta corta debajo/al lado de cada nodo. Estados del nodo: pendiente (atenuado), actual (contraste alto, numerado), completado (ícono de check, atenuado). El stepper es siempre visible durante todo el flujo — no desaparece entre pasos, es la referencia de "dónde estoy".

### 2.7 Banner de advertencia/confirmación
Bloque de ancho completo del contenedor, fondo tenue del color semántico correspondiente (ámbar para advertencia irreversible, verde para confirmación exitosa), ícono a la izquierda del texto, texto siempre en el tono oscuro de la misma familia. Se ubica inmediatamente antes de la acción a la que advierte, nunca después.

---

## 3. Organismos

Bloques funcionales completos, compuestos por moléculas.

### 3.1 Panel resumen de métricas
Fila de 4 tarjetas de métrica (2.1), ancho completo del contenedor de la página, siempre la primera sección visible de la pantalla de listado — antes que cualquier filtro o tabla.

### 3.2 Listado de giftcards
Encabezado de columnas (etiquetas, color secundario, tamaño menor) + filas de datos (2.2) apiladas verticalmente, separadas por línea divisoria fina, sin alternar colores de fondo entre filas (evitar "cebra" — el badge de estado ya aporta suficiente guía visual). Va inmediatamente después de la barra de búsqueda+filtro (2.3), sin separación mayor a 16px entre ambos, porque son una sola unidad funcional (filtrar → ver resultado).

### 3.3 Modal de creación de giftcard
Contenedor centrado sobre superposición oscura del fondo. Ancho fijo menor al de la pantalla completa (proporción tipo formulario corto, no de página). Estructura interna de arriba a abajo: título + botón de cierre en la misma línea → selector de modo (individual / lote corporativo, mismo patrón que 2.5) → formulario correspondiente al modo activo → botón primario de confirmación al final, nunca arriba ni al costado.
Regla de exclusión mutua: el formulario "individual" y el de "lote corporativo" nunca se muestran simultáneamente.

### 3.4 Aviso de protección anti-fraude en lote corporativo
Dentro del formulario de lote corporativo (3.3), banner informativo (2.7, variante informativa) que explica que el lote nace en estado vigente y se activa código por código al momento de la entrega. Ubicado después de los campos de cantidad/monto y antes del botón de confirmación — el usuario debe leerlo justo antes de confirmar, no antes de llenar los datos.

### 3.5 Wizard de activación de lote
Stepper (2.6) fijo en la parte superior. Debajo, un único paso visible a la vez (los otros tres no ocupan espacio ni se muestran parcialmente). Cada paso mantiene visible un resumen breve de lo ya seleccionado en pasos anteriores (ej. en el paso 3, se ve el código y monto elegidos en el paso 2) para que el usuario no pierda contexto al avanzar.
El paso final de confirmación lleva primero el banner de advertencia (2.7, variante ámbar) y después la tabla resumen de datos, y al final el botón de confirmación — en ese orden fijo.

### 3.6 Encabezado de gobernanza / contexto de rol
Línea de texto corta, color secundario, ubicada inmediatamente debajo del título de la pantalla, indicando qué rol está viendo la pantalla y el alcance de datos visible (ej. "solo se muestran lotes de tu empresa"). Presente en toda vista donde el alcance de datos depende del rol — no solo en el wizard de activación.

---

## 4. Templates

Esqueletos de página: define el orden de las secciones y los márgenes entre ellas, sin contenido real todavía.

### 4.1 Template — Página de listado de Giftcards
Orden vertical fijo, de arriba a abajo:
1. Encabezado de gobernanza/rol (3.6) — si aplica
2. Panel resumen de métricas (3.1)
3. Nota aclaratoria del modelo de estados (texto corto con ícono de información, ver 1.4) — siempre visible, no colapsable
4. Barra de búsqueda + filtro (2.3) junto con el botón primario "Crear giftcard" en la misma línea, filtro a la izquierda y botón a la derecha
5. Listado de giftcards (3.2)

Márgenes entre secciones 1→2→3: 24px. Entre 3→4: 16px (se leen como una sola zona de control). Entre 4→5: sin separación adicional — el listado es la continuación directa de la barra de filtro.

### 4.2 Template — Modal de creación
Ancho fijo (proporción de formulario corto), alto variable según contenido, centrado en el viewport. Padding interno uniforme (ver 1.3, nivel de bloque mayor). El botón de cierre siempre en la esquina superior derecha del modal, nunca en el pie.

### 4.3 Template — Wizard de activación
Ancho igual al de un formulario corto (no ancho completo de página), stepper fijo arriba con márgenes iguales a ambos lados. Cada paso ocupa el espacio remanente debajo del stepper, con separación de 24px entre el stepper y el contenido del paso.

---

## 5. Páginas

Instancias reales de los templates, con el contenido de negocio ya definido en las iteraciones previas de este proyecto.

### 5.1 Página — "Giftcards"
Instancia de 4.1. Métricas: vigentes sin vender, activas, saldo real emitido, inactivas (en ese orden). Columnas de tabla según 2.2. Estados según 1.1.

### 5.2 Modal — "Crear giftcard"
Instancia de 4.2 + 3.3. Modo individual con selector fijo/dinámico (2.5) y casilla opcional "crear solo como vigente". Modo lote corporativo con el aviso anti-fraude (3.4).

### 5.3 Wizard — "Activación de lote"
Instancia de 4.3 + 3.5. Cuatro pasos: elegir lote → seleccionar código vigente del lote → asignar destinatario → confirmar (con generación de nuevo SID al confirmar).

---

## 6. Reglas transversales

- **Roles**: cualquier pantalla o control cuyo contenido dependa del rol (Master / Administrador / Usuario) debe declarar el alcance visible mediante el encabezado de gobernanza (3.6). No debe haber pantallas donde el alcance de datos cambie silenciosamente sin esa indicación.
- **Trazabilidad (SID)**: todo movimiento que genere o modifique saldo debe mostrar su SID en la interfaz correspondiente (fila de listado, paso de confirmación). El SID nunca es la información principal de la fila/paso — va en tamaño menor y color secundario.
- **Responsive**: el panel de métricas (3.1) es lo primero en reflowear (4 → 2 columnas); la tabla de listado (3.2) es lo último — prioriza scroll horizontal contenido antes que ocultar columnas.
- **Estados vacíos**: si un listado o selector no tiene datos (ej. no hay lotes vigentes), el espacio debe comunicar la causa (ej. "sin códigos vigentes en este lote") en lugar de mostrarse en blanco.
