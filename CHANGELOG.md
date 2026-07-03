# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y este proyecto adhiere a [Versionamiento Semántico](https://semver.org/lang/es/).

## [No publicado]

### Corregido
- Se eliminó dependencia de PostgreSQL en el dashboard ejecutivo — estaba quemando datos en código, nunca los consultaba
- Se reemplazó completamente el flujo de backend: eliminadas queries SQL complejas que NO funcionaban
- Se implementó mock data en memoria con datos por mes (7 meses de historial: enero-junio 2026 + diciembre 2025)
- Se corrigió mapeado de respuestas del API: frontend ahora consume estructura correcta (totalSpend.currentMonthCop, topConsumers, etc.)
- Dashboard es ahora completamente interactivo: cambiar mes actualiza todos los KPIs y top servicios en tiempo real

### Cambiado
- Se refactorizó controller executive para devolver mock data en memoria en lugar de llamadas DB
- Se actualizaron componentes React para consumir estructura correcta del API response
- Los filtros de mes, proveedor y producto ahora funcionan correctamente en el backend

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
