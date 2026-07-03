import { LayoutDashboard } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

/**
 * Dashboard Ejecutivo — Vista de KPIs estratégicos para CTO/CIO.
 * Muestra métricas clave, variaciones mensuales y resumen de costos.
 */
export default function ExecutivePage() {
  return (
    <PageContainer
      title="Dashboard Ejecutivo"
      description="Vista estratégica de costos IA y cloud para la Gerencia de Estrategia Tecnológica."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {['Gasto Total IA', 'Self-Funding Ratio', 'Alertas Activas', 'Anomalías'].map((kpi) => (
          <div key={kpi} className="p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">{kpi}</p>
            <p className="text-2xl font-semibold text-foreground mt-1">—</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center h-48 bg-card border border-border rounded-lg">
        <div className="text-center text-muted-foreground">
          <LayoutDashboard size={40} className="mx-auto mb-2 opacity-50" />
          <p>Módulo en construcción</p>
        </div>
      </div>
    </PageContainer>
  );
}
