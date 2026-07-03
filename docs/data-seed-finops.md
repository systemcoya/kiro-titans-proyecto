# Data de Referencia para Seed — AI Cost Tracker FinOps

Este archivo contiene los datos reales de prueba que debe usar Sergio para la tarea 1.3 (schema + seed).
Fuente: Simulación Showback por Centros de Costo - Venta de Pólizas de Autos V3.xlsx

## Contexto de Negocio

- **Aplicación:** Venta de Pólizas de Autos
- **Productos:** Autos verde (CC 5100), Autos ligeros (CC 5101), Vehículos pesados (CC 5102), Corporativo (General)
- **Proveedores Cloud:** AWS, GCP
- **Proveedores AI:** AWS Bedrock (Claude 3), GCP Vertex AI (Gemini Flash, Gemini Pro)
- **SaaS:** Twilio, Stripe, Datadog, Cloudflare, Mati/KYC
- **Período:** 2024-01 a 2026-12

## Mapeo a Historias de Usuario

| Hoja | Requisito que alimenta |
|------|----------------------|
| Costos Infra | HU-F01 (gasto cloud), HU-F03 (showback), HU-F05 (MegaBill) |
| Costos AI | HU-F01 (gasto IA), HU-F02 (unit economics), HU-F08 (inversión IA) |
| Otros costos | HU-F05 (MegaBill SaaS), HU-F03 (showback SaaS) |
| Pólizas emitidas | HU-F02 (unit economics: costo por póliza emitida) |

---

## Hoja 1: Costos de Infraestructura (Cloud)

