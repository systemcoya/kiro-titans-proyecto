import { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart, ResponsiveContainer, Legend } from 'recharts';

const SERVICES = [
  { id: 'amazon-titan', name: 'Amazon Titan', baseCost: 1350 },
  { id: 'claude-bedrock', name: 'Claude (Bedrock)', baseCost: 2160 },
  { id: 'gpt-4', name: 'GPT-4', baseCost: 2850 },
  { id: 'dall-e-3', name: 'DALL-E 3', baseCost: 1140 },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', baseCost: 2550 },
  { id: 'haiku', name: 'Haiku', baseCost: 660 },
];

function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

/**
 * What-If Simulator page — Req 6.
 * Projects costs at 1, 3, 6 months with optimistic/base/pessimistic scenarios.
 */
export default function SimulatorPage() {
  const [serviceId, setServiceId] = useState(SERVICES[0].id);
  const [increment, setIncrement] = useState('50');
  const [simulated, setSimulated] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  const handleSimulate = () => {
    const pct = parseInt(increment, 10);
    const service = SERVICES.find((s) => s.id === serviceId);
    if (!service) return;

    const baseCost = service.baseCost;
    const monthlyGrowth = pct / 100;

    const data = [
      { month: 'Actual', optimista: baseCost, base: baseCost, pesimista: baseCost },
      {
        month: '+1 mes',
        optimista: Math.round(baseCost * (1 + monthlyGrowth * 0.7)),
        base: Math.round(baseCost * (1 + monthlyGrowth)),
        pesimista: Math.round(baseCost * (1 + monthlyGrowth * 1.3)),
      },
      {
        month: '+3 meses',
        optimista: Math.round(baseCost * Math.pow(1 + monthlyGrowth * 0.7, 3)),
        base: Math.round(baseCost * Math.pow(1 + monthlyGrowth, 3)),
        pesimista: Math.round(baseCost * Math.pow(1 + monthlyGrowth * 1.3, 3)),
      },
      {
        month: '+6 meses',
        optimista: Math.round(baseCost * Math.pow(1 + monthlyGrowth * 0.7, 6)),
        base: Math.round(baseCost * Math.pow(1 + monthlyGrowth, 6)),
        pesimista: Math.round(baseCost * Math.pow(1 + monthlyGrowth * 1.3, 6)),
      },
    ];

    setChartData(data);
    setSimulated(true);
  };

  const service = SERVICES.find((s) => s.id === serviceId);
  const lastPoint = chartData.length > 0 ? chartData[chartData.length - 1] : null;

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
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
        >
          Simular
        </button>
      </div>

      {/* Chart */}
      {simulated && chartData.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Proyección de Costos — {service?.name}</h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `$${v.toLocaleString()}`} />
              <Tooltip formatter={(v: number) => formatUsd(v)} />
              <Legend />
              <Area type="monotone" dataKey="pesimista" name="Pesimista" stroke="#ef4444" fill="#fecaca" fillOpacity={0.3} />
              <Area type="monotone" dataKey="base" name="Base" stroke="#6366f1" fill="#c7d2fe" fillOpacity={0.3} />
              <Area type="monotone" dataKey="optimista" name="Optimista" stroke="#22c55e" fill="#bbf7d0" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Insights */}
      {simulated && lastPoint && (
        <div className="border rounded-xl p-5 bg-card shadow-sm space-y-4">
          <h3 className="text-lg font-semibold">💡 Insights de la Simulación</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-green-50 border-green-200 text-center">
              <p className="text-xs text-muted-foreground">Escenario Optimista (+6m)</p>
              <p className="text-xl font-bold text-green-700">{formatUsd(lastPoint.optimista)}</p>
              <p className="text-xs mt-1">+{((lastPoint.optimista / (service?.baseCost || 1) - 1) * 100).toFixed(0)}% vs actual</p>
            </div>
            <div className="p-4 border rounded-lg bg-blue-50 border-blue-200 text-center">
              <p className="text-xs text-muted-foreground">Escenario Base (+6m)</p>
              <p className="text-xl font-bold text-blue-700">{formatUsd(lastPoint.base)}</p>
              <p className="text-xs mt-1">+{((lastPoint.base / (service?.baseCost || 1) - 1) * 100).toFixed(0)}% vs actual</p>
            </div>
            <div className="p-4 border rounded-lg bg-red-50 border-red-200 text-center">
              <p className="text-xs text-muted-foreground">Escenario Pesimista (+6m)</p>
              <p className="text-xl font-bold text-red-700">{formatUsd(lastPoint.pesimista)}</p>
              <p className="text-xs mt-1">+{((lastPoint.pesimista / (service?.baseCost || 1) - 1) * 100).toFixed(0)}% vs actual</p>
            </div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
            <p><strong>📊 Resumen:</strong> Con un incremento de uso del <strong>{increment}%</strong> mensual en <strong>{service?.name}</strong>:</p>
            <p>• El costo actual de <strong>{formatUsd(service?.baseCost || 0)}/mes</strong> podría llegar a <strong>{formatUsd(lastPoint.base)}/mes</strong> en 6 meses (escenario base).</p>
            <p>• El incremento acumulado total sería de <strong>{formatUsd(lastPoint.base - (service?.baseCost || 0))}</strong> adicionales por mes.</p>
            {lastPoint.pesimista > (service?.baseCost || 0) * 3 && (
              <p className="text-red-600">⚠️ <strong>Alerta:</strong> En el escenario pesimista, el costo se triplicaría. Considere negociar committed use discounts o implementar rate limiting.</p>
            )}
            {parseInt(increment) <= 30 && (
              <p className="text-green-600">✅ El incremento es moderado. Los costos se mantienen controlables con las políticas actuales.</p>
            )}
            {parseInt(increment) > 100 && (
              <p className="text-yellow-600">⚡ <strong>Recomendación:</strong> Con +{increment}% de incremento, evalúe migrar a modelos más eficientes (ej: Haiku en lugar de Claude 3) o implementar caching de respuestas.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
