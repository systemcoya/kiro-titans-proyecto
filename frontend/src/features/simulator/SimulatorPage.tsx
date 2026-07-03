import { TrendingUp } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

/**
 * Simulador What-If — Proyección de costos con escenarios.
 * Calcula proyecciones optimista, base y pesimista a 1, 3 y 6 meses.
 */
export default function SimulatorPage() {
  return (
    <PageContainer
      title="Simulador What-If"
      description="Proyección de costos bajo escenarios optimista, base y pesimista a 1, 3 y 6 meses."
    >
      <div className="flex items-center justify-center h-64 bg-card border border-border rounded-lg">
        <div className="text-center text-muted-foreground">
          <TrendingUp size={40} className="mx-auto mb-2 opacity-50" />
          <p>Módulo en construcción</p>
        </div>
      </div>
    </PageContainer>
  );
}
