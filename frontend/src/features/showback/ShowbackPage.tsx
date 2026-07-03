import { Users } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

/**
 * Showback/Chargeback — Asignación de costos por célula de desarrollo.
 * Muestra breakdown cloud + IA + SaaS por equipo con % de presupuesto.
 */
export default function ShowbackPage() {
  return (
    <PageContainer
      title="Showback / Chargeback"
      description="Asignación de costos por célula de desarrollo con desglose cloud, IA y SaaS."
    >
      <div className="flex items-center justify-center h-64 bg-card border border-border rounded-lg">
        <div className="text-center text-muted-foreground">
          <Users size={40} className="mx-auto mb-2 opacity-50" />
          <p>Módulo en construcción</p>
        </div>
      </div>
    </PageContainer>
  );
}
