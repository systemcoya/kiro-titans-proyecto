import { useMemo } from 'react';
import { useSelfFunding } from './hooks/useSelfFunding';

/**
 * Self-Funding Page — Req 7.
 * AI Investment vs Savings from Google Sheets.
 */
export default function SelfFundingPage() {
  const { data, isLoading, isError, refetch } = useSelfFunding();

  const kpis = useMemo(() => {
    if (!data) return null;
    const totalAi = data.aiCosts.reduce((s, r) => s + r.costoAiUsd, 0);
    const totalInfra = data.infraCosts.reduce((s, r) => s + r.costoInfraUsd, 0);
    // Simulate savings as 30% of infra (optimization potential)
    const estimatedSavings = totalInfra * 0.30;
    const ratio = totalAi > 0 ? (estimatedSavings / totalAi) * 100 : 0;
    return { totalAi, totalInfra, estimatedSavings, ratio, isSelfFunded: ratio >= 100 };
  }, [data]);

  if (isLoading) return <div className="animate-pulse p-6"><div className="h-64 bg-gray-200 rounded" /></div>;
  if (isError) return <div className="text-center py-12"><p className="text-red-600">Error</p><button onClick={() => refetch()} className="mt-4 px-4 py-2 border rounded">Reintentar</button></div>;
  if (!kpis) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Self-Funding — AI vs Savings</h1>
      <p className="text-gray-500 text-sm">¿La AI se autofinancia con los ahorros que genera?</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-white shadow-sm border-l-4 border-l-purple-500">
          <p className="text-xs text-gray-500">Inversión AI</p>
          <p className="text-2xl font-bold">${kpis.totalAi.toLocaleString()} USD</p>
        </div>
        <div className="p-4 border rounded-lg bg-white shadow-sm border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Savings Estimados (30% infra)</p>
          <p className="text-2xl font-bold">${Math.round(kpis.estimatedSavings).toLocaleString()} USD</p>
        </div>
        <div className={`p-4 border rounded-lg bg-white shadow-sm border-l-4 ${kpis.isSelfFunded ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
          <p className="text-xs text-gray-500">Self-Funding Ratio</p>
          <p className="text-2xl font-bold">{kpis.ratio.toFixed(1)}%</p>
          <p className="text-xs">{kpis.isSelfFunded ? '✅ AI autofinanciada' : '⚠️ En progreso'}</p>
        </div>
      </div>

      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Progreso hacia autofinanciamiento</h2>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div className="bg-green-500 h-4 rounded-full transition-all" style={{width: `${Math.min(kpis.ratio, 100)}%`}} />
        </div>
        <p className="text-sm text-gray-500 mt-2">{kpis.ratio.toFixed(1)}% de la meta (100%)</p>
      </div>
    </div>
  );
}
