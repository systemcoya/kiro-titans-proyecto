# Requirements Document

## Introduction

Módulo del "Strategy Cockpit" para la Gerencia de Estrategia Tecnológica de Seguros Bolívar. Plataforma que unifica la visibilidad de costos de IA y nube, implementa gobernanza proactiva, habilita showback por equipo/célula, y demuestra el ROI de la inversión tecnológica — pasando de "explicar el gasto pasado" a "influenciar decisiones futuras".

Stack tecnológico: React (Vite + Recharts + Tailwind + Shadcn UI) frontend, Node.js (Express) backend, PostgreSQL base de datos. Todos los datos son mock para el prototipo de hackathon.

## Glossary

- **Sistema_Dashboard**: Componente frontend que presenta visualizaciones de datos de costos y métricas financieras.
- **Sistema_API**: Backend Express que expone endpoints REST para consulta y gestión de datos de costos.
- **Sistema_Alertas**: Subsistema responsable de evaluar reglas de umbral y generar notificaciones.
- **Sistema_Simulador**: Componente que ejecuta proyecciones what-if de costos basadas en parámetros de entrada.
- **Sistema_Gobernanza**: Motor de reglas que detecta recursos ociosos o sobredimensionados y genera recomendaciones.
- **Sistema_Etiquetado**: Subsistema CRUD para gestión de metadatos de negocio (tags) sobre recursos.
- **Sistema_Anomalias**: Componente de detección de picos inusuales de gasto mediante análisis estadístico.
- **FinOps**: Disciplina de gestión financiera de operaciones en la nube que combina tecnología, finanzas y negocio.
- **Showback**: Modelo de visibilidad de costos donde se asignan gastos a equipos para informar sin facturar.
- **Chargeback**: Modelo donde los costos se facturan directamente al equipo que los genera.
- **Unit Economics**: Costo unitario por transacción de negocio procesada con IA.
- **FOCUS**: FinOps Open Cost and Usage Specification — formato estándar de normalización de datos de costo.
- **MegaBill**: Vista consolidada de gasto multi-tecnología (cloud + SaaS + licencias).
- **Sparkline**: Gráfico miniatura de tendencia temporal integrado en una tabla.
- **Rightsizing**: Recomendación de redimensionar un recurso para ajustarlo a su uso real.
- **Self-funding**: Ratio que mide cuánto de la inversión en IA se financia con ahorros de optimización.
- **Shift-left**: Enfoque de prevención temprana donde se evitan costos antes de que se generen.
- **Proveedor_IA**: Servicio de IA de un proveedor cloud (AWS Bedrock, OpenAI, Anthropic).
- **Célula_Desarrollo**: Equipo autónomo de desarrollo de software dentro de la organización.
- **Banda_Confianza**: Rango de proyección que incluye escenarios optimista, base y pesimista.

---

## Requirements

### Must Have

### Requisito 1: Visualización de Gasto Acumulado de IA

**User Story:** Como usuario FinOps, quiero visualizar el gasto acumulado de IA (tokens, inferencias, GPU-hours) agrupado por servicio, equipo y proveedor, para identificar los principales drivers de costo de IA.

#### Criterios de Aceptación

1. WHEN el usuario accede al dashboard de gasto IA, THE Sistema_Dashboard SHALL mostrar el desglose de costos agrupado por servicio, equipo y Proveedor_IA, presentando para cada agrupación: nombre del elemento, costo total en dólares y porcentaje respecto al gasto total.
2. WHEN el usuario aplica un filtro por fecha, THE Sistema_API SHALL retornar datos filtrados por el rango de fechas seleccionado, con una granularidad mínima de un día y un rango máximo de 12 meses.
3. WHEN el usuario aplica un filtro por equipo, THE Sistema_API SHALL retornar datos filtrados por la Célula_Desarrollo seleccionada.
4. WHEN el usuario aplica un filtro por proveedor, THE Sistema_API SHALL retornar datos filtrados por el Proveedor_IA seleccionado (AWS Bedrock, OpenAI, Anthropic).
5. THE Sistema_API SHALL proveer datos mock de un mínimo de 3 proveedores de IA (AWS Bedrock, OpenAI, Anthropic), con al menos 2 servicios por proveedor y al menos 3 Célula_Desarrollo distintas.
6. THE Sistema_Dashboard SHALL mostrar métricas de consumo en unidades de tokens, inferencias y GPU-hours asociadas a cada servicio de IA en la vista de desglose.
7. WHEN el usuario presiona el botón de simulación de avance temporal, THE Sistema_API SHALL actualizar los datos de gasto generando nuevos valores mock que reflejen una hora adicional de consumo.
8. WHEN el dashboard se carga por primera vez, THE Sistema_Dashboard SHALL mostrar por defecto los datos del mes actual con todos los proveedores y equipos visibles.
9. IF la combinación de filtros aplicada no retorna datos, THEN THE Sistema_Dashboard SHALL mostrar un estado vacío con un mensaje indicando que no hay datos para los filtros seleccionados.
10. IF el Sistema_API no responde dentro de 5 segundos, THEN THE Sistema_Dashboard SHALL mostrar un mensaje de error indicando que no se pudieron cargar los datos y ofrecer la opción de reintentar.

