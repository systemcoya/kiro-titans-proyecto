# Criterios de Evaluación — Kiro Titans (Equipo 2)

## Contexto del Reto

**Hackathon:** Gerencia Estratégica de TI — Seguros Bolívar (03 julio 2026, 8 horas)
**Equipo:** Kiro Titans (Equipo 2)
**Módulo:** AI Cost Tracker & FinOps Governance Engine
**Dominio:** FinOps
**Evaluación total:** 40 puntos (15 técnicos + 25 jurados)

**Visión del Producto:** Plataforma que unifica visibilidad de costos AI y cloud, implementa governance proactiva, habilita showback por célula y demuestra el ROI de la inversión tecnológica — pasando de "explicar el gasto pasado" a "influir decisiones futuras."

**User Story Principal:** Como Gerente de FinOps, quiero un sistema integral de gestión del valor de la tecnología centrado en AI y cloud, para tomar decisiones de inversión, self-fundar AI con savings, y reportar unit economics al CTO/CIO.

---

## Historias de Usuario Asignadas

### Must Have (TODAS obligatorias)

| ID | Historia | Criterio de Aceptación |
|----|----------|----------------------|
| HUF01 | Visualizar gasto acumulado AI (tokens, inferencias, GPU-hours) por servicio, equipo y proveedor | Dashboard con filtros por fecha, equipo y proveedor (AWS Bedrock, OpenAI, Anthropic). Datos mock de al menos 3 proveedores. Actualización simulada cada hora. |
| HUF02 | Ver unit economics: costo por transacción de negocio procesada con AI | Tabla: servicio AI → costo total → transacciones procesadas → costo unitario. Tendencia semanal con sparkline. Mínimo 3 casos de uso de negocio. |
| HUF03 | Modelo showback/chargeback que asigne costos cloud+AI a cada célula/equipo | Vista por equipo/célula: costo cloud, costo AI, costo SaaS, total. % vs presupuesto. Ranking de eficiencia. |
| HUF04 | Alertas configurables cuando gasto supere umbrales | CRUD de reglas: servicio + umbral + destinatario. Panel de alertas activas (warning/critical). Histórico de alertas disparadas. |
| HUF05 | Gasto multi-tecnología unificado: cloud + SaaS + licencias | Vista "MegaBill": gasto total por categoría. Drill-down por servicio. Normalización FOCUS (ServiceName, BilledCost, UsageQuantity, Provider). |

### Should Have (mínimo 4 obligatorios)

| ID | Historia | Criterio de Aceptación |
|----|----------|----------------------|
| HUF06 | Simulador "what-if" de proyección de costos | Input: % incremento por servicio. Output: proyección 1, 3, 6 meses. Bandas de confianza (optimista/pesimista/base). |
| HUF07 | Governance policies automatizadas (recursos ociosos/sobredimensionados) | Motor de reglas configurable. Lista de recomendaciones con saving estimado. |
| HUF08 | Comparar inversión AI vs. savings (self-funding) | Dashboard dual: inversión AI + savings. Ratio autofinanciamiento. Meta visual ("AI self-funded al 73%"). |
| HUF09 | Informe de cost avoidance (shift-left) | Registro acciones preventivas. Cálculo costo evitado acumulado mensual. |
| HUF10 | Dashboard ejecutivo one-pager para CTO | KPIs: gasto actual vs anterior, % variación, top consumers, cost-per-transaction, alertas críticas. |
| HUF11 | Tagging de recursos con metadatos de negocio | CRUD tags con validación. Vista "tagging compliance" (% recursos etiquetados). Alerta si < 80%. |

### Nice to Have

| ID | Historia | Criterio de Aceptación |
|----|----------|----------------------|
| HUF12 | Anomaly detection de picos de gasto | Variaciones > 2 desviaciones estándar vs últimas 4 semanas. Alerta con contexto. |

---

## Requerimientos Técnicos Obligatorios

| ID | Requerimiento | Validación |
|----|--------------|------------|
| RT01 | Kiro como herramienta central | Spec visible en Kiro con user stories, criterios y diseño técnico |
| RT02 | Flujo Spec-Driven obligatorio | Spec existió ANTES del código. Código corresponde a spec. |
| RT03 | Stack aprobado | Angular 17+ o React 18+/Vite. Backend: Node.js 20+/Express o Python 3.12+/FastAPI |
| RT04 | API RESTful con OpenAPI | Swagger UI funcional. Mínimo 3 endpoints documentados. Versionado /api/v1/ |
| RT05 | PostgreSQL 15+ | Schema via migrations. Datos seed para demo. |
| RT06 | Autenticación JWT | Login endpoint. Endpoints protegidos retornan 401 sin token. |
| RT07 | Separación de capas | Service layer explícito. Cero lógica de negocio en controllers. |
| RT08 | Containerización | Dockerfile + Docker Compose. docker-compose up < 2 min. Health check. |
| RT09 | Datos mock realistas | Mínimo 20 registros. Datos coherentes con dominio asegurador colombiano. |
| RT10 | Endpoint de integración | /api/v1/finops/summary → JSON: {status, kpi_principal, trend, alerts_count} |
| RT11 | Variables de entorno | Cero hardcoded. .env.example documentado. |
| RT12 | Logging estructurado | JSON: timestamp, level, service, correlation_id, message. No console.log(). |

