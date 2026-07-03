import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AlertCircle, Download, TrendingUp, TrendingDown, DollarSign, Activity, MessageCircle, Send } from 'lucide-react';
import { useExecutiveDashboard } from './hooks/useExecutive';

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
  const { data, isLoading } = useExecutiveDashboard();
  const [chatMessages, setChatMessages] = useState(COPILOT_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const [chatIndex, setChatIndex] = useState(3);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, { role: 'user' as const, text: chatInput }]);
    setChatInput('');
    // Simulate response
    setTimeout(() => {
      const responses = [
        '📈 El gasto acumulado en Cloud (AWS + GCP) de enero a junio 2026 fue de **$20,370 USD**. AWS representa el 72% del gasto cloud total.',
        '🎯 Tu Unit Economics mejoró: pasaste de $5.73/póliza en enero a $4.50/póliza en junio gracias al incremento de volumen (+87% pólizas emitidas).',
        '⚠️ Detecto una anomalía: Stripe cobró $2,790 en junio (vs $1,530 promedio). Correlaciona con el pico de 2,800 transacciones exitosas ese mes.',
      ];
      setChatMessages((prev) => [...prev, { role: 'assistant' as const, text: responses[chatIndex % responses.length] }]);
      setChatIndex((i) => i + 1);
    }, 1000);
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
        <button
          onClick={() => window.open('/api/v1/executive/export-pdf')}
          className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm hover:bg-muted"
        >
          <Download className="h-4 w-4" /> Exportar PDF
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 border rounded-xl bg-card shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <DollarSign className="h-4 w-4" /> Gasto Total Mes (Jun 2026)
          </div>
          <p className="text-2xl font-bold">{formatUsd(data?.currentMonthSpend || 12595)}</p>
          <p className="text-xs text-muted-foreground mt-1">Cloud + AI + SaaS</p>
        </div>

        <div className={`p-5 border rounded-xl shadow-sm ${(data?.variationPercentage || 28.7) > 15 ? 'bg-red-50 border-red-200' : 'bg-card'}`}>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            {(data?.variationPercentage || 28.7) > 0 ? <TrendingUp className="h-4 w-4 text-red-500" /> : <TrendingDown className="h-4 w-4 text-green-500" />}
            Variación vs. Mes Anterior
          </div>
          <p className={`text-2xl font-bold ${(data?.variationPercentage || 28.7) > 15 ? 'text-red-600' : ''}`}>
            +{(data?.variationPercentage || 28.7).toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">May → Jun 2026</p>
        </div>

        <div className="p-5 border rounded-xl bg-card shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <Activity className="h-4 w-4" /> Costo Unitario / Póliza
          </div>
          <p className="text-2xl font-bold">{formatUsd(data?.avgCostPerTransaction || 4.50)}</p>
          <p className="text-xs text-muted-foreground mt-1">$12,595 ÷ 2,800 pólizas emitidas</p>
        </div>

        <div className="p-5 border rounded-xl bg-card shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <AlertCircle className="h-4 w-4 text-red-500" /> Alertas Críticas
          </div>
          <p className="text-2xl font-bold">{data?.criticalAlertsCount || 2}</p>
          <p className="text-xs text-muted-foreground mt-1">Bedrock Claude 3, EC2 Cómputo</p>
        </div>
      </div>

      {/* Main content: Trend + Chat side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 6-month trend */}
        <div className="lg:col-span-3 border rounded-xl p-5 bg-card shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Tendencia de Gasto — 2026</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={[
              { month: 'Ene', cloud: 2870, ai: 2070, saas: 3580 },
              { month: 'Feb', cloud: 3010, ai: 2070, saas: 3600 },
              { month: 'Mar', cloud: 3270, ai: 2070, saas: 3700 },
              { month: 'Abr', cloud: 3380, ai: 2070, saas: 3800 },
              { month: 'May', cloud: 3500, ai: 2070, saas: 4200 },
              { month: 'Jun', cloud: 3670, ai: 2835, saas: 6090 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatUsd(v)} />
              <Bar dataKey="cloud" name="Cloud (AWS+GCP)" fill="#3b82f6" stackId="a" />
              <Bar dataKey="ai" name="AI (Bedrock+Vertex)" fill="#8b5cf6" stackId="a" />
              <Bar dataKey="saas" name="SaaS (Stripe+Twilio+Otros)" fill="#f97316" stackId="a" />
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
          <h3 className="text-lg font-semibold mb-3">Top 5 Servicios por Gasto (Jun 2026)</h3>
          <div className="space-y-3">
            {[
              { name: 'Bedrock (Claude 3) — CC 5100', cost: 1350, pct: 10.7 },
              { name: 'Stripe Pagos (Todos los CC)', cost: 2790, pct: 22.2 },
              { name: 'Mati / KYC Identidad', cost: 1400, pct: 11.1 },
              { name: 'Vertex AI (Gemini Pro) — CC 5102', cost: 900, pct: 7.1 },
              { name: 'EC2 Cómputo — CC 5100', cost: 800, pct: 6.4 },
            ].map((svc, i) => (
              <div key={svc.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{svc.name}</span>
                    <span className="text-sm font-bold">{formatUsd(svc.cost)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${svc.pct * 3}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-xl p-5 bg-card shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Unit Economics por Producto (Jun 2026)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2">Producto</th>
                  <th className="py-2 text-right">Costo TI</th>
                  <th className="py-2 text-right">Pólizas</th>
                  <th className="py-2 text-right">$/Póliza</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Autos Verde (5100)', cost: 4810, polizas: 1500, perPolicy: 3.21 },
                  { name: 'Autos Ligeros (5101)', cost: 3645, polizas: 1000, perPolicy: 3.65 },
                  { name: 'Vehículos Pesados (5102)', cost: 1900, polizas: 300, perPolicy: 6.33 },
                  { name: 'Total App', cost: 12595, polizas: 2800, perPolicy: 4.50 },
                ].map((row) => (
                  <tr key={row.name} className={`border-b ${row.name === 'Total App' ? 'font-bold bg-muted/50' : ''}`}>
                    <td className="py-2">{row.name}</td>
                    <td className="py-2 text-right">{formatUsd(row.cost)}</td>
                    <td className="py-2 text-right">{row.polizas.toLocaleString()}</td>
                    <td className="py-2 text-right">{formatUsd(row.perPolicy)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
