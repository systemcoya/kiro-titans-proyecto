import { Bell } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

/**
 * Alertas Configurables — CRUD de reglas de alerta con historial.
 * Permite crear umbrales por servicio y ver alertas activas.
 */
export default function AlertsPage() {
  return (
    <PageContainer
      title="Alertas Configurables"
      description="Gestión de reglas de alerta por umbral de gasto con historial de activaciones."
    >
      <div className="flex items-center justify-center h-64 bg-card border border-border rounded-lg">
        <div className="text-center text-muted-foreground">
          <Bell size={40} className="mx-auto mb-2 opacity-50" />
          <p>Módulo en construcción</p>
        </div>
      </div>
    </PageContainer>
  );
}
