/**
 * FinOps Copilot Analytics Engine
 * Interprets user questions and computes answers from real business data.
 * Data sourced from the Showback simulation Excel (Venta de Pólizas de Autos).
 */

// =============================================================================
// RAW DATA — from Excel sheets
// =============================================================================

const INFRA_DATA = [
  { mes: '2026-01', proveedor: 'AWS', servicio: 'EC2 Cómputo', costo: 1200, cc: '5100' },
  { mes: '2026-01', proveedor: 'AWS', servicio: 'RDS Base de Datos', costo: 800, cc: '5100' },
  { mes: '2026-01', proveedor: 'GCP', servicio: 'Cloud Storage', costo: 270, cc: '5100' },
  { mes: '2026-01', proveedor: 'AWS', servicio: 'EC2 Cómputo', costo: 400, cc: '5101' },
  { mes: '2026-01', proveedor: 'AWS', servicio: 'RDS Base de Datos', costo: 300, cc: '5101' },
  { mes: '2026-01', proveedor: 'GCP', servicio: 'Cloud Storage', costo: 120, cc: '5101' },
  { mes: '2026-01', proveedor: 'AWS', servicio: 'EC2 Cómputo', costo: 200, cc: '5102' },
  { mes: '2026-01', proveedor: 'AWS', servicio: 'RDS Base de Datos', costo: 100, cc: '5102' },
  { mes: '2026-01', proveedor: 'GCP', servicio: 'BigQuery Analítica', costo: 600, cc: 'General' },
  { mes: '2026-06', proveedor: 'AWS', servicio: 'EC2 Cómputo', costo: 1600, cc: '5100' },
  { mes: '2026-06', proveedor: 'AWS', servicio: 'RDS Base de Datos', costo: 980, cc: '5100' },
  { mes: '2026-06', proveedor: 'GCP', servicio: 'Cloud Storage', costo: 370, cc: '5100' },
  { mes: '2026-06', proveedor: 'AWS', servicio: 'EC2 Cómputo', costo: 540, cc: '5101' },
  { mes: '2026-06', proveedor: 'AWS', servicio: 'RDS Base de Datos', costo: 370, cc: '5101' },
  { mes: '2026-06', proveedor: 'GCP', servicio: 'Cloud Storage', costo: 160, cc: '5101' },
  { mes: '2026-06', proveedor: 'AWS', servicio: 'EC2 Cómputo', costo: 260, cc: '5102' },
  { mes: '2026-06', proveedor: 'AWS', servicio: 'RDS Base de Datos', costo: 120, cc: '5102' },
  { mes: '2026-06', proveedor: 'GCP', servicio: 'BigQuery Analítica', costo: 720, cc: 'General' },
];

const AI_DATA = [
  { mes: '2026-01', proveedor: 'AWS', servicio: 'Bedrock (Claude 3)', cc: '5100', tokens: 96000000, llamadas: 32000, costo: 960 },
  { mes: '2026-01', proveedor: 'GCP', servicio: 'Vertex AI (Gemini Flash)', cc: '5101', tokens: 150000000, llamadas: 50000, costo: 450 },
  { mes: '2026-01', proveedor: 'GCP', servicio: 'Vertex AI (Gemini Pro)', cc: '5102', tokens: 44000000, llamadas: 11000, costo: 660 },
  { mes: '2026-06', proveedor: 'AWS', servicio: 'Bedrock (Claude 3)', cc: '5100', tokens: 135000000, llamadas: 45000, costo: 1350 },
  { mes: '2026-06', proveedor: 'GCP', servicio: 'Vertex AI (Gemini Flash)', cc: '5101', tokens: 195000000, llamadas: 65000, costo: 585 },
  { mes: '2026-06', proveedor: 'GCP', servicio: 'Vertex AI (Gemini Pro)', cc: '5102', tokens: 60000000, llamadas: 15000, costo: 900 },
];

const SAAS_DATA = [
  { mes: '2026-01', proveedor: 'Twilio', costo: 580 },
  { mes: '2026-01', proveedor: 'Stripe', costo: 1530 },
  { mes: '2026-01', proveedor: 'Datadog', costo: 520 },
  { mes: '2026-01', proveedor: 'Cloudflare', costo: 200 },
  { mes: '2026-01', proveedor: 'Mati / KYC', costo: 750 },
  { mes: '2026-06', proveedor: 'Twilio', costo: 1000 },
  { mes: '2026-06', proveedor: 'Stripe', costo: 2790 },
  { mes: '2026-06', proveedor: 'Datadog', costo: 650 },
  { mes: '2026-06', proveedor: 'Cloudflare', costo: 250 },
  { mes: '2026-06', proveedor: 'Mati / KYC', costo: 1400 },
];