---

### Requisito 2: Unit Economics por Transacción de Negocio

**User Story:** Como usuario FinOps, quiero ver los unit economics — costo por transacción de negocio procesada con IA (costo por póliza cotizada, costo por siniestro analizado) — para entender la eficiencia económica de la IA.

#### Criterios de Aceptación

1. THE Sistema_Dashboard SHALL mostrar una tabla con una fila por cada servicio de IA, incluyendo las columnas: nombre del servicio, costo total en USD (2 decimales), número de transacciones procesadas (entero ≥ 0) y costo unitario en USD (4 decimales), calculado como costo total dividido entre transacciones procesadas, para el período de tiempo seleccionado por el usuario (semana actual, mes actual o rango personalizado de hasta 90 días).
2. THE Sistema_API SHALL proveer datos de un mínimo de 3 casos de uso de negocio (cotización de póliza, análisis de siniestro, atención al cliente).
3. WHEN el usuario visualiza la tabla de unit economics, THE Sistema_Dashboard SHALL incluir un sparkline de tendencia semanal por cada caso de uso mostrando las últimas 8 semanas de costo unitario.
4. IF el costo unitario de un caso de uso varía respecto a la semana anterior (diferencia ≠ 0), THEN THE Sistema_Dashboard SHALL mostrar una flecha direccional hacia arriba para aumento o hacia abajo para disminución, diferenciada por color, junto al valor del costo unitario.
5. IF un caso de uso registra 0 transacciones procesadas en el período seleccionado, THEN THE Sistema_Dashboard SHALL mostrar el costo unitario como "N/A" y omitir el indicador de tendencia para ese caso de uso.

---

### Requisito 3: Modelo Showback/Chargeback por Célula

**User Story:** Como usuario FinOps, quiero un modelo de showback/chargeback que asigne costos de cloud + IA a cada célula de desarrollo, para que cada equipo conozca su huella de costos.

#### Criterios de Aceptación

1. THE Sistema_Dashboard SHALL mostrar una vista por Célula_Desarrollo con columnas: costo cloud, costo IA, costo SaaS y costo total, donde cada valor se presenta en USD con formato numérico de 2 decimales y separador de miles, correspondiente al período mensual seleccionado por el usuario.
2. WHEN el usuario visualiza la vista de showback, THE Sistema_Dashboard SHALL mostrar el porcentaje de gasto vs. presupuesto asignado por cada célula con precisión de 1 decimal (ejemplo: 85.3%), calculado como (costo total de la célula / presupuesto asignado) × 100.
3. THE Sistema_Dashboard SHALL presentar un ranking de eficiencia ordenado por el ratio costo/presupuesto de menor a mayor, mostrando el ratio con 2 decimales, donde un valor menor indica mayor eficiencia.
4. WHEN una Célula_Desarrollo excede el 100% de su presupuesto asignado, THE Sistema_Dashboard SHALL resaltar la fila correspondiente con un cambio de color de fondo diferenciado y un ícono de alerta visible junto al nombre de la célula.
5. IF una Célula_Desarrollo no tiene presupuesto asignado para el período seleccionado, THEN THE Sistema_Dashboard SHALL mostrar la fila con los costos disponibles, indicar "Sin presupuesto" en la columna de porcentaje, y excluirla del ranking de eficiencia.

---

### Requisito 4: Alertas Configurables de Gasto

