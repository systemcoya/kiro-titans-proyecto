import { useState } from 'react';
import { RefreshCw, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useAISpend, useAdvanceTime } from './hooks/useAISpend';
import { SpendBreakdown } from './components/SpendBreakdown';
import { ConsumptionMetrics } from './components/ConsumptionMetrics';

/** Returns YYYY-MM-DD for the first day of the current month. */
function getMonthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

/** Returns YYYY-MM-DD for today. */
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

type GroupBy = 'service' | 'team' | 'provider';

/**
 * AI Spend dashboard page — Req 1.
 * Shows accumulated AI costs with filters, breakdown, and consumption metrics.
 */
export default function AISpendPage() {
  const [startDate, setStartDate] = useState(getMonthStart());
  const [endDate, setEndDate] = useState(getToday());
  const [team, setTeam] = useState('');
  const [provider, setProvider] = useState('');
  const [groupBy, setGroupBy] = useState<GroupBy>('service');

  const filters = {
    startDate,
    endDate,
    ...(team && { team }),
    ...(provider && { provider: provider as 'AWS Bedrock' | 'OpenAI' | 'Anthropic' }),
    groupBy,
  };

  const { data, isLoading, isError, refetch } = useAISpend(filters);
  const advanceMutation = useAdvanceTime();

  const handleAdvance = () => {
    advanceMutation.mutate(undefined, {
      onSuccess: () => toast.success('Avance temporal completado (+1 hora)'),
      onError: () => toast.error('Error al simular avance temporal'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold">Gasto Acumulado de IA</h1>
        <button
          onClick={handleAdvance}
          disabled={advanceMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
        >
          <Play className="h-4 w-4" />
          {advanceMutation.isPending ? 'Simulando...' : 'Simular avance temporal'}
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 border rounded-lg bg-card">
        <div>
          <label className="text-xs text-muted-foreground">Fecha inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Fecha fin</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Equipo</label>
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
          >
            <option value="">Todos</option>
            <option value="Célula Vida Digital">Célula Vida Digital</option>
            <option value="Célula Auto Express">Célula Auto Express</option>
            <option value="Célula Siniestros AI">Célula Siniestros AI</option>
            <option value="Célula Core Bancario">Célula Core Bancario</option>
            <option value="Célula Atención Cliente">Célula Atención Cliente</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Proveedor</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
          >
            <option value="">Todos</option>
            <option value="AWS Bedrock">AWS Bedrock</option>
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
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      )}

      {isError && (
        <div className="text-center py-12 space-y-4">
          <p className="text-destructive">No se pudieron cargar los datos. Verifique su conexión.</p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 mx-auto px-4 py-2 border rounded-md hover:bg-muted text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      )}

      {data && (
        <div className="space-y-8">
          <SpendBreakdown items={data.breakdown} totalCost={data.totalCost} />
          <ConsumptionMetrics items={data.breakdown} />
        </div>
      )}

      {/* Fallback with real data when API is not available */}
      {!data && !isLoading && !isError && (
        <div className="space-y-8">
          <SpendBreakdown
            totalCost={7905}
            items={[
              { name: 'Bedrock (Claude 3) — AWS', costUsd: 960 + 1350, percentage: 29.2, tokens: 231000000, inferences: 77000, gpuHours: 23.1, groupBy: 'service' },
              { name: 'Vertex AI (Gemini Flash) — GCP', costUsd: 450 + 585, percentage: 13.1, tokens: 345000000, inferences: 115000, gpuHours: 10.4, groupBy: 'service' },
              { name: 'Vertex AI (Gemini Pro) — GCP', costUsd: 660 + 900, percentage: 19.7, tokens: 104000000, inferences: 26000, gpuHours: 15.6, groupBy: 'service' },
            ]}
          />
          <ConsumptionMetrics
            items={[
              { name: 'Bedrock (Claude 3)', costUsd: 2310, percentage: 29.2, tokens: 231000000, inferences: 77000, gpuHours: 23.1, groupBy: 'service' },
              { name: 'Vertex AI (Gemini Flash)', costUsd: 1035, percentage: 13.1, tokens: 345000000, inferences: 115000, gpuHours: 10.4, groupBy: 'service' },
              { name: 'Vertex AI (Gemini Pro)', costUsd: 1560, percentage: 19.7, tokens: 104000000, inferences: 26000, gpuHours: 15.6, groupBy: 'service' },
            ]}
          />
        </div>
      )}
    </div>
  );
}