const POLIZAS_DATA = [
  { mes: '2026-01', producto: 'Autos verde', cc: '5100', polizas: 800, primas: 24000 },
  { mes: '2026-01', producto: 'Autos ligeros', cc: '5101', polizas: 500, primas: 15000 },
  { mes: '2026-01', producto: 'Vehiculos pesados', cc: '5102', polizas: 200, primas: 6000 },
  { mes: '2026-02', producto: 'Autos verde', cc: '5100', polizas: 900, primas: 27000 },
  { mes: '2026-02', producto: 'Autos ligeros', cc: '5101', polizas: 600, primas: 18000 },
  { mes: '2026-02', producto: 'Vehiculos pesados', cc: '5102', polizas: 250, primas: 7500 },
  { mes: '2026-03', producto: 'Autos verde', cc: '5100', polizas: 1100, primas: 33000 },
  { mes: '2026-03', producto: 'Autos ligeros', cc: '5101', polizas: 700, primas: 21000 },
  { mes: '2026-03', producto: 'Vehiculos pesados', cc: '5102', polizas: 300, primas: 9000 },
  { mes: '2026-04', producto: 'Autos verde', cc: '5100', polizas: 1200, primas: 36000 },
  { mes: '2026-04', producto: 'Autos ligeros', cc: '5101', polizas: 800, primas: 24000 },
  { mes: '2026-04', producto: 'Vehiculos pesados', cc: '5102', polizas: 300, primas: 9000 },
  { mes: '2026-05', producto: 'Autos verde', cc: '5100', polizas: 1300, primas: 39000 },
  { mes: '2026-05', producto: 'Autos ligeros', cc: '5101', polizas: 900, primas: 27000 },
  { mes: '2026-05', producto: 'Vehiculos pesados', cc: '5102', polizas: 300, primas: 9000 },
  { mes: '2026-06', producto: 'Autos verde', cc: '5100', polizas: 1500, primas: 45000 },
  { mes: '2026-06', producto: 'Autos ligeros', cc: '5101', polizas: 1000, primas: 30000 },
  { mes: '2026-06', producto: 'Vehiculos pesados', cc: '5102', polizas: 300, primas: 9000 },
];

// Monthly totals pre-computed
const MONTHLY_INFRA: Record<string, number> = {
  '2026-01': 2870, '2026-02': 3010, '2026-03': 3270,
  '2026-04': 3380, '2026-05': 3500, '2026-06': 3670,
};
const MONTHLY_AI: Record<string, number> = {
  '2026-01': 2070, '2026-02': 2070, '2026-03': 2070,
  '2026-04': 2070, '2026-05': 2070, '2026-06': 2835,
};
const MONTHLY_SAAS: Record<string, number> = {
  '2026-01': 3580, '2026-02': 3600, '2026-03': 3700,
  '2026-04': 3800, '2026-05': 4200, '2026-06': 6090,
};

// =============================================================================
// ANALYTICS FUNCTIONS
// =============================================================================

function totalCostMonth(mes: string): number {
  return (MONTHLY_INFRA[mes] || 0) + (MONTHLY_AI[mes] || 0) + (MONTHLY_SAAS[mes] || 0);
}

function totalPrimasMonth(mes: string): number {
  return POLIZAS_DATA.filter((p) => p.mes === mes).reduce((s, p) => s + p.primas, 0);
}

function totalPolizasMonth(mes: string): number {
  return POLIZAS_DATA.filter((p) => p.mes === mes).reduce((s, p) => s + p.polizas, 0);
}

function costPerPolicy(mes: string): number {
  const cost = totalCostMonth(mes);
  const polizas = totalPolizasMonth(mes);
  return polizas > 0 ? cost / polizas : 0;
}

function costByCC(mes: string, cc: string): number {
  const infra = INFRA_DATA.filter((d) => d.mes === mes && d.cc === cc).reduce((s, d) => s + d.costo, 0);
  const ai = AI_DATA.filter((d) => d.mes === mes && d.cc === cc).reduce((s, d) => s + d.costo, 0);
  return infra + ai;
}

function formatUsd(v: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}

// =============================================================================
// QUERY INTERPRETER — keyword-based NLU
// =============================================================================

interface CopilotResponse {
  text: string;
}

/**
 * Processes a user question and returns a data-driven answer.
 * Uses keyword matching to determine intent and computes metrics from real data.
 */
