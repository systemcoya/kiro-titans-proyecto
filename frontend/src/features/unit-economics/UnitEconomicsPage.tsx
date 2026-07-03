import { Calculator } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

/**
 * Unit Economics — Costo unitario por transacción/servicio.
 * Muestra tabla con tendencias semanales y dirección de costo.
 */
export default function UnitEconomicsPage() {
  return (
    <PageContainer
      title="Unit Economics"
      description="Costo unitario por transacción procesada, con tendencias semanales por servicio de IA."
    >
      <div className="flex items-center justify-center h-64 bg-card border border-border rounded-lg">
        <div className="text-center text-muted-foreground">
          <Calculator size={40} className="mx-auto mb-2 opacity-50" />
          <p>Módulo en construcción</p>
        </div>
      </div>
    </PageContainer>
  );
}
