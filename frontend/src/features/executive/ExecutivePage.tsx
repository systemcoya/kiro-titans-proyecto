import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AlertCircle, Download, TrendingUp, TrendingDown, DollarSign, Activity, MessageCircle, Send, RefreshCw } from 'lucide-react';
import { useExecutiveDashboard, type DashboardFilters } from './hooks/useExecutive';
import { processQuestion } from './copilot-engine';

function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

// Chat messages for FinOps Copilot simulation
const COPILOT_MESSAGES = [
  {
    role: 'assistant' as const,
    text: '¡Hola Duvan! 👋 En junio 2026 gastaste **$12,595 USD** en tecnología total. Tu producto "Autos Verde" (CC 5100) representó el **38.2%** de este gasto con $4,810 USD entre infra, AI y SaaS.',
  },
  {
    role: 'assistant' as const,
    text: '📊 El costo de IA consumido por los agentes de "Autos Ligeros" incrementó un **30%** vs enero 2026 debido a picos de cotizaciones automáticas con Gemini Flash. Pasó de $450 a $585 USD/mes.',
  },
  {
    role: 'assistant' as const,
    text: '💡 **Recomendación:** Tu costo unitario por póliza en Vehículos Pesados es $12.67 — el más alto. Considera optimizar las llamadas a Gemini Pro con caching de respuestas frecuentes. Ahorro estimado: ~$180/mes.',
  },
];

/**
 * Executive Dashboard / Home — "Cloud & AI Value Manager"
 * One-pager with KPIs, 6-month trend, top services, and FinOps Copilot chat.
 */
