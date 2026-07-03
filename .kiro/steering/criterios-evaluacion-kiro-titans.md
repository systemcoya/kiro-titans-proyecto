# Criterios de Evaluación — Kiro Titans Hackathon

## Contexto

Este proyecto participa en un evento tipo hackathon donde se evalúan 40 puntos totales divididos entre:
- **Agente de Kiro (15 pts):** Auditoría técnica sobre artefactos y repositorio.
- **Jurados (25 pts):** Valor comercial, ejecución en vivo, comunicación.

Todas las decisiones de desarrollo deben optimizar estos criterios.

---

## 1. Calidad de la Especificación (5 pts)

Maximizar la calidad de los artefactos generados en `.kiro/specs/`:

- **User Stories:** Deben ser claras, completas y verificables. Usar formato estándar "Como [rol], quiero [acción], para [beneficio]".
- **Criterios de Aceptación:** Deben ser específicos, medibles y testables. Evitar ambigüedades. Cada criterio debe poderse verificar con un test o una demostración concreta.
- **Documentación Técnica (design.md):** Debe documentar decisiones clave de arquitectura, dependencias elegidas y restricciones. Incluir diagramas cuando aporten claridad.
- **Nota:** Solo se evalúan artefactos generados dentro de la plataforma Kiro (`.kiro/specs/`).

### Checklist obligatorio:
- [ ] Cada requirement tiene user story completa
- [ ] Criterios de aceptación son medibles (números, estados, condiciones)
- [ ] design.md explica el "por qué" de cada decisión arquitectónica
- [ ] No hay specs vacías o genéricas

---

## 2. Uso Efectivo de Kiro y Spec-Driven Development (5 pts)

Demostrar un flujo real de `spec → diseño → código`:

- **Herramienta Central:** Kiro debe ser el eje de especificación y construcción. Todo feature debe nacer de una spec.
- **Flujo de Trabajo:** Evidenciar la secuencia requirements → design → tasks → implementación. No improvisar código sin spec previa.
- **Trazabilidad:** Las specs deben guiar las decisiones de implementación de forma comprobable. El código implementado debe corresponder directamente a lo especificado.

### Reglas de desarrollo:
- NUNCA escribir código de negocio sin una spec previa en `.kiro/specs/`.
- Cada feature debe tener su carpeta en `.kiro/specs/{feature-name}/` con requirements.md, design.md y tasks.md.
- Los commits deben referenciar la spec o task que implementan.
- Si surge un cambio durante la implementación, actualizar la spec primero.

---

## 3. Prototipo Funcional — Calidad de Código (5 pts)

- **Arquitectura de Software:** Código limpio, organizado, siguiendo mejores prácticas (SOLID, DRY, KISS). Separación clara de capas.
- **Alineación con Specs:** El código entregado debe corresponder EXACTAMENTE a lo descrito en las especificaciones de Kiro. No debe haber features implementadas sin spec ni specs sin implementar.

### Reglas:
- Mantener consistencia entre specs y código en todo momento.
- Si la implementación diverge de la spec, actualizar la spec para reflejar la realidad.
- Código con estructura por dominio/feature, no por tipo técnico.
- Tests unitarios para toda lógica de negocio.

---

## 4. Relevancia para el Negocio (10 pts — Jurados)

Aunque esto lo evalúan los jurados, el código y la solución deben reflejar:

- **Solución de Problema:** Resolver un problema real y prioritario del sector asegurador en Colombia.
- **Impacto Potencial:** Impacto claro y medible (reducción de costos, experiencia del cliente, eficiencia operativa).
- **Contexto Local:** Tener en cuenta el entorno regulatorio y la realidad del mercado colombiano.

### Guía para el desarrollo:
- Incluir en las specs el problema de negocio que se resuelve.
- Documentar métricas de impacto esperado en el design.md.
- Considerar normativas colombianas relevantes (Superintendencia Financiera, Habeas Data, etc.).

---

## 5. Prototipo Funcional — Demostración en Vivo (10 pts — Jurados)

El prototipo debe ser demostrable sin errores críticos:

- **Funcionalidad:** Debe cumplir con la funcionalidad principal descrita en el caso de uso.
- **Estabilidad:** Ejecutable y demostrable en vivo sin crashes.
- **UX/UI:** Interfaz intuitiva que resuelva la necesidad planteada.

### Reglas de desarrollo:
- Priorizar el happy path funcional y estable sobre features incompletas.
- Manejar errores gracefully — nunca mostrar stack traces al usuario.
- Implementar estados de carga, error y vacío en toda la UI.
- Hacer pruebas de flujo completo antes de la demo.
- Tener datos de prueba preparados para la demostración.

---

## 6. Presentación y Colaboración (5 pts — Jurados)

- Pitch claro y conciso (5 minutos máximo).
- Defensa técnica sólida ante preguntas del jurado.

### Soporte desde el desarrollo:
- README.md debe explicar claramente qué hace el proyecto y cómo ejecutarlo.
- Documentar decisiones técnicas para que cualquier miembro del equipo pueda defenderlas.
- Mantener el CHANGELOG actualizado como evidencia de progreso.

---

## Priorización de Desarrollo

Orden de prioridad basado en impacto en puntuación:

1. **Specs completas y de calidad** (5 pts directos + soporta trazabilidad)
2. **Flujo spec-driven demostrable** (5 pts directos)
3. **Prototipo funcional estable** (10 pts de jurados + 5 pts calidad código)
4. **Relevancia de negocio clara** (10 pts de jurados)
5. **Código limpio y alineado** (5 pts directos)

> Total controlable directamente por desarrollo: ~30 de 40 puntos.