| Mes | Proveedor | Servicio | Costo_USD | Producto | Centro_Costos |
|-----|-----------|----------|-----------|----------|---------------|
| 2026-01 | AWS | EC2 Cómputo | 600 | Autos verde | 5100 |
| 2026-01 | AWS | RDS Base de Datos | 400 | Autos verde | 5100 |
| 2026-01 | GCP | Cloud Storage | 150 | Autos verde | 5100 |
| 2026-01 | AWS | EC2 Cómputo | 400 | Autos ligeros | 5101 |
| 2026-01 | AWS | RDS Base de Datos | 300 | Autos ligeros | 5101 |
| 2026-01 | GCP | Cloud Storage | 120 | Autos ligeros | 5101 |
| 2026-01 | AWS | EC2 Cómputo | 200 | Vehiculos pesados | 5102 |
| 2026-01 | AWS | RDS Base de Datos | 100 | Vehiculos pesados | 5102 |
| 2026-01 | GCP | BigQuery Analítica | 600 | Corporativo | General |
| 2026-02 | AWS | EC2 Cómputo | 620 | Autos verde | 5100 |
| 2026-02 | AWS | RDS Base de Datos | 420 | Autos verde | 5100 |
| 2026-02 | GCP | Cloud Storage | 160 | Autos verde | 5100 |
| 2026-02 | AWS | EC2 Cómputo | 430 | Autos ligeros | 5101 |
| 2026-02 | AWS | RDS Base de Datos | 320 | Autos ligeros | 5101 |
| 2026-02 | GCP | Cloud Storage | 130 | Autos ligeros | 5101 |
| 2026-02 | AWS | EC2 Cómputo | 200 | Vehiculos pesados | 5102 |
| 2026-02 | AWS | RDS Base de Datos | 110 | Vehiculos pesados | 5102 |
| 2026-02 | GCP | BigQuery Analítica | 620 | Corporativo | General |
| 2026-03 | AWS | EC2 Cómputo | 700 | Autos verde | 5100 |
| 2026-03 | AWS | RDS Base de Datos | 450 | Autos verde | 5100 |
| 2026-03 | GCP | Cloud Storage | 180 | Autos verde | 5100 |
| 2026-03 | AWS | EC2 Cómputo | 480 | Autos ligeros | 5101 |
| 2026-03 | AWS | RDS Base de Datos | 340 | Autos ligeros | 5101 |
| 2026-03 | GCP | Cloud Storage | 140 | Autos ligeros | 5101 |
| 2026-03 | AWS | EC2 Cómputo | 220 | Vehiculos pesados | 5102 |
| 2026-03 | AWS | RDS Base de Datos | 110 | Vehiculos pesados | 5102 |
| 2026-03 | GCP | BigQuery Analítica | 650 | Corporativo | General |
| 2026-04 | AWS | EC2 Cómputo | 720 | Autos verde | 5100 |
| 2026-04 | AWS | RDS Base de Datos | 460 | Autos verde | 5100 |
| 2026-04 | GCP | Cloud Storage | 190 | Autos verde | 5100 |
| 2026-04 | AWS | EC2 Cómputo | 500 | Autos ligeros | 5101 |
| 2026-04 | AWS | RDS Base de Datos | 350 | Autos ligeros | 5101 |
| 2026-04 | GCP | Cloud Storage | 140 | Autos ligeros | 5101 |
| 2026-04 | AWS | EC2 Cómputo | 230 | Vehiculos pesados | 5102 |
| 2026-04 | AWS | RDS Base de Datos | 110 | Vehiculos pesados | 5102 |
| 2026-04 | GCP | BigQuery Analítica | 680 | Corporativo | General |
| 2026-05 | AWS | EC2 Cómputo | 750 | Autos verde | 5100 |
| 2026-05 | AWS | RDS Base de Datos | 470 | Autos verde | 5100 |
| 2026-05 | GCP | Cloud Storage | 200 | Autos verde | 5100 |
| 2026-05 | AWS | EC2 Cómputo | 510 | Autos ligeros | 5101 |
| 2026-05 | AWS | RDS Base de Datos | 360 | Autos ligeros | 5101 |
| 2026-05 | GCP | Cloud Storage | 150 | Autos ligeros | 5101 |
| 2026-05 | AWS | EC2 Cómputo | 240 | Vehiculos pesados | 5102 |
| 2026-05 | AWS | RDS Base de Datos | 120 | Vehiculos pesados | 5102 |
| 2026-05 | GCP | BigQuery Analítica | 700 | Corporativo | General |
| 2026-06 | AWS | EC2 Cómputo | 800 | Autos verde | 5100 |
| 2026-06 | AWS | RDS Base de Datos | 490 | Autos verde | 5100 |
| 2026-06 | GCP | Cloud Storage | 210 | Autos verde | 5100 |
| 2026-06 | AWS | EC2 Cómputo | 540 | Autos ligeros | 5101 |
| 2026-06 | AWS | RDS Base de Datos | 370 | Autos ligeros | 5101 |
| 2026-06 | GCP | Cloud Storage | 160 | Autos ligeros | 5101 |
| 2026-06 | AWS | EC2 Cómputo | 260 | Vehiculos pesados | 5102 |
| 2026-06 | AWS | RDS Base de Datos | 120 | Vehiculos pesados | 5102 |
| 2026-06 | GCP | BigQuery Analítica | 720 | Corporativo | General |
| 2026-07 | AWS | EC2 Cómputo | 780 | Autos verde | 5100 |
| 2026-07 | AWS | RDS Base de Datos | 480 | Autos verde | 5100 |
| 2026-07 | GCP | Cloud Storage | 200 | Autos verde | 5100 |
| 2026-07 | AWS | EC2 Cómputo | 520 | Autos ligeros | 5101 |
| 2026-07 | AWS | RDS Base de Datos | 360 | Autos ligeros | 5101 |
| 2026-07 | GCP | Cloud Storage | 150 | Autos ligeros | 5101 |
| 2026-07 | AWS | EC2 Cómputo | 250 | Vehiculos pesados | 5102 |
| 2026-07 | AWS | RDS Base de Datos | 120 | Vehiculos pesados | 5102 |
| 2026-07 | GCP | BigQuery Analítica | 710 | Corporativo | General |
| 2026-08 | AWS | EC2 Cómputo | 820 | Autos verde | 5100 |
| 2026-08 | AWS | RDS Base de Datos | 500 | Autos verde | 5100 |
| 2026-08 | GCP | Cloud Storage | 210 | Autos verde | 5100 |
| 2026-08 | AWS | EC2 Cómputo | 560 | Autos ligeros | 5101 |
| 2026-08 | AWS | RDS Base de Datos | 380 | Autos ligeros | 5101 |
| 2026-08 | GCP | Cloud Storage | 160 | Autos ligeros | 5101 |
| 2026-08 | AWS | EC2 Cómputo | 270 | Vehiculos pesados | 5102 |
| 2026-08 | AWS | RDS Base de Datos | 130 | Vehiculos pesados | 5102 |
| 2026-08 | GCP | BigQuery Analítica | 740 | Corporativo | General |
| 2026-09 | AWS | EC2 Cómputo | 850 | Autos verde | 5100 |
| 2026-09 | AWS | RDS Base de Datos | 510 | Autos verde | 5100 |
| 2026-09 | GCP | Cloud Storage | 220 | Autos verde | 5100 |
| 2026-09 | AWS | EC2 Cómputo | 580 | Autos ligeros | 5101 |
| 2026-09 | AWS | RDS Base de Datos | 390 | Autos ligeros | 5101 |
| 2026-09 | GCP | Cloud Storage | 170 | Autos ligeros | 5101 |
| 2026-09 | AWS | EC2 Cómputo | 270 | Vehiculos pesados | 5102 |
| 2026-09 | AWS | RDS Base de Datos | 130 | Vehiculos pesados | 5102 |
| 2026-09 | GCP | BigQuery Analítica | 760 | Corporativo | General |
| 2026-10 | AWS | EC2 Cómputo | 900 | Autos verde | 5100 |
| 2026-10 | AWS | RDS Base de Datos | 530 | Autos verde | 5100 |
| 2026-10 | GCP | Cloud Storage | 230 | Autos verde | 5100 |
| 2026-10 | AWS | EC2 Cómputo | 610 | Autos ligeros | 5101 |
| 2026-10 | AWS | RDS Base de Datos | 400 | Autos ligeros | 5101 |
| 2026-10 | GCP | Cloud Storage | 180 | Autos ligeros | 5101 |
| 2026-10 | AWS | EC2 Cómputo | 290 | Vehiculos pesados | 5102 |
| 2026-10 | AWS | RDS Base de Datos | 130 | Vehiculos pesados | 5102 |
| 2026-10 | GCP | BigQuery Analítica | 790 | Corporativo | General |
| 2026-11 | AWS | EC2 Cómputo | 920 | Autos verde | 5100 |
| 2026-11 | AWS | RDS Base de Datos | 540 | Autos verde | 5100 |
| 2026-11 | GCP | Cloud Storage | 240 | Autos verde | 5100 |
| 2026-11 | AWS | EC2 Cómputo | 630 | Autos ligeros | 5101 |
| 2026-11 | AWS | RDS Base de Datos | 410 | Autos ligeros | 5101 |
| 2026-11 | GCP | Cloud Storage | 190 | Autos ligeros | 5101 |
| 2026-11 | AWS | EC2 Cómputo | 300 | Vehiculos pesados | 5102 |
| 2026-11 | AWS | RDS Base de Datos | 140 | Vehiculos pesados | 5102 |
| 2026-11 | GCP | BigQuery Analítica | 810 | Corporativo | General |
| 2026-12 | AWS | EC2 Cómputo | 1000 | Autos verde | 5100 |
| 2026-12 | AWS | RDS Base de Datos | 570 | Autos verde | 5100 |
| 2026-12 | GCP | Cloud Storage | 260 | Autos verde | 5100 |
| 2026-12 | AWS | EC2 Cómputo | 680 | Autos ligeros | 5101 |
| 2026-12 | AWS | RDS Base de Datos | 430 | Autos ligeros | 5101 |
| 2026-12 | GCP | Cloud Storage | 200 | Autos ligeros | 5101 |
| 2026-12 | AWS | EC2 Cómputo | 320 | Vehiculos pesados | 5102 |
| 2026-12 | AWS | RDS Base de Datos | 150 | Vehiculos pesados | 5102 |
| 2026-12 | GCP | BigQuery Analítica | 850 | Corporativo | General |

