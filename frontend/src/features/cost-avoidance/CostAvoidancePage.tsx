import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useCostAvoidance } from './hooks/useCostAvoidance';

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

/**
 * Cost Avoidance page — Req 9.
 * Report of costs avoided through proactive governance (shift-left).
 */
export default function CostAvoidancePage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const { data, isLoading, isError, refetch } = useCostAvoidance(month);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" /> Costos Evitados
        </h1>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="px-3 py-2 border rounded-md text-sm" />
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
          <div className="p-6 border rounded-lg bg-green-50 text-center">
            <p className="text-sm text-muted-foreground">Costo evitado acumulado del mes</p>
            <p className="text-3xl font-bold text-green-700">{formatUsd(data.totalSavings)}</p>
          </div>

          {data.actions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-3 px-2">Recurso</th>
                    <th className="py-3 px-2">Tipo de Acción</th>
                    <th className="py-3 px-2">Fecha</th>
                    <th className="py-3 px-2 text-right">Ahorro Estimado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.actions.map((action) => (
                    <tr key={action.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">{action.resource}</td>
                      <td className="py-3 px-2">{action.actionType}</td>
                      <td className="py-3 px-2">{new Date(action.date).toLocaleDateString()}</td>
                      <td className="py-3 px-2 text-right text-green-600 font-medium">{formatUsd(action.estimatedSavingsUsd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No hay acciones preventivas registradas para este mes.
            </p>
          )}
        </>
      )}
    </div>
  );
}
