# Requirements Document

## Introduction

AI Cost Tracker & FinOps Governance Engine para el Strategy Cockpit de Seguros Bolívar. Plataforma que unifica la visibilidad de costos AI y cloud, implementa governance proactiva, habilita showback por célula de desarrollo y demuestra el ROI de la inversión tecnológica — pasando de "explicar el gasto pasado" a "influir decisiones futuras."

El módulo permite al Gerente de FinOps tomar decisiones de inversión informadas, auto-financiar iniciativas de AI con savings identificados y reportar unit economics al CTO/CIO mediante dashboards ejecutivos, alertas configurables y simulaciones de proyección de costos.

## Glossary

- **System**: El AI Cost Tracker & FinOps Governance Engine, módulo principal del Strategy Cockpit
- **Dashboard**: Vista consolidada de métricas y KPIs con capacidad de filtrado e interacción
- **FinOps**: Disciplina de gestión financiera cloud que combina prácticas financieras con DevOps para optimizar el gasto en tecnología
- **Showback**: Modelo de asignación de costos donde cada equipo/célula visualiza su consumo sin generar un cargo contable directo
- **Chargeback**: Modelo de asignación de costos donde cada equipo/célula recibe un cargo contable directo por su consumo
- **Unit_Economics**: Métrica que expresa el costo tecnológico por unidad de transacción de negocio (e.g., costo por póliza cotizada)
- **FOCUS**: FinOps Open Cost and Usage Specification — estándar abierto para normalizar datos de costo y uso multi-proveedor con campos: ServiceName, BilledCost, UsageQuantity, Provider
- **MegaBill**: Vista unificada que consolida gastos de cloud, SaaS y licencias en una sola pantalla normalizada bajo FOCUS
- **Sparkline**: Mini-gráfico de tendencia embebido en una celda de tabla que muestra variación temporal sin ejes
- **Token**: Unidad de consumo en modelos de lenguaje (LLM); cada inferencia consume tokens de entrada y salida
- **GPU_Hour**: Unidad de tiempo de cómputo en unidades de procesamiento gráfico usadas para entrenamiento o inferencia de modelos AI
- **Inference**: Ejecución única de un modelo de AI para producir una predicción o respuesta a partir de datos de entrada
- **Provider**: Proveedor de servicios AI o cloud (e.g., AWS Bedrock, OpenAI, Anthropic, Azure, GCP)
- **Cell**: Célula o equipo de desarrollo dentro de Seguros Bolívar que consume recursos cloud y AI
- **Threshold_Alert**: Regla configurable que dispara una notificación cuando el gasto de un servicio supera un umbral definido
- **Self_Funding_Ratio**: Proporción entre los savings identificados por optimización y la inversión acumulada en AI
- **Rightsizing**: Recomendación de ajustar el tamaño de un recurso cloud (e.g., reducir instancia EC2) para eliminar capacidad ociosa
- **Confidence_Band**: Rango de proyección que muestra escenarios optimista, base y pesimista con un intervalo de confianza definido
- **Drill_Down**: Capacidad de navegación jerárquica desde una vista agregada hacia el detalle de un servicio o categoría específica
- **COP**: Peso colombiano, moneda principal para reportes financieros locales
- **USD**: Dólar estadounidense, moneda de referencia para servicios cloud internacionales
- **Severity**: Nivel de criticidad de una alerta: warning (advertencia) o critical (crítico)
- **Budget**: Presupuesto asignado a una célula/equipo para un período determinado

## Requirements

### Requirement 1: AI Cost Dashboard (HUF01)

**User Story:** Como Gerente de FinOps, quiero visualizar el gasto acumulado en servicios AI agrupado por servicio, equipo y proveedor, para identificar los principales drivers de costo en inteligencia artificial.

#### Acceptance Criteria

1. WHEN a user navigates to the AI Cost Dashboard, THE System SHALL display the accumulated AI spend grouped by service, team, and provider with amounts in COP and USD
2. WHEN a user applies a date range filter, THE System SHALL recalculate and display AI costs only for the selected period
3. WHEN a user applies a team filter, THE System SHALL display AI costs only for the selected Cell
4. WHEN a user applies a provider filter, THE System SHALL display AI costs only for the selected Provider (AWS Bedrock, OpenAI, or Anthropic)
5. THE System SHALL display consumption metrics in three units: tokens consumed, inference count, and GPU_Hours utilized
6. THE System SHALL present mock data from at minimum three providers: AWS Bedrock, OpenAI, and Anthropic
7. THE System SHALL simulate hourly data refresh by displaying a "last updated" timestamp that increments every 60 minutes
8. IF no data exists for the selected filter combination, THEN THE System SHALL display an empty state message indicating zero consumption for the selected criteria