**User Story:** Como usuario FinOps, quiero configurar alertas cuando el gasto de un servicio exceda umbrales definidos, para actuar proactivamente ante desviaciones presupuestarias.

#### Criterios de Aceptación

1. THE Sistema_Alertas SHALL permitir operaciones CRUD para reglas de alerta con los campos: servicio, umbral numérico (rango válido: 0.01 a 999,999,999.99), y destinatario (máximo 255 caracteres), con un límite máximo de 50 reglas por usuario.
2. WHEN el usuario crea o actualiza una regla de alerta, THE Sistema_Alertas SHALL validar que el umbral sea un número mayor o igual a 0.01, que el servicio exista en el catálogo y que el destinatario tenga formato válido de correo electrónico.
3. IF la validación de una regla de alerta falla, THEN THE Sistema_Alertas SHALL rechazar la operación indicando los campos que no cumplen las restricciones, sin modificar los datos existentes.
4. WHEN el gasto acumulado de un servicio alcanza o excede el 80% del umbral definido en una regla, THE Sistema_Alertas SHALL generar una alerta con severidad "warning"; WHEN alcanza o excede el 100% del umbral, THE Sistema_Alertas SHALL generar una alerta con severidad "critical", sin generar alertas duplicadas para el mismo servicio, umbral y período de evaluación.
5. THE Sistema_Dashboard SHALL mostrar un panel con un máximo de 100 alertas activas ordenadas por severidad ("critical" primero, "warning" después) y dentro de cada severidad por fecha descendente.
6. THE Sistema_Alertas SHALL mantener un historial de alertas disparadas con campos: fecha (ISO-8601), servicio, umbral, valor real y severidad, con una retención máxima de 90 días.
7. WHEN el usuario consulta el historial, THE Sistema_API SHALL retornar las alertas disparadas ordenadas por fecha descendente con paginación de máximo 100 registros por página, incluyendo el total de registros y la página actual.
8. IF el usuario intenta crear una regla que excede el límite de 50 reglas, THEN THE Sistema_Alertas SHALL rechazar la operación indicando que se alcanzó el límite máximo de reglas permitidas.

---

### Requisito 5: Vista Consolidada Multi-Tecnología (MegaBill)

**User Story:** Como usuario FinOps, quiero visualizar el gasto unificado multi-tecnología (cloud AWS/Azure/GCP + SaaS + licencias) en una única vista, para tener una imagen completa del gasto tecnológico.

#### Criterios de Aceptación

1. THE Sistema_Dashboard SHALL mostrar una vista MegaBill con el gasto total agrupado por las 3 categorías tecnológicas (cloud, SaaS, licencias), presentando el monto en formato de moneda con 2 decimales de precisión y símbolo USD.
2. WHEN el usuario selecciona una categoría tecnológica, THE Sistema_Dashboard SHALL mostrar un drill-down con el listado de servicios individuales de esa categoría, mostrando para cada servicio: nombre del servicio (ServiceName), costo facturado (BilledCost), cantidad de uso (UsageQuantity) y proveedor (Provider).
3. THE Sistema_API SHALL normalizar todos los datos de costo en formato FOCUS con los campos obligatorios: ServiceName (máximo 100 caracteres), BilledCost (decimal con 2 decimales, rango 0.00 a 999,999,999.99), UsageQuantity (decimal mayor o igual a 0) y Provider (uno de: AWS, Azure, GCP, o nombre del servicio SaaS/licencia).
4. THE Sistema_API SHALL proveer datos mock de al menos 3 proveedores cloud (AWS, Azure, GCP), 2 servicios SaaS y 2 licencias de software, con un mínimo de 2 registros de servicio por cada proveedor.
5. THE Sistema_Dashboard SHALL mostrar el gasto total consolidado con un gráfico de distribución porcentual por categoría, donde los porcentajes se calculan sobre el total de las 3 categorías y se muestran con 1 decimal de precisión.
6. IF la API no retorna datos para ninguna categoría tecnológica, THEN THE Sistema_Dashboard SHALL mostrar un estado vacío con un mensaje indicando que no hay datos de gasto disponibles.
7. IF los datos de un proveedor específico no están disponibles, THEN THE Sistema_Dashboard SHALL mostrar las categorías restantes con sus datos y señalar visualmente la categoría o proveedor sin información disponible.

