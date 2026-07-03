import { AlertTriangle } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

/**
 * Anomalías — Detección estadística de gastos atípicos.
 * Muestra anomalías clasificadas por severidad basadas en desviaciones estándar.
 */
export default function AnomaliesPage() {
  return (
    <PageContainer
      title="Anomalías"
      description="Detección automática de gastos atípicos usando análisis estadístico de desviaciones estándar."
    >
      <div className="flex items-center justify-center h-64 bg-card border border-border rounded-lg">
        <div className="text-center text-muted-foreground">
          <AlertTriangle size={40} className="mx-auto mb-2 opacity-50" />
          <p>Módulo en construcción</p>
        </div>
      </div>
    </PageContainer>
  );
}
