import { useMemo, useState } from 'react';
import { useMegaBill } from './hooks/useMegaBill';

/**
 * MegaBill Page — Req 5.
 * Consolidated view: AI + Cloud + SaaS from Google Sheets.
 */
export default function MegaBillPage() {
  const { data, isLoading, isError, refetch } = useMegaBill();
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = useMemo(() => {
    if (!data?.data) return [];
    const map: Record<string, { totalUsd: number; count: number }> = {};
    for (const r of data.data) {
      if (!map[r.category]) map[r.category] = { totalUsd: 0, count: 0 };
      map[r.category].totalUsd += r.billedCostUsd;
      map[r.category].count += 1;
    }
    const total = Object.values(map).reduce((s, v) => s + v.totalUsd, 0);
    return Object.entries(map).map(([cat, vals]) => ({
      category: cat,
      totalUsd: vals.totalUsd,
      totalCop: vals.totalUsd * 4200,
      count: vals.count,
      percentage: total > 0 ? ((vals.totalUsd / total) * 100).toFixed(1) : '0',
    })).sort((a, b) => b.totalUsd - a.totalUsd);
  }, [data]);

  const drillDown = useMemo(() => {
    if (!data?.data || !selectedCategory) return [];
    const filtered = data.data.filter(r => r.category === selectedCategory);
    const map: Record<string, { totalUsd: number; provider: string }> = {};
    for (const r of filtered) {
      if (!map[r.serviceName]) map[r.serviceName] = { totalUsd: 0, provider: r.provider };
      map[r.serviceName].totalUsd += r.billedCostUsd;
    }
    return Object.entries(map).sort((a, b) => b[1].totalUsd - a[1].totalUsd);
  }, [data, selectedCategory]);

  const grandTotal = categories.reduce((s, c) => s + c.totalUsd, 0);

  if (isLoading) return <div className="animate-pulse p-6"><div className="h-8 bg-gray-200 rounded w-1/3 mb-4" /><div className="h-64 bg-gray-200 rounded" /></div>;
  if (isError) return <div className="text-center py-12"><p className="text-red-600">Error cargando datos</p><button onClick={() => refetch()} className="mt-4 px-4 py-2 border rounded">Reintentar</button></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">MegaBill — Vista Consolidada</h1>
      <p className="text-gray-500 text-sm">Gasto tecnológico total normalizado FOCUS. Fuente: Google Sheets</p>

      {/* Grand Total */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <p className="text-xs text-gray-500">Total Tecnológico (USD)</p>
          <p className="text-3xl font-bold text-blue-600">${grandTotal.toLocaleString()}</p>
        </div>
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <p className="text-xs text-gray-500">Total Tecnológico (COP)</p>
          <p className="text-3xl font-bold text-green-600">${(grandTotal * 4200).toLocaleString()}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="border rounded-lg bg-white shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3">Por Categoría</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2">Categoría</th>
              <th className="py-2 text-right">Total USD</th>
              <th className="py-2 text-right">Total COP</th>
              <th className="py-2 text-right">Registros</th>
              <th className="py-2 text-right">% del Total</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.category} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedCategory(c.category)}>
                <td className="py-2 font-medium capitalize">{c.category === 'ai' ? '🤖 AI' : c.category === 'cloud' ? '☁️ Cloud' : '📦 SaaS/Licencias'}</td>
                <td className="py-2 text-right">${c.totalUsd.toLocaleString()}</td>
                <td className="py-2 text-right">${c.totalCop.toLocaleString()}</td>
                <td className="py-2 text-right">{c.count}</td>
                <td className="py-2 text-right font-medium">{c.percentage}%</td>
                <td className="py-2 text-right text-blue-500">Ver →</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drill-down */}
      {selectedCategory && (
        <div className="border rounded-lg bg-white shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Drill-down: {selectedCategory.toUpperCase()}</h2>
            <button onClick={() => setSelectedCategory('')} className="text-sm text-gray-500 hover:text-gray-700">✕ Cerrar</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2">Servicio</th>
                <th className="py-2">Proveedor</th>
                <th className="py-2 text-right">Total USD</th>
                <th className="py-2 text-right">Total COP</th>
              </tr>
            </thead>
            <tbody>
              {drillDown.map(([name, vals]) => (
                <tr key={name} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-medium">{name}</td>
                  <td className="py-2">{vals.provider}</td>
                  <td className="py-2 text-right">${vals.totalUsd.toLocaleString()}</td>
                  <td className="py-2 text-right">${(vals.totalUsd * 4200).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
