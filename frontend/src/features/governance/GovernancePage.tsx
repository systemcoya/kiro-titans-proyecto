import { Shield } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

/**
 * Gobernanza — Reglas de rightsizing y recomendaciones.
 * CRUD de reglas con lista de recomendaciones activas y ahorro estimado.
 */
export default function GovernancePage() {
  return (
    <PageContainer
      title="Gobernanza"
      description="Reglas de rightsizing automático con recomendaciones de ahorro por recurso."
    >
      <div className="flex items-center justify-center h-64 bg-card border border-border rounded-lg">
        <div className="text-center text-muted-foreground">
          <Shield size={40} className="mx-auto mb-2 opacity-50" />
          <p>Módulo en construcción</p>
        </div>
      </div>
    </PageContainer>
  );
}