### Requirement 2: Unit Economics (HUF02)

**User Story:** Como Gerente de FinOps, quiero ver el costo por transacción de negocio procesada con AI, para evaluar la eficiencia económica de cada caso de uso de inteligencia artificial en el dominio asegurador.

#### Acceptance Criteria

1. THE System SHALL display a table correlating: AI service name, total cost (COP), transactions processed, and unit cost per transaction
2. THE System SHALL present Unit_Economics for a minimum of three business use cases: cost per quoted policy (cotización de póliza), cost per analyzed claim (análisis de siniestro), and cost per customer service interaction (atención al cliente)
3. WHEN a user views the Unit Economics table, THE System SHALL display a Sparkline showing the weekly trend of unit cost for each business use case over the last 8 weeks
4. THE System SHALL calculate unit cost as: total AI service cost divided by number of transactions processed in the selected period
5. WHEN unit cost increases more than 20 percent compared to the previous week, THE System SHALL highlight the row with a visual warning indicator
6. IF a service has zero transactions in the period, THEN THE System SHALL display "N/A" for unit cost instead of dividing by zero

### Requirement 3: Showback/Chargeback per Cell (HUF03)

**User Story:** Como Gerente de FinOps, quiero un modelo de showback que asigne costos cloud, AI y SaaS a cada célula de desarrollo, para que cada equipo conozca su consumo real y se responsabilice de su eficiencia.

#### Acceptance Criteria

1. THE System SHALL display a view per Cell showing four cost categories: cloud cost, AI cost, SaaS cost, and total cost, all in COP
2. THE System SHALL display the percentage of total cost consumed versus the assigned Budget for each Cell
3. WHEN a Cell exceeds 80 percent of its assigned Budget, THE System SHALL highlight the cell row with a warning indicator
4. WHEN a Cell exceeds 100 percent of its assigned Budget, THE System SHALL highlight the cell row with a critical indicator
5. THE System SHALL display an efficiency ranking ordering Cells from lowest to highest cost-per-transaction ratio
6. THE System SHALL present mock data for a minimum of 5 Cells with names coherent to Seguros Bolívar development teams (e.g., Célula Vida, Célula Autos, Célula Siniestros, Célula Digital, Célula Datos)
7. WHEN a user selects a specific Cell, THE System SHALL display the cost breakdown by individual service within that Cell

### Requirement 4: Configurable Threshold Alerts (HUF04)

**User Story:** Como Gerente de FinOps, quiero configurar alertas cuando el gasto de un servicio supere umbrales definidos, para actuar proactivamente antes de que los sobrecostos impacten el presupuesto.

#### Acceptance Criteria

1. THE System SHALL provide a CRUD interface for alert rules with fields: service name, threshold amount in COP, and recipient email
2. WHEN a user creates an alert rule, THE System SHALL validate that the threshold amount is a positive number greater than zero
3. WHEN a user creates an alert rule, THE System SHALL validate that the recipient email has a valid email format
4. THE System SHALL display a panel of active Threshold_Alerts with their current Severity level: warning (80 percent of threshold) or critical (100 percent of threshold)
5. WHEN a service cost reaches 80 percent of the configured threshold, THE System SHALL change the alert status to warning Severity
6. WHEN a service cost reaches 100 percent of the configured threshold, THE System SHALL change the alert status to critical Severity
7. THE System SHALL maintain and display a history of triggered alerts with: timestamp, service name, threshold value, actual value, and Severity
8. IF a user attempts to create a duplicate alert rule for the same service, THEN THE System SHALL reject the creation and display a validation message indicating a rule already exists for that service

### Requirement 5: Unified Multi-Technology View - MegaBill (HUF05)

**User Story:** Como Gerente de FinOps, quiero una vista consolidada del gasto en cloud, SaaS y licencias normalizada bajo el estándar FOCUS, para tener un punto único de verdad del costo tecnológico total.

#### Acceptance Criteria

1. THE System SHALL display a consolidated MegaBill view with total spend grouped by three categories: cloud (AWS, Azure, GCP), SaaS, and licenses
2. THE System SHALL normalize all cost data using FOCUS fields: ServiceName, BilledCost, UsageQuantity, and Provider
3. WHEN a user selects a cost category, THE System SHALL perform a Drill_Down displaying individual services within that category with their respective BilledCost and UsageQuantity
4. WHEN a user selects an individual service in the Drill_Down, THE System SHALL display the monthly cost trend for that service over the last 6 months
5. THE System SHALL display the total consolidated cost in both COP and USD with the applicable exchange rate
6. THE System SHALL present mock data representing at minimum: 3 cloud providers (AWS, Azure, GCP), 2 SaaS services, and 2 license categories
7. IF a provider reports cost in USD, THEN THE System SHALL convert to COP using a configurable exchange rate stored in environment variables

