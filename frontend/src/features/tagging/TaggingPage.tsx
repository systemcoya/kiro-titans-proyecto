import { Tags } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

/**
 * Etiquetado — Gestión de tags de recursos.
 * CRUD de etiquetas con cálculo de compliance y alertas.
 */
export default function TaggingPage() {
  return (
    <PageContainer
      title="Etiquetado"
      description="Gestión de etiquetas de recursos con monitoreo de compliance de campos obligatorios."
    >
      <div className="flex items-center justify-center h-64 bg-card border border-border rounded-lg">
        <div className="text-center text-muted-foreground">
          <Tags size={40} className="mx-auto mb-2 opacity-50" />
          <p>Módulo en construcción</p>
        </div>
      </div>
    </PageContainer>
  );
}