---

## Hoja 2: Costos AI

| Mes | Proveedor | Servicio_AI | Centro_Costos | Producto | Llamadas_API | Tokens | Costo_USD |
|-----|-----------|-------------|---------------|----------|-------------|--------|-----------|
| 2024-01 | AWS | Bedrock (Claude 3) | 5100 | Autos verde | 15000 | 45000000 | 450 |
| 2024-01 | GCP | Vertex AI (Gemini Flash) | 5101 | Autos ligeros | 25000 | 75000000 | 225 |
| 2024-01 | GCP | Vertex AI (Gemini Pro) | 5102 | Vehículos pesados | 5000 | 20000000 | 300 |
| 2024-06 | AWS | Bedrock (Claude 3) | 5100 | Autos verde | 18000 | 54000000 | 540 |
| 2024-06 | GCP | Vertex AI (Gemini Flash) | 5101 | Autos ligeros | 30000 | 90000000 | 270 |
| 2024-06 | GCP | Vertex AI (Gemini Pro) | 5102 | Vehículos pesados | 6000 | 24000000 | 360 |
| 2024-12 | AWS | Bedrock (Claude 3) | 5100 | Autos verde | 22000 | 66000000 | 660 |
| 2024-12 | GCP | Vertex AI (Gemini Flash) | 5101 | Autos ligeros | 35000 | 105000000 | 315 |
| 2024-12 | GCP | Vertex AI (Gemini Pro) | 5102 | Vehículos pesados | 7500 | 30000000 | 450 |
| 2025-01 | AWS | Bedrock (Claude 3) | 5100 | Autos verde | 24000 | 72000000 | 720 |
| 2025-01 | GCP | Vertex AI (Gemini Flash) | 5101 | Autos ligeros | 38000 | 114000000 | 342 |
| 2025-01 | GCP | Vertex AI (Gemini Pro) | 5102 | Vehículos pesados | 8000 | 32000000 | 480 |
| 2025-06 | AWS | Bedrock (Claude 3) | 5100 | Autos verde | 26000 | 78000000 | 780 |
| 2025-06 | GCP | Vertex AI (Gemini Flash) | 5101 | Autos ligeros | 42000 | 126000000 | 378 |
| 2025-06 | GCP | Vertex AI (Gemini Pro) | 5102 | Vehículos pesados | 9000 | 36000000 | 540 |
| 2025-12 | AWS | Bedrock (Claude 3) | 5100 | Autos verde | 30000 | 90000000 | 900 |
| 2025-12 | GCP | Vertex AI (Gemini Flash) | 5101 | Autos ligeros | 48000 | 144000000 | 432 |
| 2025-12 | GCP | Vertex AI (Gemini Pro) | 5102 | Vehículos pesados | 10000 | 40000000 | 600 |
| 2026-01 | AWS | Bedrock (Claude 3) | 5100 | Autos verde | 32000 | 96000000 | 960 |
| 2026-01 | GCP | Vertex AI (Gemini Flash) | 5101 | Autos ligeros | 50000 | 150000000 | 450 |
| 2026-01 | GCP | Vertex AI (Gemini Pro) | 5102 | Vehículos pesados | 11000 | 44000000 | 660 |
| 2026-06 | AWS | Bedrock (Claude 3) | 5100 | Autos verde | 45000 | 135000000 | 1350 |
| 2026-06 | GCP | Vertex AI (Gemini Flash) | 5101 | Autos ligeros | 65000 | 195000000 | 585 |
| 2026-06 | GCP | Vertex AI (Gemini Pro) | 5102 | Vehículos pesados | 15000 | 60000000 | 900 |

