import { useState } from 'react';
import { AlertTriangle, Trophy } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useShowback } from './hooks/useShowback';

function getCurrentMonth(): string {
  return '2026-06';
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

const COLORS = ['#3b82f6', '#8b5cf6', '#f97316', '#10b981'];

// Hardcoded real data from Excel for immediate display while API loads
const REAL_DATA = {
  teams: [
    { teamName: 'Autos Verde (CC 5100)', cloudCost: 1500, aiCost: 1350, saasCost: 1960, totalCost: 4810, budget: 5000, budgetPercentage: 96.2, efficiencyRatio: 0.96, overBudget: false },
    { teamName: 'Autos Ligeros (CC 5101)', cloudCost: 1070, aiCost: 585, saasCost: 1990, totalCost: 3645, budget: 4000, budgetPercentage: 91.1, efficiencyRatio: 0.91, overBudget: false },
    { teamName: 'Vehículos Pesados (CC 5102)', cloudCost: 380, aiCost: 900, saasCost: 640, totalCost: 1920, budget: 1500, budgetPercentage: 128.0, efficiencyRatio: 1.28, overBudget: true },
    { teamName: 'Corporativo (General)', cloudCost: 720, aiCost: 0, saasCost: 2300, totalCost: 3020, budget: null, budgetPercentage: null, efficiencyRatio: null, overBudget: false },
  ],
  ranking: [
    { teamName: 'Autos Ligeros (CC 5101)', efficiencyRatio: 0.91 },
    { teamName: 'Autos Verde (CC 5100)', efficiencyRatio: 0.96 },
    { teamName: 'Vehículos Pesados (CC 5102)', efficiencyRatio: 1.28 },
  ],
};

/**
 * Showback page — HU-F03
 * Per-team cost breakdown with budget % and efficiency ranking.
 */
export default function ShowbackPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const { data: apiData, isLoading } = useShowback(month);
  const data = apiData || REAL_DATA;

  const pieData = data.teams.map((t) => ({ name: t.teamName, value: t.totalCost }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Showback por Centro de Costos</h1>
          <p className="text-sm text-muted-foreground">Aplicación: Venta de Pólizas de Autos</p>
        </div>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="px-3 py-2 border rounded-md text-sm" />
      </div>

      {/* Pie chart + summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border rounded-xl p-5 bg-card shadow-sm">
          <h3 className="font-semibold mb-3">Distribución por CC</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatUsd(v)} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 overflow-x-auto border rounded-xl p-5 bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-3 px-2">Centro de Costos</th>
                <th className="py-3 px-2 text-right">Cloud</th>
                <th className="py-3 px-2 text-right">AI</th>
                <th className="py-3 px-2 text-right">SaaS</th>
                <th className="py-3 px-2 text-right">Total</th>
                <th className="py-3 px-2 text-right">% Presupuesto</th>
              </tr>
            </thead>
            <tbody>
              {data.teams.map((team) => (
                <tr key={team.teamName} className={`border-b ${team.overBudget ? 'bg-red-50 border-red-200' : 'hover:bg-muted/50'}`}>
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
                      <span className={team.overBudget ? 'text-red-600 font-bold' : ''}>{team.budgetPercentage.toFixed(1)}%</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">Sin presupuesto</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ranking */}
      <div className="border rounded-xl p-5 bg-card shadow-sm">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
          <Trophy className="h-5 w-5 text-yellow-500" /> Ranking de Eficiencia
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {data.ranking.map((team, i) => (
            <div key={team.teamName} className={`p-4 border rounded-lg text-center ${i === 0 ? 'border-yellow-300 bg-yellow-50' : ''}`}>
              <p className="text-2xl mb-1">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</p>
              <p className="font-medium text-sm">{team.teamName}</p>
              <p className="text-lg font-bold mt-1">{team.efficiencyRatio?.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">ratio costo/presupuesto</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
