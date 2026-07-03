import { useState } from 'react';
import { AlertTriangle, Trophy } from 'lucide-react';
import { useShowback } from './hooks/useShowback';

/** Returns current month in YYYY-MM format. */
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/** Formats a number as USD currency. */
function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

/**
 * Showback/Chargeback page — Req 3.
 * Shows per-team cost breakdown with budget analysis and efficiency ranking.
 */
export default function ShowbackPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const { data, isLoading, isError, refetch } = useShowback(month);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold">Showback por Célula</h1>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        />
      </div>

      {isLoading && (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-8">
          <p className="text-destructive mb-3">Error al cargar datos</p>
          <button onClick={() => refetch()} className="px-4 py-2 border rounded-md text-sm hover:bg-muted">
            Reintentar
          </button>
        </div>
      )}

      {data && (
        <>
          {/* Main table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-3 px-2">Equipo</th>
                  <th className="py-3 px-2 text-right">Cloud</th>
                  <th className="py-3 px-2 text-right">IA</th>
                  <th className="py-3 px-2 text-right">SaaS</th>
                  <th className="py-3 px-2 text-right">Total</th>
                  <th className="py-3 px-2 text-right">% Presupuesto</th>
                </tr>
              </thead>
              <tbody>
                {data.teams.map((team) => (
                  <tr
                    key={team.teamName}
                    className={`border-b ${
                      team.overBudget ? 'bg-red-50 border-red-200' : 'hover:bg-muted/50'
                    }`}
                  >
                    <td className="py-3 px-2 font-medium flex items-center gap-2">
                      {team.overBudget && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      {team.teamName}
                    </td>
                    <td className="py-3 px-2 text-right">{formatUsd(team.cloudCost)}</td>
                    <td className="py-3 px-2 text-right">{formatUsd(team.aiCost)}</td>
                    <td className="py-3 px-2 text-right">{formatUsd(team.saasCost)}</td>
                    <td className="py-3 px-2 text-right font-semibold">{formatUsd(team.totalCost)}</td>
                    <td className="py-3 px-2 text-right">
                      {team.budgetPercentage !== null ? (
                        <span className={team.overBudget ? 'text-red-600 font-bold' : ''}>
                          {team.budgetPercentage.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Sin presupuesto</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Efficiency ranking */}
          {data.ranking.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Ranking de Eficiencia
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-3 px-2">#</th>
                      <th className="py-3 px-2">Equipo</th>
                      <th className="py-3 px-2 text-right">Ratio Costo/Presupuesto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ranking.map((team, index) => (
                      <tr key={team.teamName} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2 font-bold">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </td>
                        <td className="py-3 px-2">{team.teamName}</td>
                        <td className="py-3 px-2 text-right">{team.efficiencyRatio?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {data && data.teams.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No hay datos de showback para el mes seleccionado.
        </div>
      )}
    </div>
  );
}
