# Changelog — feature/ai-cost-tracker-specs

## [No publicado]

### Agregado
- Se creó proyecto backend con Express 4.22.2, pg, Zod, cors, helmet, uuid, dotenv (dependencias con versiones pinneadas exactas)
- Se creó estructura de carpetas: src/routes, src/services, src/repositories, src/validators, src/middleware, src/mock, src/config, src/utils
- Se creó src/config/db.js con pool de PostgreSQL configurable por env vars (DATABASE_URL o individuales)
- Se creó src/middleware/error-handler.js con clase APIError y formato estándar de respuesta
- Se creó src/middleware/correlation-id.js para propagación de X-Correlation-ID (genera UUID si no existe)
- Se creó src/middleware/auth.js con validación JWT simulada para prototipo de hackathon
- Se creó src/app.js con setup de Express (helmet, cors, JSON parser, middleware, health check)
- Se crearon tests unitarios para auth, error-handler, correlation-id y app (20 tests, 100% passing)
- Se creó jest.config.js y .env.example para configuración del proyecto
- Se creó backend/src/mock/schema.sql con 11 tablas (teams, ai_costs, megabill_costs, alert_rules, alert_history, governance_rules, recommendations, resource_tags, cost_avoidance, daily_cost_stats, unit_economics) y 7 índices de rendimiento
- Se creó backend/src/mock/seed.js — script idempotente para generar datos mock realistas: 3 proveedores IA (6 servicios), 5 células, 3 proveedores cloud, 2 SaaS, 2 licencias, 3 casos de uso, 6 meses de historia diaria con tendencias, estacionalidad y spikes de anomalía
- Se creó backend/src/services/megabill.service.js con getMegaBill() y getDrillDown(category) — normalización FOCUS, distribución porcentual ajustada a 100%
- Se creó backend/src/validators/megabill.validator.js con validación Zod para categoría (cloud, saas, licenses)
- Se creó backend/src/routes/megabill.routes.js con endpoints GET /api/v1/costs/megabill y GET /api/v1/costs/megabill/:category
- Se crearon tests unitarios para megabill.service.js (15 tests cubriendo estados vacíos, parciales, normalización FOCUS, redondeo y porcentajes)
- Se creó backend/src/validators/cost.validator.js con Zod schema para CostFilters (date range max 12 meses, provider enum, groupBy, team opcional)
- Se creó backend/src/services/cost.service.js con getAISpend(filters) — cálculo de totales, porcentajes y métricas de consumo (tokens, inferences, GPU-hours) — y advanceTime() para avance temporal +1 hora
- Se creó backend/src/routes/cost.routes.js con GET /api/v1/costs/ai-spend y POST /api/v1/costs/ai-spend/advance
- Se crearon tests unitarios para cost.service y cost.validator (18 tests cubriendo breakdown, percentages, filtros, avance temporal y validación Zod)
- Se creó backend/src/services/showback.service.js con getShowback(month) — desglose por equipo (cloud, AI, SaaS, total), budgetPercentage, efficiencyRatio, overBudget, distribución proporcional de costos megabill por peso AI, ranking por eficiencia
- Se creó backend/src/repositories/showback.repository.js con queries parametrizadas para equipos, costos AI por team, y megabill por categoría
- Se creó backend/src/validators/showback.validator.js con validación Zod para month (YYYY-MM o YYYY-MM-DD)
- Se creó backend/src/routes/showback.routes.js con endpoint GET /api/v1/costs/showback
- Se crearon tests unitarios para showback.service (17 tests cubriendo boundaries, distribución proporcional, presupuesto, ranking, overBudget, equipos sin presupuesto)
- Se creó backend/src/services/unit-economics.service.js con getUnitEconomics(params) — cálculo de costo unitario (4 decimales), trend semanal (últimas 8 semanas) y dirección de tendencia (up/down/stable)
- Se creó backend/src/repositories/unit-economics.repository.js con queries parametrizadas para datos por período y tendencia semanal
- Se creó backend/src/validators/unit-economics.validator.js con Zod schema para período (week|month) o rango personalizado (máx 90 días)
- Se creó backend/src/routes/unit-economics.routes.js con endpoint GET /api/v1/costs/unit-economics
- Se crearon tests unitarios para unit-economics.service (20 tests cubriendo calculateUnitCost, determineTrendDirection, resolveDateRange, buildWeeklyTrend, getUnitEconomics con tendencias y caso cero transacciones)
- Se registraron 4 módulos de rutas en src/app.js (cost, unit-economics, showback, megabill) montados en /api/v1/costs — antes del error handler y después del auth middleware
- Se creó backend/src/server.js como entry point con dotenv, listen en PORT 3001, y graceful shutdown (SIGTERM/SIGINT → close HTTP server → drain pool → exit 0) con logging estructurado