---

### Should Have

### Requisito 6: Simulador What-If de Proyección de Costos

**User Story:** Como usuario FinOps, quiero un simulador de proyección what-if para escenarios de escalamiento de IA, para planificar presupuesto y anticipar costos futuros.

#### Criterios de Aceptación

1. WHEN el usuario ingresa un porcentaje de incremento de uso por servicio, THE Sistema_Simulador SHALL calcular la proyección de costo a 1, 3 y 6 meses utilizando los últimos 3 meses de datos históricos como base, y presentar los resultados con precisión de 2 decimales en USD, en un tiempo máximo de 5 segundos.
2. WHEN el usuario ejecuta la simulación, THE Sistema_Simulador SHALL generar tres escenarios basados en la variabilidad histórica de costos del servicio seleccionado: optimista (percentil 25 de la distribución de costos históricos), base (percentil 50) y pesimista (percentil 75).
3. WHEN la proyección se completa, THE Sistema_Dashboard SHALL mostrar un gráfico de líneas con la Banda_Confianza que represente el área entre el escenario optimista y pesimista, incluyendo las tres líneas de proyección diferenciadas por color, en un tiempo de renderizado máximo de 3 segundos.
4. THE Sistema_Simulador SHALL aceptar como entrada un valor entero entre 1 y 500 (inclusive) para el porcentaje de incremento de uso por cada servicio seleccionado.
5. IF el usuario ingresa un valor fuera del rango permitido (1-500) o un valor no entero, THEN THE Sistema_Simulador SHALL mostrar un mensaje de error indicando el rango válido y el formato esperado, sin ejecutar la simulación.
6. IF el servicio seleccionado no cuenta con al menos 3 meses de datos históricos de costos, THEN THE Sistema_Simulador SHALL mostrar un mensaje informativo indicando que no hay datos suficientes para generar la proyección y deshabilitar la ejecución de la simulación para ese servicio.
7. WHEN el usuario modifica el porcentaje de incremento después de una simulación previa, THE Sistema_Simulador SHALL recalcular la proyección automáticamente y actualizar el gráfico con los nuevos resultados en un tiempo máximo de 5 segundos.

---

### Requisito 7: Políticas de Gobernanza Automatizadas

**User Story:** Como usuario FinOps, quiero políticas de gobernanza automatizadas que detecten recursos ociosos o sobredimensionados, para identificar oportunidades de ahorro.

#### Criterios de Aceptación

1. THE Sistema_Gobernanza SHALL soportar un motor de reglas configurables con condiciones definidas por: recurso (tipo de servicio cloud), métrica (CPU, memoria, red, disco), operador (mayor que, menor que, igual a, mayor o igual, menor o igual), valor numérico (entre 0 y 100 para porcentajes, entre 0 y 999999999.99 para valores absolutos) y período de evaluación (entre 1 y 90 días).
2. IF el usuario intenta crear una regla con valores fuera de los rangos permitidos o con campos obligatorios vacíos, THEN THE Sistema_Gobernanza SHALL rechazar la operación y mostrar un mensaje de error indicando los campos inválidos y los rangos aceptados.
3. WHEN una regla detecta un recurso que cumple la condición configurada durante el período completo definido (por ejemplo: EC2 con CPU menor a 10% durante 7 días consecutivos), THE Sistema_Gobernanza SHALL generar una recomendación de rightsizing en un plazo máximo de 5 minutos tras completarse el período de evaluación.
4. THE Sistema_Dashboard SHALL mostrar la lista de recomendaciones activas ordenadas por ahorro estimado de mayor a menor, con un máximo de 50 recomendaciones por página, incluyendo los campos: identificador del recurso, nombre de la regla aplicada, ahorro estimado en dólares (con 2 decimales), y acción sugerida (redimensionar, eliminar, o reservar).
5. THE Sistema_API SHALL calcular el ahorro estimado total sumando el campo de ahorro estimado de todas las recomendaciones con estado activo, retornando el resultado en dólares con 2 decimales de precisión.
6. WHEN el usuario marca una recomendación como implementada, THE Sistema_Gobernanza SHALL moverla al historial de ahorros realizados registrando la fecha de implementación y el ahorro estimado asociado, y excluyéndola del cálculo de ahorro total activo.
7. IF la evaluación de una regla falla por indisponibilidad de métricas del recurso, THEN THE Sistema_Gobernanza SHALL mantener el estado previo de la recomendación sin alteración y registrar el evento de fallo para consulta del usuario.