---

## Hoja 3: Otros Costos (SaaS)

| Mes | Proveedor | Concepto | Centro_Costos | Producto | Unidad | Cantidad | Costo_USD |
|-----|-----------|----------|---------------|----------|--------|----------|-----------|
| 2024-01 | Twilio | Notificaciones SMS/WhatsApp | 5100 | Autos verde | Mensajes | 12000 | 120 |
| 2024-01 | Twilio | Notificaciones SMS/WhatsApp | 5101 | Autos ligeros | Mensajes | 18000 | 180 |
| 2024-01 | Twilio | Notificaciones SMS/WhatsApp | 5102 | Vehículos pesados | Mensajes | 4000 | 40 |
| 2024-01 | Stripe | Pasarela de Pagos | 5100 | Autos verde | Transacciones | 500 | 450 |
| 2024-01 | Stripe | Pasarela de Pagos | 5101 | Autos ligeros | Transacciones | 350 | 315 |
| 2024-01 | Stripe | Pasarela de Pagos | 5102 | Vehículos pesados | Transacciones | 120 | 216 |
| 2024-01 | Datadog | Observabilidad | General | Compartido | GB Logs | 1 | 350 |
| 2024-01 | Cloudflare | WAF/DDoS | General | Compartido | Suscripción | 1 | 200 |
| 2024-01 | Mati/KYC | Validación Identidad | General | Compartido | Consultas | 970 | 485 |
| 2026-01 | Twilio | Notificaciones SMS/WhatsApp | 5100 | Autos verde | Mensajes | 21000 | 210 |
| 2026-01 | Twilio | Notificaciones SMS/WhatsApp | 5101 | Autos ligeros | Mensajes | 30000 | 300 |
| 2026-01 | Twilio | Notificaciones SMS/WhatsApp | 5102 | Vehículos pesados | Mensajes | 7000 | 70 |
| 2026-01 | Stripe | Pasarela de Pagos | 5100 | Autos verde | Transacciones | 800 | 720 |
| 2026-01 | Stripe | Pasarela de Pagos | 5101 | Autos ligeros | Transacciones | 500 | 450 |
| 2026-01 | Stripe | Pasarela de Pagos | 5102 | Vehículos pesados | Transacciones | 200 | 360 |
| 2026-01 | Datadog | Observabilidad | General | Compartido | GB Logs | 1 | 520 |
| 2026-01 | Cloudflare | WAF/DDoS | General | Compartido | Suscripción | 1 | 200 |
| 2026-01 | Mati/KYC | Validación Identidad | General | Compartido | Consultas | 1500 | 750 |
| 2026-06 | Twilio | Notificaciones SMS/WhatsApp | 5100 | Autos verde | Mensajes | 35000 | 350 |
| 2026-06 | Twilio | Notificaciones SMS/WhatsApp | 5101 | Autos ligeros | Mensajes | 55000 | 550 |
| 2026-06 | Twilio | Notificaciones SMS/WhatsApp | 5102 | Vehículos pesados | Mensajes | 10000 | 100 |
| 2026-06 | Stripe | Pasarela de Pagos | 5100 | Autos verde | Transacciones | 1500 | 1350 |
| 2026-06 | Stripe | Pasarela de Pagos | 5101 | Autos ligeros | Transacciones | 1000 | 900 |
| 2026-06 | Stripe | Pasarela de Pagos | 5102 | Vehículos pesados | Transacciones | 300 | 540 |
| 2026-06 | Datadog | Observabilidad | General | Compartido | GB Logs | 1 | 650 |
| 2026-06 | Cloudflare | WAF/DDoS | General | Compartido | Suscripción | 1 | 250 |
| 2026-06 | Mati/KYC | Validación Identidad | General | Compartido | Consultas | 2800 | 1400 |

