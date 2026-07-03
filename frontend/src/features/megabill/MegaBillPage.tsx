import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Cloud, Package, Key, ArrowLeft } from 'lucide-react';
import { useMegaBill, useMegaBillDrillDown } from './hooks/useMegaBill';

const CATEGORY_COLORS: Record<string, string> = {
  cloud: '#3b82f6',
  saas: '#8b5cf6',
  licenses: '#f97316',
};

const CATEGORY_LABELS: Record<string, string> = {
  cloud: 'Cloud',
  saas: 'SaaS',
  licenses: 'Licencias',
};

const CATEGORY_ICONS: Record<string, typeof Cloud> = {
  cloud: Cloud,
  saas: Package,
  licenses: Key,
};

/** Formats a number as USD currency. */
function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

/**
 * MegaBill page — Req 5.
 * Consolidated multi-technology cost view with donut chart and drill-down.
 */
export default function MegaBillPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useMegaBill();
  const drillDown = useMegaBillDrillDown(selectedCategory);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">MegaBill — Vista Consolidada</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">MegaBill — Vista Consolidada</h1>
        <div className="text-center py-8">
          <p className="text-destructive mb-3">Error al cargar datos</p>
          <button onClick={() => refetch()} className="px-4 py-2 border rounded-md text-sm hover:bg-muted">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.categories.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">MegaBill — Vista Consolidada</h1>
        <div className="text-center py-8 text-muted-foreground">
          No hay datos de gasto disponibles.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {selectedCategory && (
          <button onClick={() => setSelectedCategory(null)} className="p-2 hover:bg-muted rounded-md">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-2xl font-bold">MegaBill — Vista Consolidada</h1>
        <span className="text-lg text-muted-foreground ml-auto">{formatUsd(data.totalCost)}</span>
      </div>

      {/* Summary view */}
      {!selectedCategory && (
        <>
          {/* Category cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.category] || Cloud;
              return (
                <button
                  key={cat.category}
                  onClick={() => setSelectedCategory(cat.category)}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow text-left"
                  style={{ borderLeftColor: CATEGORY_COLORS[cat.category], borderLeftWidth: 4 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5" style={{ color: CATEGORY_COLORS[cat.category] }} />
                    <span className="font-medium">{CATEGORY_LABELS[cat.category]}</span>
                  </div>
                  <p className="text-xl font-bold">{formatUsd(cat.totalCost)}</p>
                  <p className="text-sm text-muted-foreground">{cat.percentage.toFixed(1)}%</p>
                </button>
              );
            })}
          </div>

          {/* Donut chart */}
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.categories}
                  dataKey="totalCost"
                  nameKey="category"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={2}
                  onClick={(_, index) => setSelectedCategory(data.categories[index].category)}
                  cursor="pointer"
                >
                  {data.categories.map((cat) => (
                    <Cell key={cat.category} fill={CATEGORY_COLORS[cat.category]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatUsd(value)}
                  labelFormatter={(label: string) => CATEGORY_LABELS[label] || label}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Drill-down view */}
      {selectedCategory && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Detalle: {CATEGORY_LABELS[selectedCategory]}
          </h2>

          {drillDown.isLoading && (
            <div className="animate-pulse space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded" />
              ))}
            </div>
          )}

          {drillDown.data && drillDown.data.services.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-3 px-2">Servicio</th>
                    <th className="py-3 px-2 text-right">Costo Facturado</th>
                    <th className="py-3 px-2 text-right">Uso</th>
                    <th className="py-3 px-2">Proveedor</th>
                  </tr>
                </thead>
                <tbody>
                  {drillDown.data.services.map((svc) => (
                    <tr key={`${svc.serviceName}-${svc.provider}`} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">{svc.serviceName}</td>
                      <td className="py-3 px-2 text-right">{formatUsd(svc.billedCost)}</td>
                      <td className="py-3 px-2 text-right">
                        {new Intl.NumberFormat('en-US').format(svc.usageQuantity)}
                      </td>
                      <td className="py-3 px-2">{svc.provider}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {drillDown.data && drillDown.data.services.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              No hay servicios disponibles para esta categoría.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
