import { ShieldCheck } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

/**
 * Costos Evitados — Registro de acciones preventivas.
 * Permite crear acciones de cost avoidance con ahorro estimado.
 */
export default function CostAvoidancePage() {
  return (
    <PageContainer
      title="Costos Evitados"
      description="Registro de acciones preventivas y ahorro estimado por revisiones arquitectónicas y rightsizing."
    >
      <div className="flex items-center justify-center h-64 bg-card border border-border rounded-lg">
        <div className="text-center text-muted-foreground">
          <ShieldCheck size={40} className="mx-auto mb-2 opacity-50" />
          <p>Módulo en construcción</p>
        </div>
      </div>
    </PageContainer>
  );
}