### Requirement 6: Governance Policies Engine (HUF07)

**User Story:** Como Gerente de FinOps, quiero un motor de reglas que detecte recursos ociosos o sobredimensionados y recomiende acciones de optimización, para reducir el gasto cloud sin afectar la operación.

#### Acceptance Criteria

1. THE System SHALL provide a configurable rule engine where users define governance policies with conditions (e.g., "EC2 with average CPU utilization below 10 percent for 7 consecutive days")
2. WHEN the rule engine evaluates resources against configured policies, THE System SHALL generate a list of Rightsizing recommendations
3. THE System SHALL display each recommendation with: resource identifier, current configuration, recommended configuration, and estimated monthly saving in COP
4. THE System SHALL calculate the total estimated savings across all active recommendations
5. WHEN a user marks a recommendation as "accepted," THE System SHALL move the recommendation to an "implemented" status and include its saving in the realized savings total
6. WHEN a user marks a recommendation as "dismissed," THE System SHALL archive the recommendation and exclude it from active views
7. THE System SHALL provide at minimum 3 pre-configured policy templates: idle compute instances, oversized databases, and unused storage volumes
8. IF no resources match a configured policy, THEN THE System SHALL display a message indicating all resources are within optimal parameters

### Requirement 7: AI Investment vs. Savings - Self-Funding (HUF08)

**User Story:** Como Gerente de FinOps, quiero comparar la inversión acumulada en AI contra los savings generados por optimización, para demostrar que la AI se autofinancia con los ahorros que produce.

#### Acceptance Criteria

1. THE System SHALL display a dual dashboard showing: accumulated AI investment (total AI spend) on one side and accumulated savings identified by optimization on the other side
2. THE System SHALL calculate and display the Self_Funding_Ratio as: (total savings identified / total AI investment) expressed as a percentage
3. THE System SHALL display a visual progress indicator showing the Self_Funding_Ratio against a 100 percent goal (e.g., "AI self-funded at 73 percent")
4. WHEN the Self_Funding_Ratio reaches or exceeds 100 percent, THE System SHALL display a success indicator confirming AI investment is fully self-funded
5. THE System SHALL display the monthly evolution of both AI investment and savings as a time-series chart over the last 12 months
6. THE System SHALL present mock data demonstrating a realistic progression where savings grow over time as optimization policies take effect

### Requirement 8: What-If Cost Projection Simulator (HUF06)

**User Story:** Como Gerente de FinOps, quiero simular proyecciones de costo ante diferentes escenarios de crecimiento, para anticipar necesidades presupuestarias y negociar recursos con la dirección.

#### Acceptance Criteria

1. WHEN a user inputs a percentage usage increment for one or more services, THE System SHALL calculate cost projections at 1, 3, and 6 month intervals
2. THE System SHALL display projections with three Confidence_Bands: optimistic (lower bound at input minus 15 percent), base (at input value), and pessimistic (upper bound at input plus 25 percent)
3. THE System SHALL render the projection as a line chart with the three Confidence_Bands visually differentiated by color
4. WHEN a user modifies the percentage input, THE System SHALL recalculate and update the projection chart within 2 seconds
5. THE System SHALL accept percentage increment values between negative 50 percent and positive 200 percent
6. IF a user inputs a value outside the valid range, THEN THE System SHALL display a validation error indicating the acceptable range
7. THE System SHALL display the projected total cost at each interval (1, 3, 6 months) in both COP and USD for the base scenario

### Requirement 9: Executive One-Pager Dashboard for CTO (HUF10)

**User Story:** Como CTO/CIO, quiero un dashboard ejecutivo de una página con los KPIs más relevantes de gasto tecnológico, para tomar decisiones estratégicas sin necesidad de navegar múltiples vistas.

#### Acceptance Criteria

1. THE System SHALL display a single-page executive dashboard containing all key KPIs in a scannable layout
2. THE System SHALL display the current month total spend compared to the previous month total spend with the absolute difference in COP
3. THE System SHALL display the percentage variation between current and previous month spend with a directional indicator (up/down arrow)
4. THE System SHALL display the top 5 cost consumers (services or cells) ranked by total spend in the current month
5. THE System SHALL display the average cost-per-transaction across all business use cases
6. THE System SHALL display the count of open critical Threshold_Alerts
7. THE System SHALL display the current Self_Funding_Ratio as a prominent KPI
8. WHEN any KPI shows a negative trend exceeding 10 percent deterioration, THE System SHALL highlight that KPI with a visual warning indicator