export default function ExecutivePage() {
  const [filters, setFilters] = useState<DashboardFilters>({
    month: '2026-06',
    provider: '',
    product: '',
  });
  const [chatMessages, setChatMessages] = useState(COPILOT_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const { data, isLoading, isFetching, refreshData } = useExecutiveDashboard(filters);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, { role: 'user' as const, text: chatInput }]);
    const userQuestion = chatInput;
    setChatInput('');
    // Process with analytics engine
    setTimeout(() => {
      const response = processQuestion(userQuestion);
      setChatMessages((prev) => [...prev, { role: 'assistant' as const, text: response.text }]);
    }, 600);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 bg-muted rounded w-1/2" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Hola, Duvan 👋</h1>
          <p className="text-muted-foreground mt-1">Cloud & AI Value Manager — Venta de Pólizas de Autos</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshData}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm hover:bg-muted disabled:opacity-50"
            title="Refrescar datos (limpiar caché)"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Actualizando...' : 'Refrescar'}
          </button>
          <button
            onClick={() => window.open('/api/v1/executive/export-pdf')}
            className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm hover:bg-muted"
          >
            <Download className="h-4 w-4" /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 border rounded-lg bg-card shadow-sm">
        <div>
          <label className="text-xs text-muted-foreground">Mes</label>
          <select
            value={filters.month || ''}
            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
          >
            <option value="2026-06">Junio 2026</option>
            <option value="2026-01">Enero 2026</option>
            <option value="2025-12">Diciembre 2025</option>
            <option value="2025-06">Junio 2025</option>
            <option value="2025-01">Enero 2025</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Proveedor</label>
          <select
            value={filters.provider || ''}
            onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
          >
            <option value="">Todos</option>
            <option value="AWS">AWS (Bedrock)</option>
            <option value="GCP">GCP (Vertex AI)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Producto</label>
          <select
            value={filters.product || ''}
            onChange={(e) => setFilters({ ...filters, product: e.target.value })}
            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
          >
            <option value="">Todos</option>
            <option value="Autos verde">Autos Verde</option>
            <option value="Autos ligeros">Autos Ligeros</option>
            <option value="Vehiculos pesados">Vehículos Pesados</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 border rounded-xl bg-card shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <DollarSign className="h-4 w-4" /> Gasto Total Mes
          </div>
          <p className="text-2xl font-bold">{formatUsd(data?.totalSpend?.currentMonthCop || 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">Cloud + AI + SaaS</p>
        </div>

        <div className={`p-5 border rounded-xl shadow-sm ${Number(data?.totalSpend?.percentVariation || 0) > 15 ? 'bg-red-50 border-red-200' : 'bg-card'}`}>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            {Number(data?.totalSpend?.percentVariation || 0) > 0 ? <TrendingUp className="h-4 w-4 text-red-500" /> : <TrendingDown className="h-4 w-4 text-green-500" />}
            Variación vs. Mes Anterior
          </div>
          <p className={`text-2xl font-bold ${Number(data?.totalSpend?.percentVariation || 0) > 15 ? 'text-red-600' : ''}`}>
            {Number(data?.totalSpend?.percentVariation || 0) > 0 ? '+' : ''}{Number(data?.totalSpend?.percentVariation || 0).toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Mes anterior → Mes actual</p>
        </div>

        <div className="p-5 border rounded-xl bg-card shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <Activity className="h-4 w-4" /> Costo Unitario / Póliza
          </div>
          <p className="text-2xl font-bold">{formatUsd(data?.avgCostPerTransaction?.value || 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">Costo promedio por transacción</p>
        </div>

        <div className="p-5 border rounded-xl bg-card shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <AlertCircle className="h-4 w-4 text-red-500" /> Alertas Críticas
          </div>
          <p className="text-2xl font-bold">{data?.criticalAlertsCount || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Servicios en umbral crítico</p>
        </div>
      </div>

      {/* Main content: Trend + Chat side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 6-month trend */}
        <div className="lg:col-span-3 border rounded-xl p-5 bg-card shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Tendencia de Gasto — 2026</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={[
              { month: 'Ene', cloud: 2870, ai: 2070, saas: 3580, primas: 45000 },
              { month: 'Feb', cloud: 3010, ai: 2070, saas: 3600, primas: 52500 },
              { month: 'Mar', cloud: 3270, ai: 2070, saas: 3700, primas: 63000 },
              { month: 'Abr', cloud: 3380, ai: 2070, saas: 3800, primas: 69000 },
              { month: 'May', cloud: 3500, ai: 2070, saas: 4200, primas: 75000 },
              { month: 'Jun', cloud: 3670, ai: 2835, saas: 6090, primas: 84000 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatUsd(v)} />
              <Bar dataKey="primas" name="Primas Emitidas (Ingreso)" fill="#d1fae5" stroke="#10b981" strokeWidth={1} radius={[4, 4, 0, 0]} />
              <Bar dataKey="cloud" name="Cloud (AWS+GCP)" fill="#3b82f6" stackId="costos" />
              <Bar dataKey="ai" name="AI (Bedrock+Vertex)" fill="#8b5cf6" stackId="costos" />
              <Bar dataKey="saas" name="SaaS (Stripe+Twilio+Otros)" fill="#f97316" stackId="costos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* FinOps Copilot Chat */}
        <div className="lg:col-span-2 border rounded-xl bg-card shadow-sm flex flex-col h-[360px]">
          <div className="p-4 border-b flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">FinOps Copilot</h3>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-auto">Online</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}>
                  {msg.text.split('**').map((part, j) =>
                    j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Pregunta algo sobre tus costos..."
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            />
            <button onClick={handleSendChat} className="p-2 bg-primary text-primary-foreground rounded-md">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Top services + Unit Economics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-xl p-5 bg-card shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Top 5 Servicios por Gasto</h3>
          <div className="space-y-3">
            {data?.topConsumers && data.topConsumers.length > 0 ? (
              data.topConsumers.map((svc: any) => {
                const totalSpend = data.totalSpend?.currentMonthCop || 1;
                const pct = (svc.spendCop / totalSpend) * 100;
                return (
                  <div key={svc.name} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5">{svc.rank}</span>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{svc.name}</span>
                        <span className="text-sm font-bold">{formatUsd(svc.spendCop)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.min(pct * 3, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">Sin datos disponibles</p>
            )}
          </div>
        </div>

        <div className="border rounded-xl p-5 bg-card shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Ratio de Autofundación</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Autofundación IA</span>
              <span className="text-2xl font-bold text-green-600">{data?.selfFundingRatio || 0}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${Math.min(data?.selfFundingRatio || 0, 100)}%` }} 
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Porcentaje de inversión IA recuperada por recomendaciones implementadas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
