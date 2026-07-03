import { BarChart3 } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

/**
 * Gasto IA — Visualización de costos por servicio, equipo y proveedor.
 * Permite filtrar por fecha, equipo y proveedor con breakdowns dinámicos.
 */
export default function AISpendPage() {
  return (
    <PageContainer
      title="Gasto IA"
      description="Visualización detallada del gasto en servicios de IA por servicio, equipo y proveedor."
    >
      <div className="flex items-center justify-center h-64 bg-card border border-border rounded-lg">
        <div className="text-center text-muted-foreground">
          <BarChart3 size={40} className="mx-auto mb-2 opacity-50" />
          <p>Módulo en construcción</p>
        </div>
      </div>
    </PageContainer>
  );
}