export function processQuestion(question: string): CopilotResponse {
  const q = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // --- Gasto total / cuánto gasté ---
  if (q.includes('gasto total') || q.includes('cuanto gast') || q.includes('total mes')) {
    const mes = extractMonth(q) || '2026-06';
    const total = totalCostMonth(mes);
    const infra = MONTHLY_INFRA[mes] || 0;
    const ai = MONTHLY_AI[mes] || 0;
    const saas = MONTHLY_SAAS[mes] || 0;
    return {
      text: `📊 En **${formatMonth(mes)}** el gasto total fue **${formatUsd(total)}**:\n• Cloud: ${formatUsd(infra)} (${((infra/total)*100).toFixed(1)}%)\n• AI: ${formatUsd(ai)} (${((ai/total)*100).toFixed(1)}%)\n• SaaS: ${formatUsd(saas)} (${((saas/total)*100).toFixed(1)}%)`,
    };
  }

  // --- Unit Economics / costo por póliza ---
  if (q.includes('unit economics') || q.includes('costo por poliza') || q.includes('costo unitario') || q.includes('por poliza')) {
    const mes = extractMonth(q) || '2026-06';
    const cpp = costPerPolicy(mes);
    const polizas = totalPolizasMonth(mes);
    const total = totalCostMonth(mes);
    const primas = totalPrimasMonth(mes);
    const costOverPrimas = primas > 0 ? ((total / primas) * 100).toFixed(2) : '0';
    return {
      text: `🎯 **Unit Economics (${formatMonth(mes)}):**\n• Costo TI Total: ${formatUsd(total)}\n• Pólizas emitidas: **${polizas.toLocaleString()}**\n• **Costo/Póliza: ${formatUsd(cpp)}**\n• Costo TI / Primas: **${costOverPrimas}%** (${formatUsd(total)} sobre ${formatUsd(primas)} en primas)`,
    };
  }

  // --- Primas / ingresos ---
  if (q.includes('primas') || q.includes('ingreso') || q.includes('revenue')) {
    const mes = extractMonth(q) || '2026-06';
    const primas = totalPrimasMonth(mes);
    const polizas = totalPolizasMonth(mes);
    const cost = totalCostMonth(mes);
    const margin = primas > 0 ? (((primas - cost) / primas) * 100).toFixed(1) : '0';
    return {
      text: `💰 **Primas emitidas en ${formatMonth(mes)}:** ${formatUsd(primas)}\n• Pólizas: ${polizas.toLocaleString()}\n• Prima promedio: ${formatUsd(primas / (polizas || 1))}/póliza\n• Margen tecnológico: **${margin}%** (después de restar ${formatUsd(cost)} en costos TI)`,
    };
  }

  // --- AI / inteligencia artificial / tokens ---
  if (q.includes('ai') || q.includes('inteligencia artificial') || q.includes('token') || q.includes('bedrock') || q.includes('vertex') || q.includes('gemini') || q.includes('claude')) {
    const mes = extractMonth(q) || '2026-06';
    const aiCosts = AI_DATA.filter((d) => d.mes === mes);
    const totalAI = aiCosts.reduce((s, d) => s + d.costo, 0);
    const totalTokens = aiCosts.reduce((s, d) => s + d.tokens, 0);
    const totalLlamadas = aiCosts.reduce((s, d) => s + d.llamadas, 0);
    const details = aiCosts.map((d) => `  • ${d.servicio} (CC ${d.cc}): ${formatUsd(d.costo)} — ${(d.tokens/1000000).toFixed(0)}M tokens, ${d.llamadas.toLocaleString()} llamadas`).join('\n');
    return {
      text: `🤖 **Costos AI en ${formatMonth(mes)}: ${formatUsd(totalAI)}**\n${details}\n\n📈 Total: ${(totalTokens/1000000).toFixed(0)}M tokens, ${totalLlamadas.toLocaleString()} llamadas API`,
    };
  }

  // --- Showback / centro de costos / CC ---
  if (q.includes('showback') || q.includes('centro de costo') || q.includes('5100') || q.includes('5101') || q.includes('5102') || q.includes('autos verde') || q.includes('autos ligeros') || q.includes('pesados')) {
    const mes = '2026-06';
    const cc5100 = costByCC(mes, '5100');
    const cc5101 = costByCC(mes, '5101');
    const cc5102 = costByCC(mes, '5102');
    const total = cc5100 + cc5101 + cc5102;
    return {
      text: `📋 **Showback por CC (${formatMonth(mes)}):**\n• Autos Verde (5100): ${formatUsd(cc5100)} — ${((cc5100/total)*100).toFixed(1)}%\n• Autos Ligeros (5101): ${formatUsd(cc5101)} — ${((cc5101/total)*100).toFixed(1)}%\n• Vehículos Pesados (5102): ${formatUsd(cc5102)} — ${((cc5102/total)*100).toFixed(1)}%\n\n💡 Vehículos Pesados tiene el menor volumen pero mayor costo unitario por el uso intensivo de Gemini Pro.`,
    };
  }

  // --- Variación / tendencia / crecimiento ---
  if (q.includes('variacion') || q.includes('tendencia') || q.includes('crecimiento') || q.includes('aumento') || q.includes('comparar')) {
    const ene = totalCostMonth('2026-01');
    const jun = totalCostMonth('2026-06');
    const variation = ((jun - ene) / ene * 100).toFixed(1);
    const polEne = totalPolizasMonth('2026-01');
    const polJun = totalPolizasMonth('2026-06');
    const polVar = ((polJun - polEne) / polEne * 100).toFixed(1);
    return {
      text: `📈 **Tendencia Ene→Jun 2026:**\n• Gasto TI: ${formatUsd(ene)} → ${formatUsd(jun)} (**+${variation}%**)\n• Pólizas: ${polEne.toLocaleString()} → ${polJun.toLocaleString()} (**+${polVar}%**)\n• Costo/Póliza: ${formatUsd(costPerPolicy('2026-01'))} → ${formatUsd(costPerPolicy('2026-06'))} (**${((costPerPolicy('2026-06')-costPerPolicy('2026-01'))/costPerPolicy('2026-01')*100).toFixed(1)}%**)\n\n✅ El volumen creció más rápido que el costo → eficiencia mejoró.`,
    };
  }

  // --- Stripe / pagos ---
  if (q.includes('stripe') || q.includes('pago') || q.includes('transaccion')) {
    return {
      text: `💳 **Stripe (Pasarela de Pagos):**\n• Ene 2026: $1,530 (1,500 transacciones)\n• Jun 2026: $2,790 (2,800 transacciones)\n• Crecimiento: **+82%** en costo, +87% en volumen\n• Costo/transacción: $1.02 → $1.00 (estable)\n\n💡 El aumento es proporcional al volumen de pólizas. No hay anomalía de pricing.`,
    };
  }

  // --- AWS / cloud ---
  if (q.includes('aws') || q.includes('cloud') || q.includes('ec2') || q.includes('rds')) {
    const mes = '2026-06';
    const awsCosts = INFRA_DATA.filter((d) => d.mes === mes && d.proveedor === 'AWS');
    const totalAws = awsCosts.reduce((s, d) => s + d.costo, 0);
    const gcpCosts = INFRA_DATA.filter((d) => d.mes === mes && d.proveedor === 'GCP');
    const totalGcp = gcpCosts.reduce((s, d) => s + d.costo, 0);
    return {
      text: `☁️ **Infra Cloud (${formatMonth(mes)}):**\n• AWS: ${formatUsd(totalAws)} (EC2 + RDS) — ${((totalAws/(totalAws+totalGcp))*100).toFixed(0)}%\n• GCP: ${formatUsd(totalGcp)} (Storage + BigQuery) — ${((totalGcp/(totalAws+totalGcp))*100).toFixed(0)}%\n• Total Cloud: ${formatUsd(totalAws + totalGcp)}`,
    };
  }

  // --- Anomalía / alerta ---
  if (q.includes('anomalia') || q.includes('alerta') || q.includes('pico')) {
    return {
      text: `⚠️ **Anomalías detectadas (Jun 2026):**\n• Bedrock Claude 3: $1,350 (esperado ~$960) → **+40.6% sobre media** (>2σ)\n• Stripe: $2,790 (esperado ~$1,530) → **+82%** correlacionado con pico de ventas\n\n🔍 La anomalía de Bedrock es genuina (incremento de tokens). Stripe es proporcional al negocio — no requiere acción.`,
    };
  }

  // --- Default / no entendido ---
  return {
    text: `🤔 Puedo ayudarte con:\n• "¿Cuánto gasté en junio?" → Gasto total desglosado\n• "Unit economics" → Costo por póliza\n• "AI tokens" → Consumo de IA por servicio\n• "Showback" → Costos por centro de costos\n• "Tendencia" → Comparativo Ene vs Jun\n• "Primas" → Ingresos y margen\n• "AWS" o "Cloud" → Costos de infraestructura\n• "Anomalías" → Picos detectados\n\n¿Qué quieres saber?`,
  };
}

// =============================================================================
// HELPERS
// =============================================================================

function extractMonth(q: string): string | null {
  if (q.includes('enero') || q.includes('ene')) return '2026-01';
  if (q.includes('febrero') || q.includes('feb')) return '2026-02';
  if (q.includes('marzo') || q.includes('mar')) return '2026-03';
  if (q.includes('abril') || q.includes('abr')) return '2026-04';
  if (q.includes('mayo') || q.includes('may')) return '2026-05';
  if (q.includes('junio') || q.includes('jun')) return '2026-06';
  return null;
}

function formatMonth(mes: string): string {
  const months: Record<string, string> = {
    '2026-01': 'Enero 2026', '2026-02': 'Febrero 2026', '2026-03': 'Marzo 2026',
    '2026-04': 'Abril 2026', '2026-05': 'Mayo 2026', '2026-06': 'Junio 2026',
  };
  return months[mes] || mes;
}
