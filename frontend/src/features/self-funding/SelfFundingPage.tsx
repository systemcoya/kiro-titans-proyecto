import { useState } from 'react';
import { Award, TrendingUp } from 'lucide-react';
import { useSelfFunding } from './hooks/useSelfFunding';

const PERIODS = [
  { value: 'month', label: 'Último mes' },
  { value: '3months', label: 'Últimos 3 meses' },
  { value: '6months', label: 'Últimos 6 meses' },
  { value: 'year', label: 'Último año' },
  { value: 'total', label: 'Acumulado total' },
];

function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

/**
 * Self-Funding page — Req 8.
 * Compares AI investment vs. optimization savings to demonstrate ROI.
 */
export default function SelfFundingPage() {
  const [period, setPeriod] = useState('total');
  const { data, isLoading, isError, refetch } = useSelfFunding(period);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inversión IA vs. Ahorros</h1>

      {/* Period selector */}
      <div className="flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-3 py-2 text-sm rounded-md ${
              period === p.value ? 'bg-primary text-primary-foreground' : 'border hover:bg-muted'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {isLoading && <div className="animate-pulse h-48 bg-muted rounded" />}
      {isError && (
        <div className="text-center py-8">
          <p className="text-destructive mb-3">Error al cargar datos</p>
          <button onClick={() => refetch()} className="px-4 py-2 border rounded-md text-sm">Reintentar</button>
        </div>
      )}

      {data && (
        <>
          {/* Dual dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">Inversión en IA</p>
              <p className="text-3xl font-bold">{formatUsd(data.investmentUsd)}</p>
            </div>
            <div className="p-6 border rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">Ahorros por Optimización</p>
              <p className="text-3xl font-bold text-green-600">{formatUsd(data.savingsUsd)}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="p-6 border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <p className="font-medium">Ratio de Autofinanciamiento</p>
              <p className="text-lg font-bold">{data.selfFundingRatio.toFixed(2)}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  data.selfFundingRatio >= 100 ? 'bg-green-500' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(data.selfFundingRatio, 100)}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              IA autofinanciada al {data.selfFundingRatio.toFixed(0)}% (meta: 100%)
            </p>
          </div>

          {/* Badge for > 100% */}
          {data.selfFundingRatio > 100 && (
            <div className="flex items-center justify-center gap-2 p-4 bg-green-100 border border-green-300 rounded-lg">
              <Award className="h-6 w-6 text-green-600" />
              <span className="text-green-800 font-bold text-lg">
                IA completamente autofinanciada ({data.selfFundingRatio.toFixed(2)}%)
              </span>
            </div>
          )}

          {data.investmentUsd === 0 && (
            <p className="text-center text-muted-foreground">No hay inversión registrada para este período.</p>
          )}
        </>
      )}
    </div>
  );
}