---

### Requisito 8: Comparativo Inversión IA vs. Ahorros (Self-Funding)

**User Story:** Como usuario FinOps, quiero comparar la inversión en IA vs. los ahorros generados para demostrar que la IA se autofinancia, para justificar inversión continua ante el CTO/CIO.

#### Criterios de Aceptación

1. THE Sistema_Dashboard SHALL mostrar un dashboard dual con: inversión acumulada en IA (lado izquierdo) y ahorros identificados por optimización (lado derecho), ambos valores en formato monetario con 2 decimales y símbolo USD, para un período de tiempo seleccionable por el usuario (último mes, últimos 3 meses, últimos 6 meses, último año, acumulado total).
2. THE Sistema_API SHALL calcular el ratio de self-funding como: (ahorros totales / inversión IA total) × 100, con precisión de 2 decimales.
3. IF la inversión IA total del período seleccionado es igual a 0, THEN THE Sistema_API SHALL retornar el ratio como 0% y THE Sistema_Dashboard SHALL mostrar un mensaje indicando que no hay inversión registrada para el período.
4. THE Sistema_Dashboard SHALL mostrar una barra de progreso de autofinanciamiento que represente el ratio de self-funding con la meta objetivo fija en 100%, mostrando el porcentaje numérico actual (por ejemplo: "IA autofinanciada al 73%").
5. WHEN el ratio de self-funding supera el 100%, THE Sistema_Dashboard SHALL mostrar una insignia visual destacada con el texto "IA completamente autofinanciada" y el porcentaje exacto alcanzado.
6. IF no existen datos de inversión ni de ahorros para el período seleccionado, THEN THE Sistema_Dashboard SHALL mostrar un estado vacío indicando que no hay datos disponibles para el rango de fechas seleccionado.
7. WHEN el usuario cambia el período de tiempo seleccionado, THE Sistema_Dashboard SHALL recalcular y actualizar los valores de inversión, ahorros, ratio y el indicador de progreso en un máximo de 3 segundos.

---

### Requisito 9: Reporte de Cost Avoidance

**User Story:** Como usuario FinOps, quiero un reporte de cost avoidance (costos evitados por gobernanza proactiva shift-left), para demostrar el valor preventivo de la gestión FinOps.

#### Criterios de Aceptación

1. THE Sistema_API SHALL mantener un registro de acciones preventivas con campos: recurso no desplegado (máximo 100 caracteres), tipo de acción (valores permitidos: "revisión arquitectónica", "rightsizing preventivo", "eliminación de propuesta"), fecha (ISO-8601) y costo evitado estimado (valor numérico en USD entre 0.01 y 999,999,999.99).
2. THE Sistema_Dashboard SHALL mostrar el costo evitado acumulado mensual en USD, calculado como la suma de todas las acciones preventivas del mes seleccionado, formateado con separador de miles y 2 decimales.
3. WHEN el usuario consulta el reporte de cost avoidance, THE Sistema_Dashboard SHALL listar cada acción preventiva ordenada por fecha descendente con columnas: recurso, tipo de acción, fecha y ahorro estimado en USD.
4. IF no existen acciones preventivas registradas para el mes seleccionado, THEN THE Sistema_Dashboard SHALL mostrar el acumulado en $0.00 y un mensaje indicando que no hay acciones preventivas para el período.
5. WHEN el usuario selecciona un mes en el reporte, THE Sistema_API SHALL retornar únicamente las acciones preventivas cuya fecha pertenezca al mes seleccionado, en un tiempo de respuesta máximo de 3 segundos.

---

### Requisito 10: Dashboard Ejecutivo (One-Pager CTO)

**User Story:** Como usuario FinOps, quiero un dashboard ejecutivo (one-pager) para el CTO con KPIs clave, para entregar un resumen de alto nivel del estado financiero tecnológico.

#### Criterios de Aceptación

