import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, Download } from 'lucide-react';
import { useExecutiveDashboard } from './hooks/useExecutive';
import apiClient from '@/services/api-client';

function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

/**
 * Executive Dashboard page — Req 10.
 * One-pager CTO view with key KPIs, 6-month trend, and PDF export.
 */
export default function ExecutivePage() {
  const { data, isLoading, isError, refetch } = useExecutiveDashboard();

  const handleExportPdf = async () => {
    try {
      const response = await apiClient.get('/executive/export-pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'dashboard-ejecutivo.pdf';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      // Silently fail — toast already handled by interceptor
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-muted rounded" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-3">Error al cargar el dashboard ejecutivo</p>
        <button onClick={() => refetch()} className="px-4 py-2 border rounded-md text-sm">Reintentar</button>
      </div>
    );
  }

  if (!data) return null;

  const variationExceedsThreshold = data.variationPercentage !== null && data.variationPercentage > 15;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard Ejecutivo</h1>
        <button onClick={handleExportPdf} className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm hover:bg-muted">
          <Download className="h-4 w-4" /> Exportar PDF
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className={`p-4 border rounded-lg ${variationExceedsThreshold ? 'border-red-300 bg-red-50' : ''}`}>
          <p className="text-xs text-muted-foreground">Gasto Mes Actual</p>
          <p className={`text-2xl font-bold ${variationExceedsThreshold ? 'text-red-600' : ''}`}>
            {formatUsd(data.currentMonthSpend)}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-xs text-muted-foreground">Gasto Mes Anterior</p>
          <p className="text-2xl font-bold">
            {data.previousMonthSpend !== null ? formatUsd(data.previousMonthSpend) : 'N/A'}
          </p>
        </div>
        <div className={`p-4 border rounded-lg ${variationExceedsThreshold ? 'border-red-300 bg-red-50' : ''}`}>
          <p className="text-xs text-muted-foreground">Variación</p>
          <p className={`text-2xl font-bold ${variationExceedsThreshold ? 'text-red-600' : ''}`}>
            {data.variationPercentage !== null ? `${data.variationPercentage.toFixed(1)}%` : 'N/A'}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-xs text-muted-foreground">Costo Promedio / Transacción</p>
          <p className="text-2xl font-bold">{formatUsd(data.avgCostPerTransaction)}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-xs text-muted-foreground">Alertas Críticas</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold">{data.criticalAlertsCount}</p>
            {data.criticalAlertsCount > 0 && <AlertCircle className="h-5 w-5 text-red-500" />}
          </div>
        </div>
      </div>

      {/* 6-month trend */}
      {data.monthlyTrend.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Tendencia últimos 6 meses</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatUsd(v)} />
              <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top 5 services */}
      {data.top5Services.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Top 5 Servicios por Gasto</h3>
          <div className="space-y-2">
            {data.top5Services.map((svc, i) => (
              <div key={svc.name} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="text-sm"><span className="font-bold mr-2">{i + 1}.</span>{svc.name}</span>
                <span className="font-medium">{formatUsd(svc.cost)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
