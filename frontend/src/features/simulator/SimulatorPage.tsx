import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart, ResponsiveContainer, Legend } from 'recharts';
import { useSimulation } from './hooks/useSimulator';

const SERVICES = [
  { id: 'amazon-titan', name: 'Amazon Titan' },
  { id: 'claude-bedrock', name: 'Claude (Bedrock)' },
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'dall-e-3', name: 'DALL-E 3' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'haiku', name: 'Haiku' },
];

/**
 * What-If Simulator page — Req 6.
 * Projects costs at 1, 3, 6 months with optimistic/base/pessimistic scenarios.
 */
export default function SimulatorPage() {
  const [serviceId, setServiceId] = useState(SERVICES[0].id);
  const [increment, setIncrement] = useState('50');
  const [error, setError] = useState('');

  const simulation = useSimulation();

  const handleSimulate = () => {
    const pct = parseInt(increment, 10);
    if (isNaN(pct) || pct < 1 || pct > 500) {
      setError('El porcentaje debe ser un entero entre 1 y 500');
      return;
    }
    setError('');
    simulation.mutate({ serviceId, incrementPercentage: pct });
  };

  const chartData = simulation.data?.projections.map((p) => ({
    month: `+${p.month}m`,
    optimista: p.optimistic,
    base: p.base,
    pesimista: p.pessimistic,
  })) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Simulador What-If</h1>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4 p-4 border rounded-lg bg-card">
        <div>
          <label className="text-xs text-muted-foreground">Servicio</label>
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md text-sm">
            {SERVICES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Incremento de uso (%)</label>
          <input
            type="range"
            min="1"
            max="500"
            value={increment}
            onChange={(e) => setIncrement(e.target.value)}
            className="w-full mt-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>1%</span>
            <span className="font-bold text-foreground">{increment}%</span>
            <span>500%</span>
          </div>
        </div>
        <button
          onClick={handleSimulate}
          disabled={simulation.isPending}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
        >
          {simulation.isPending ? 'Calculando...' : 'Simular'}
        </button>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {/* Chart */}
      {simulation.data && chartData.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Proyección de Costos</h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `$${v.toLocaleString()}`} />
              <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
              <Legend />
              <Area type="monotone" dataKey="pesimista" stroke="#ef4444" fill="#fecaca" fillOpacity={0.3} />
              <Area type="monotone" dataKey="base" stroke="#6366f1" fill="#c7d2fe" fillOpacity={0.3} />
              <Area type="monotone" dataKey="optimista" stroke="#22c55e" fill="#bbf7d0" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {simulation.isError && (
        <div className="text-center py-8">
          <p className="text-destructive">Error al ejecutar la simulación. Verifique que el servicio tenga al menos 3 meses de datos históricos.</p>
        </div>
      )}
    </div>
  );
}