## Technical Requirements

### Requirement 10: RESTful API with OpenAPI Specification

**User Story:** Como desarrollador del equipo, quiero una API RESTful documentada con OpenAPI 3.0 y versionada, para que la integración con otros módulos del Strategy Cockpit sea clara y estandarizada.

#### Acceptance Criteria

1. THE System SHALL expose all endpoints under the versioned path prefix /api/v1/
2. THE System SHALL provide a Swagger UI accessible at /api/v1/docs displaying the complete OpenAPI 3.0 specification
3. THE System SHALL expose the integration endpoint GET /api/v1/finops/summary returning a JSON object with fields: status, kpi_principal, trend, and alerts_count
4. WHEN a request is received without a valid JWT token, THE System SHALL return HTTP 401 Unauthorized with a generic error message
5. WHEN a request is received with a valid JWT but insufficient permissions, THE System SHALL return HTTP 403 Forbidden
6. IF an internal server error occurs, THEN THE System SHALL return HTTP 500 with a generic error body containing a correlation_id for traceability, without exposing stack traces

### Requirement 11: Authentication and Authorization

**User Story:** Como administrador de seguridad, quiero que todos los endpoints estén protegidos con JWT y control de acceso basado en roles, para garantizar que solo usuarios autorizados accedan a la información financiera.

#### Acceptance Criteria

1. THE System SHALL authenticate users via JWT tokens containing claims: userId, role, and team
2. THE System SHALL validate JWT signature and expiration on every protected request
3. WHEN a JWT token is expired, THE System SHALL return HTTP 401 with an error code indicating token expiration
4. THE System SHALL support at minimum three roles: admin (full access), manager (read and configure alerts), and viewer (read-only access)
5. WHEN a user with viewer role attempts to create or modify an alert rule, THE System SHALL return HTTP 403 Forbidden

### Requirement 12: Structured Logging and Observability

**User Story:** Como ingeniero de operaciones, quiero logs estructurados en formato JSON con correlation_id, para poder rastrear problemas en producción de forma eficiente.

#### Acceptance Criteria

1. THE System SHALL emit all log entries in structured JSON format with fields: timestamp (ISO-8601), level, service, correlation_id, and message
2. THE System SHALL generate a unique correlation_id for each incoming HTTP request and propagate it through all internal operations
3. THE System SHALL never log sensitive data including JWT tokens, passwords, or personally identifiable information
4. THE System SHALL expose a GET /health endpoint that verifies database connectivity and returns HTTP 200 with status field when healthy
5. IF the database connection fails, THEN THE System SHALL return HTTP 503 from the /health endpoint with status "unhealthy"

### Requirement 13: Containerization and Environment Configuration

**User Story:** Como ingeniero DevOps, quiero que la aplicación esté containerizada con Docker Compose y configurada mediante variables de entorno, para garantizar despliegues reproducibles y seguros.

#### Acceptance Criteria

1. THE System SHALL provide a Dockerfile for each service (frontend and backend) following multi-stage build best practices
2. THE System SHALL provide a docker-compose.yml that orchestrates all services including the database
3. WHEN a developer runs docker-compose up, THE System SHALL have all services healthy within 120 seconds
4. THE System SHALL read all configuration from environment variables with zero hardcoded secrets in source code
5. THE System SHALL provide a .env.example file documenting all required environment variables with placeholder values and descriptions
6. THE System SHALL implement health checks in docker-compose.yml for each service container

### Requirement 14: Database and Mock Data

**User Story:** Como desarrollador, quiero un esquema PostgreSQL con migraciones y datos seed realistas del dominio asegurador colombiano, para poder desarrollar y demostrar funcionalidad sin dependencias externas.

#### Acceptance Criteria

1. THE System SHALL use PostgreSQL 15+ as the primary database with schema managed via migration files
2. THE System SHALL provide seed data with a minimum of 20 records per main entity, coherent with the Colombian insurance domain
3. THE System SHALL include mock data for: cells named after Seguros Bolívar development teams, AI services from three providers, cost amounts in COP ranging from realistic Colombian insurance operations
4. THE System SHALL include mock transaction data for: policy quotations (cotizaciones de póliza), claim analysis (análisis de siniestros), and customer service interactions (atención al cliente)
5. WHEN migrations run, THE System SHALL create all required tables, indexes, and constraints without manual intervention