## Requerimientos No Funcionales

| ID | Categoría | Requerimiento | Validación |
|----|-----------|--------------|------------|
| RNF01 | Performance | API < 500ms queries, < 2s agregaciones | p95 cumple |
| RNF02 | Código Limpio | Funciones < 20 líneas, nombres descriptivos, zero dead code | Zero warnings critical en linter |
| RNF03 | Type Safety | 100% type hints/strict TS (no `any`) | No existe any/Object/dict sin tipado |
| RNF04 | Testing | Mínimo 3 tests unitarios por módulo. Cobertura > 60% | Tests pasan. Coverage report. |
| RNF05 | Seguridad | Queries parametrizadas. Inputs validados. Errores genéricos. | Zero SQL injection. Sin stack traces. |
| RNF06 | Documentación | README: setup, endpoints, decisiones. Docstrings en servicios. | Dev externo levanta en < 5 min |
| RNF07 | UX/UI | Interfaz intuitiva. Navegación clara. | Evaluado en demo en vivo |
| RNF08 | Estabilidad | Demostrable en vivo sin errores críticos | Demo 5 min sin crashes |
| RNF09 | Error Handling | ValidationError(400), NotFound(404), BusinessError(422), InternalError(500) | HTTP correcto + {detail, code} |
| RNF10 | Observabilidad | Health endpoint /health que verifica DB | GET /health → 200 con status |
| RNF11 | Alineación Spec-Código | Código corresponde exactamente a specs de Kiro | Trazabilidad comprobable |

---

## 🤖 Evaluación del Agente de Kiro (15 pts)

### 1. Calidad de la Especificación (5 pts)

- **Claridad y Completitud:** User stories claras, completas y verificables.
- **Criterios de Aceptación:** Específicos y medibles.
- **Documentación Técnica:** Diseño documenta decisiones clave (arquitectura, dependencias, restricciones).
- **Nota:** Se evalúa exclusivamente el artefacto generado en Kiro (`.kiro/specs/`).

### 2. Uso Efectivo de Kiro y Spec-Driven Development (5 pts)

- **Herramienta Central:** Kiro es el eje para especificar y construir.
- **Flujo de Trabajo:** `spec → diseño → código`. Nunca código improvisado sin spec previa.
- **Trazabilidad:** Specs guían implementación de forma comprobable.

### 3. Prototipo Funcional - Calidad de Código (5 pts)

- **Arquitectura:** Código limpio, organizado, mejores prácticas.
- **Alineación:** Código corresponde EXACTAMENTE a lo descrito en las specs de Kiro.

---

## 👥 Evaluación de los Jurados (25 pts)

### 4. Relevancia para el Negocio (10 pts)

- **Solución de Problema:** Problema real y prioritario del sector asegurador en Colombia.
- **Impacto Potencial:** Claro y medible (reducción de costos, eficiencia, experiencia).
- **Contexto Local:** Entorno regulatorio colombiano y mercado de seguros.

### 5. Prototipo Funcional - Demo en Vivo (10 pts)

- **Funcionalidad:** Cumple funcionalidad principal del caso de uso.
- **Estabilidad:** Ejecutable y demostrable sin errores críticos.
- **UX/UI:** Interfaz intuitiva que resuelve la necesidad.

### 6. Presentación y Colaboración (5 pts)

- **Pitch:** Clara, concisa y convincente (máx 5 min).
- **Sinergia del Equipo:** Colaboración real y equilibrada.
- **Defensa de la Idea:** Solidez técnica y de negocio ante preguntas.

---

## Entregables Obligatorios

| # | Entregable | Descripción | Evaluador |
|---|-----------|-------------|-----------|
| 1 | Especificación en Kiro | User stories + criterios + diseño técnico | Kiro Agent |
| 2 | Código fuente alineado a spec | Limpio, tipado, organizado, corresponde a spec | Kiro Agent |
| 3 | Prototipo funcional | Docker Compose up + demo 5 min sin errores | Jurados |
| 4 | Pitch de 5 minutos | Problema, solución, impacto, demo | Jurados |

---

## Flujo Obligatorio

```
1. ESPECIFICAR → 2. DISEÑAR → 3. IMPLEMENTAR → 4. DEMOSTRAR
   (User Stories)    (Arquitectura)   (Código alineado)   (Demo + Pitch)
```

---

## Reglas de Aplicación

1. **Antes de codificar:** Crear spec en Kiro (requirements → design → tasks).
2. **Durante el desarrollo:** Verificar que cada implementación corresponda a su spec.
3. **Al entregar:** Código limpio, organizado, alineado con documentación.
4. **Priorizar:** Must Have primero, luego Should Have. Funcionalidad demostrable completa > features a medias.
5. **Datos:** Usar datos mock realistas del dominio FinOps/asegurador colombiano.
6. **Integración:** Exponer /api/v1/finops/summary con formato estándar para la vista unificada del Strategy Cockpit.
