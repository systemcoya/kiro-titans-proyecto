# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y este proyecto adhiere a [Versionamiento Semántico](https://semver.org/lang/es/).

## [No publicado]

### Agregado
- Se configuró backend Express con helmet, cors, JSON parser, correlation-id y error handler centralizado
- Se instalaron dependencias de producción con versiones exactas: express 4.21.2, cors 2.8.5, helmet 8.0.0, zod 3.24.1, uuid 11.0.5, dotenv 16.4.7, pg 8.13.1
- Se creó estructura de carpetas backend: routes, middleware, config, utils, repositories, validators, mock
- Se creó src/config/db.js con pool PostgreSQL configurable por variables de entorno
- Se creó src/middleware/correlation-id.js para propagación de X-Correlation-ID
- Se creó src/middleware/error-handler.js con formato APIError estándar (statusCode, error, message, details, correlationId)
- Se creó src/middleware/auth.js con validación JWT simulada (mock para hackathon)
- Se crearon 10 módulos de rutas stub bajo /api/v1: costs, alerts, simulator, governance, self-funding, cost-avoidance, executive, tagging, anomalies, health
- Se creó src/app.js registrando todos los módulos de rutas con middleware de seguridad
- Se creó src/server.js con graceful shutdown (SIGTERM/SIGINT), cierre de pool DB y timeout de seguridad
- Se implementó endpoint GET /api/v1/health para health check
- Se crearon 12 páginas de feature como placeholders con estructura PageContainer (executive, ai-spend, unit-economics, showback, alerts, megabill, simulator, governance, self-funding, cost-avoidance, tagging, anomalies)
- Se creó componente PageContainer con diseño responsivo (max-width, padding adaptable)
- Se creó componente PageSkeleton como fallback de carga para Suspense
- Se implementó code splitting con React.lazy() y Suspense en todas las rutas
- Se implementó sidebar responsivo: drawer móvil con overlay y toggle hamburguesa, colapso en desktop

### Cambiado
- Se tradujeron todos los textos del frontend a español: título de la app, sidebar, header, comentarios JSDoc, título HTML y placeholder de rutas

### Agregado
- Se creó proyecto frontend con Vite 5.x, React 18, TypeScript, Tailwind CSS 3.x, Shadcn UI (Radix), Recharts 2.x, Axios 1.x, React Router 6.x, React Query 5.x, React Hook Form + Zod, Sonner, Lucide React
- Se configuró estructura de carpetas: components/ui, components/layout, components/charts, features, services, hooks, types, config, lib
- Se creó src/types/index.ts con todas las interfaces TypeScript del diseño (CostFilters, AISpendResponse, UnitEconomicsRow, ShowbackRow, AlertRule, Alert, FOCUSRecord, SimulationRequest, SimulationResponse, GovernanceRule, Recommendation, SelfFundingResponse, CostAvoidanceAction, AnomalyAlert)
- Se creó src/services/api-client.ts con instancia Axios configurada (baseURL, interceptor de X-Correlation-ID UUID v4, manejo de errores 401/5xx)
- Se creó src/components/layout/Sidebar.tsx con navegación a los 12 módulos con iconos Lucide (colapsable)
- Se creó src/components/layout/Header.tsx con título "AI Cost Tracker — Strategy Cockpit"
- Se configuró estructura base del repositorio para trabajo colaborativo en equipo
- Se agregó template de Pull Request para estandarizar contribuciones
- Se creó guía de colaboración con flujo de trabajo Git
- Se creó documento de diseño (design.md) para el módulo AI Cost Tracker FinOps — Strategy Cockpit, incluyendo arquitectura, componentes, modelos de datos, 17 correctness properties y estrategia de testing
- Se creó plan de implementación (tasks.md) con 47 tareas organizadas en 17 épicas, cubriendo los 12 requisitos del Strategy Cockpit con property-based testing (fast-check) para las 17 propiedades de correctitud
- Se agregó archivo de datos de prueba (docs/data-seed-finops.md) con datos reales de showback del negocio de Pólizas de Autos para alimentar el seed del proyecto
- Se creó steering de criterios de evaluación del hackathon para guiar decisiones de desarrollo
