import { useState } from 'react';
import { useUnitEconomics } from './hooks/useUnitEconomics';
import { Sparkline } from './components/Sparkline';
import { TrendIndicator } from './components/TrendIndicator';

type PeriodType = 'week' | 'month' | 'custom';

/** Formats a number as USD with specified decimal places. */
function formatUsd(value: number, decimals: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Unit Economics page — Req 2.
 * Shows cost per transaction for each AI business use case.
 */
export default function UnitEconomicsPage() {
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const params = periodType === 'custom'
    ? { startDate, endDate }
    : { period: periodType };

  const { data, isLoading, isError, refetch } = useUnitEconomics(params);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Unit Economics</h1>

      {/* Period selector */}
      <div className="flex flex-wrap items-end gap-3 p-4 border rounded-lg bg-card">
        <div className="flex gap-1">
          {(['week', 'month', 'custom'] as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodType(p)}
              className={`px-3 py-2 text-sm rounded-md ${
                periodType === p ? 'bg-primary text-primary-foreground' : 'border hover:bg-muted'
              }`}
            >
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Personalizado'}
            </button>
          ))}
        </div>
        {periodType === 'custom' && (
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            />
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="text-center py-8">
          <p className="text-destructive mb-3">Error al cargar datos</p>
          <button onClick={() => refetch()} className="px-4 py-2 border rounded-md text-sm hover:bg-muted">
            Reintentar
          </button>
        </div>
      )}

      {/* Data table */}
      {data && data.data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-3 px-2">Servicio / Caso de uso</th>
                <th className="py-3 px-2 text-right">Costo Total</th>
                <th className="py-3 px-2 text-right">Transacciones</th>
                <th className="py-3 px-2 text-right">Costo Unitario</th>
                <th className="py-3 px-2 text-center">Tendencia</th>
                <th className="py-3 px-2 text-center">Dirección</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((row) => (
                <tr key={`${row.serviceName}`} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-2 font-medium">{row.serviceName}</td>
                  <td className="py-3 px-2 text-right">{formatUsd(row.totalCostUsd, 2)}</td>
                  <td className="py-3 px-2 text-right">
                    {new Intl.NumberFormat('en-US').format(row.transactionsProcessed)}
                  </td>
                  <td className="py-3 px-2 text-right">
                    {row.unitCostUsd !== null
                      ? formatUsd(row.unitCostUsd, 4)
                      : <span className="text-muted-foreground">N/A</span>
                    }
                  </td>
                  <td className="py-3 px-2 flex justify-center">
                    {row.weeklyTrend.length > 0 && <Sparkline data={row.weeklyTrend} />}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {row.unitCostUsd !== null
                      ? <TrendIndicator direction={row.trendDirection} />
                      : null
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.data.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No hay datos de unit economics para el período seleccionado.
        </div>
      )}
    </div>
  );
}
