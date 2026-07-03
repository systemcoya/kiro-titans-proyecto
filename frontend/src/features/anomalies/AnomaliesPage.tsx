import { Activity, AlertCircle, AlertTriangle } from 'lucide-react';
import { useAnomalies } from './hooks/useAnomalies';

function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

/**
 * Anomalies page — Req 12.
 * Automatic detection of unusual spending spikes using statistical analysis.
 */
export default function AnomaliesPage() {
  const { data, isLoading, isError, refetch } = useAnomalies();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Activity className="h-6 w-6" /> Detección de Anomalías
      </h1>

      {isLoading && (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded" />)}
        </div>
      )}

      {isError && (
        <div className="text-center py-8">
          <p className="text-destructive mb-3">Error al cargar anomalías</p>
          <button onClick={() => refetch()} className="px-4 py-2 border rounded-md text-sm">Reintentar</button>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="space-y-4">
          {data.map((anomaly) => (
            <div
              key={anomaly.id}
              className={`p-4 border rounded-lg ${
                anomaly.severity === 'critical' ? 'border-red-300 bg-red-50' : 'border-yellow-300 bg-yellow-50'
              }`}
            >
              <div className="flex items-start gap-3">
                {anomaly.severity === 'critical'
                  ? <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  : <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                }
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-medium">{anomaly.serviceName}</p>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      anomaly.severity === 'critical' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {anomaly.severity}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Monto Actual</p>
                      <p className="font-medium">{formatUsd(anomaly.currentAmountUsd)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Esperado (media)</p>
                      <p className="font-medium">{formatUsd(anomaly.expectedAmountUsd)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Desviaciones</p>
                      <p className="font-medium">{anomaly.standardDeviations.toFixed(1)}σ</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Inicio del pico</p>
                      <p className="font-medium">{new Date(anomaly.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No se detectaron anomalías de gasto.</p>
          <p className="text-sm">El sistema monitorea desviaciones superiores a 2σ sobre la media de 28 días.</p>
        </div>
      )}
    </div>
  );
}
