import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { SpendBreakdown } from './components/SpendBreakdown';
import { ConsumptionMetrics } from './components/ConsumptionMetrics';

type GroupBy = 'service' | 'team' | 'provider';

const MOCK_DATA = {
  service: {
    totalCost: 7905,
    breakdown: [
      { name: 'Bedrock (Claude 3) — AWS', costUsd: 2310, percentage: 29.2, tokens: 231000000, inferences: 77000, gpuHours: 23.1, groupBy: 'service' as const },
      { name: 'Vertex AI (Gemini Flash) — GCP', costUsd: 1035, percentage: 13.1, tokens: 345000000, inferences: 115000, gpuHours: 10.4, groupBy: 'service' as const },
      { name: 'Vertex AI (Gemini Pro) — GCP', costUsd: 1560, percentage: 19.7, tokens: 104000000, inferences: 26000, gpuHours: 15.6, groupBy: 'service' as const },
      { name: 'GPT-4 (OpenAI)', costUsd: 1800, percentage: 22.8, tokens: 180000000, inferences: 45000, gpuHours: 18.0, groupBy: 'service' as const },
      { name: 'DALL-E 3 (OpenAI)', costUsd: 700, percentage: 8.9, tokens: 0, inferences: 15000, gpuHours: 30.0, groupBy: 'service' as const },
      { name: 'Haiku (Anthropic)', costUsd: 500, percentage: 6.3, tokens: 90000000, inferences: 90000, gpuHours: 3.0, groupBy: 'service' as const },
    ],
  },
  team: {
    totalCost: 7905,
    breakdown: [
      { name: 'Célula Auto Express', costUsd: 3200, percentage: 40.5, tokens: 320000000, inferences: 106000, gpuHours: 32.0, groupBy: 'team' as const },
      { name: 'Célula Vida Digital', costUsd: 2100, percentage: 26.6, tokens: 210000000, inferences: 70000, gpuHours: 21.0, groupBy: 'team' as const },
      { name: 'Célula Siniestros AI', costUsd: 1505, percentage: 19.0, tokens: 150000000, inferences: 50000, gpuHours: 15.0, groupBy: 'team' as const },
      { name: 'Célula Atención Cliente', costUsd: 700, percentage: 8.9, tokens: 90000000, inferences: 90000, gpuHours: 7.0, groupBy: 'team' as const },
      { name: 'Célula Core Bancario', costUsd: 400, percentage: 5.1, tokens: 40000000, inferences: 10000, gpuHours: 4.0, groupBy: 'team' as const },
    ],
  },
  provider: {
    totalCost: 7905,
    breakdown: [
      { name: 'AWS Bedrock', costUsd: 2310, percentage: 29.2, tokens: 231000000, inferences: 77000, gpuHours: 23.1, groupBy: 'provider' as const },
      { name: 'GCP Vertex AI', costUsd: 2595, percentage: 32.8, tokens: 449000000, inferences: 141000, gpuHours: 26.0, groupBy: 'provider' as const },
      { name: 'OpenAI', costUsd: 2500, percentage: 31.6, tokens: 180000000, inferences: 60000, gpuHours: 48.0, groupBy: 'provider' as const },
      { name: 'Anthropic', costUsd: 500, percentage: 6.3, tokens: 90000000, inferences: 90000, gpuHours: 3.0, groupBy: 'provider' as const },
    ],
  },
};

/**
 * AI Spend dashboard page — Req 1.
 * Shows accumulated AI costs with filters, breakdown, and consumption metrics.
 */
export default function AISpendPage() {
  const [groupBy, setGroupBy] = useState<GroupBy>('service');

  const data = MOCK_DATA[groupBy];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold">Gasto Acumulado de IA</h1>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 border rounded-lg bg-card">
        <div>
          <label className="text-xs text-muted-foreground">Período</label>
          <select className="w-full mt-1 px-3 py-2 border rounded-md text-sm">
            <option value="2026-06">Junio 2026</option>
            <option value="2026-05">Mayo 2026</option>
            <option value="2026-04">Abril 2026</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Proveedor</label>
          <select className="w-full mt-1 px-3 py-2 border rounded-md text-sm">
            <option value="">Todos</option>
            <option value="AWS Bedrock">AWS Bedrock</option>
            <option value="GCP">GCP Vertex AI</option>
            <option value="OpenAI">OpenAI</option>
            <option value="Anthropic">Anthropic</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Agrupar por</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
          >
            <option value="service">Servicio</option>
            <option value="team">Equipo</option>
            <option value="provider">Proveedor</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <SpendBreakdown items={data.breakdown} totalCost={data.totalCost} />
        <ConsumptionMetrics items={data.breakdown} />
      </div>
    </div>
  );
}