1. THE Sistema_Dashboard SHALL mostrar en una sola vista sin necesidad de scroll vertical los siguientes KPIs: gasto del mes actual (USD), gasto del mes anterior (USD), porcentaje de variación mes a mes, top 5 servicios por gasto ordenados de mayor a menor, costo promedio por transacción (USD) y cantidad de alertas críticas abiertas.
2. WHEN el usuario solicita exportar el dashboard ejecutivo, THE Sistema_Dashboard SHALL generar un archivo PDF descargable en un tiempo máximo de 10 segundos, conteniendo todos los KPIs y gráficos visibles en la vista.
3. THE Sistema_Dashboard SHALL mostrar la tendencia de gasto de los últimos 6 meses en un gráfico de línea con eje X (meses) y eje Y (monto en USD).
4. THE Sistema_Dashboard SHALL resaltar con color rojo los KPIs cuyo gasto haya aumentado más de un 15% respecto al mes anterior (variación de costo desfavorable).
5. THE Sistema_Dashboard SHALL presentar un indicador visual del número de alertas críticas abiertas con acceso directo al panel de alertas mediante un clic.
6. IF no existen datos de gasto para el mes anterior, THEN THE Sistema_Dashboard SHALL mostrar "N/A" en el campo de gasto del mes anterior y ocultar el porcentaje de variación.

---

### Requisito 11: Etiquetado de Recursos con Metadatos de Negocio

**User Story:** Como usuario FinOps, quiero etiquetar recursos con metadatos de negocio (equipo, proyecto, ambiente, caso de uso IA), para mantener un inventario organizado y medir compliance de etiquetado.

#### Criterios de Aceptación

1. THE Sistema_Etiquetado SHALL permitir operaciones CRUD de etiquetas con campos obligatorios: equipo (máximo 50 caracteres), proyecto (máximo 50 caracteres), ambiente (valores permitidos: "desarrollo", "staging", "producción") y caso de uso IA (máximo 100 caracteres).
2. WHEN el usuario crea o edita una etiqueta, THE Sistema_Etiquetado SHALL validar que todos los campos obligatorios estén completos y dentro de los límites definidos antes de persistir el registro.
3. THE Sistema_Dashboard SHALL mostrar una vista de "Tagging Compliance" con el porcentaje de recursos correctamente etiquetados, definido como: (recursos con los 4 campos obligatorios completos / total de recursos registrados) × 100.
4. WHEN el porcentaje de compliance de etiquetado cae por debajo del 80%, THE Sistema_Alertas SHALL generar una alerta de tipo warning indicando el porcentaje actual con un decimal de precisión.
5. IF el usuario intenta guardar una etiqueta con campos obligatorios vacíos o que excedan el largo máximo permitido, THEN THE Sistema_Etiquetado SHALL mostrar un mensaje de error indicando cada campo que no cumple la validación.
6. IF el usuario intenta asignar un valor de ambiente no incluido en la lista permitida ("desarrollo", "staging", "producción"), THEN THE Sistema_Etiquetado SHALL rechazar la operación con un mensaje de error indicando los valores válidos.

---

### Nice to Have

### Requisito 12: Detección de Anomalías de Gasto

**User Story:** Como usuario FinOps, quiero detección automática de anomalías (picos inusuales de gasto), para recibir alertas tempranas de desviaciones inesperadas.

#### Criterios de Aceptación

1. THE Sistema_Anomalias SHALL calcular la media y desviación estándar del gasto diario por servicio utilizando los datos de las últimas 4 semanas (28 días).
2. WHEN el gasto diario de un servicio excede 2 desviaciones estándar por encima de la media de las últimas 4 semanas, THE Sistema_Anomalias SHALL generar una alerta de anomalía.
3. WHEN se genera una alerta de anomalía, THE Sistema_Anomalias SHALL incluir contexto: nombre del servicio, monto actual (USD), monto esperado — media (USD), número de desviaciones estándar excedidas (con 1 decimal) y fecha de inicio del pico (ISO-8601).
4. THE Sistema_Dashboard SHALL mostrar las anomalías detectadas en un panel dedicado con indicador visual de severidad: warning (entre 2 y 3 desviaciones estándar) y critical (más de 3 desviaciones estándar), ordenadas por severidad descendente.
5. IF un servicio cuenta con menos de 28 días de datos históricos, THEN THE Sistema_Anomalias SHALL excluir dicho servicio del cálculo de anomalías hasta alcanzar el mínimo de datos requerido.