> Nota: Los datos intermedios (2024-06, 2024-12, 2025-01, 2025-06, 2025-12) también están disponibles en el archivo original.

---

## Hoja 4: Pólizas Emitidas (para Unit Economics)

| Mes | Producto | Centro_Costos | Polizas_Emitidas | Primas_USD |
|-----|----------|---------------|-----------------|------------|
| 2026-01 | Autos verde | 5100 | 800 | 24000 |
| 2026-01 | Autos ligeros | 5101 | 500 | 15000 |
| 2026-01 | Vehiculos pesados | 5102 | 200 | 6000 |
| 2026-01 | Corporativo | General | 1500 | 45000 |
| 2026-06 | Autos verde | 5100 | 1500 | 45000 |
| 2026-06 | Autos ligeros | 5101 | 1000 | 30000 |
| 2026-06 | Vehiculos pesados | 5102 | 300 | 9000 |
| 2026-06 | Corporativo | General | 2800 | 84000 |
| 2026-12 | Autos verde | 5100 | 2100 | 63000 |
| 2026-12 | Autos ligeros | 5101 | 1400 | 42000 |
| 2026-12 | Vehiculos pesados | 5102 | 500 | 15000 |
| 2026-12 | Corporativo | General | 4000 | 120000 |

> Datos completos mes a mes disponibles en el archivo original (Ene-Dic 2026).

---

## Cálculos de Unit Economics (ejemplo Ene 2026)

| Producto | Costo AI | Pólizas | Costo por Póliza |
|----------|----------|---------|-----------------|
| Autos verde | $960 | 800 | $1.20/póliza |
| Autos ligeros | $450 | 500 | $0.90/póliza |
| Vehículos pesados | $660 | 200 | $3.30/póliza |

---

## Instrucciones para Sergio (Tarea 1.3)

1. Usar estos datos como base para el `seed.js`
2. Para los requisitos que necesitan OpenAI como tercer proveedor de IA, agregar datos mock adicionales
3. Los centros de costo mapean a "células/equipos" en el modelo showback
4. Los "Otros costos" mapean a categoría SaaS en la MegaBill
5. Las pólizas emitidas son las "transacciones de negocio" para unit economics
6. Referencia el archivo completo: `docs/data-seed-finops.md`
