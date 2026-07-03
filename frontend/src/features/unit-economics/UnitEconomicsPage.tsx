import { useMemo } from 'react';
import { useUnitEconomics } from './hooks/useUnitEconomics';

/**
 * Unit Economics Page — Req 2.
 * Cost per policy emitted per product, with real Google Sheets data.
 */
export default function UnitEconomicsPage() {
  const { data, isLoading, isError, refetch } = useUnitEconomics();

  const grouped = useMemo(() => {
    if (!data?.data) return [];
    // Group by producto, show latest month first
    const map: Record<string, typeof data.data> = {};
    for (const row of data.data) {
      if (!map[row.producto]) map[row.producto] = [];
      map[row.producto].push(row);
    }
    return Object.entries(map).map(([producto, rows]) => ({
      producto,
      rows: rows.sort((a, b) => b.mes.localeCompare(a.mes)),
      avgCostPerPolicy: rows.reduce((s, r) => s + (r.costoPorPolizaUsd || 0), 0) / rows.filter(r => r.costoPorPolizaUsd !== null).length || 0,
      totalPolicies: rows.reduce((s, r) => s + r.polizasEmitidas, 0),
      totalCostUsd: rows.reduce((s, r) => s + r.totalCostAiUsd, 0),
    }));
  }, [data]);

  if (isLoading) return <div className="animate-pulse p-6"><div className="h-8 bg-gray-200 rounded w-1/3 mb-4" /><div className="h-64 bg-gray-200 rounded" /></div>;
  if (isError) return <div className="text-center py-12"><p className="text-red-600">Error cargando datos</p><button onClick={() => refetch()} className="mt-4 px-4 py-2 border rounded">Reintentar</button></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Unit Economics — Costo por Póliza</h1>
      <p className="text-gray-500 text-sm">Costo de AI por póliza emitida. Fuente: Google Sheets (datos reales)</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {grouped.map((g) => (
          <div key={g.producto} className="p-4 border rounded-lg bg-white shadow-sm">
            <p className="text-xs text-gray-500">{g.producto}</p>
            <p className="text-2xl font-bold text-blue-600">${g.avgCostPerPolicy.toFixed(2)} USD</p>
            <p className="text-sm text-gray-400">~${Math.round(g.avgCostPerPolicy * 4200).toLocaleString()} COP / póliza</p>
            <p className="text-xs text-gray-400 mt-1">{g.totalPolicies.toLocaleString()} pólizas | ${g.totalCostUsd.toLocaleString()} USD total</p>
          </div>
        ))}
      </div>

      {/* Detail Table */}
      <div className="border rounded-lg bg-white shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3">Detalle mensual ({data?.count || 0} registros)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2">Mes</th>
                <th className="py-2">Producto</th>
                <th className="py-2 text-right">Costo AI (USD)</th>
                <th className="py-2 text-right">Pólizas Emitidas</th>
                <th className="py-2 text-right">Costo/Póliza (USD)</th>
                <th className="py-2 text-right">Costo/Póliza (COP)</th>
                <th className="py-2 text-right">Primas (USD)</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.sort((a, b) => b.mes.localeCompare(a.mes)).map((r, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-2">{r.mes}</td>
                  <td className="py-2 font-medium">{r.producto}</td>
                  <td className="py-2 text-right">${r.totalCostAiUsd.toLocaleString()}</td>
                  <td className="py-2 text-right">{r.polizasEmitidas.toLocaleString()}</td>
                  <td className="py-2 text-right font-medium">{r.costoPorPolizaUsd !== null ? `$${r.costoPorPolizaUsd.toFixed(4)}` : 'N/A'}</td>
                  <td className="py-2 text-right">{r.costoPorPolizaCop !== null ? `$${r.costoPorPolizaCop.toLocaleString()}` : 'N/A'}</td>
                  <td className="py-2 text-right">${r.primasEmitidasUsd.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
