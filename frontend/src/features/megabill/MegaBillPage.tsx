import { FileText } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

/**
 * Vista MegaBill — Factura consolidada en formato FOCUS.
 * Agrupa costos por categoría (cloud, SaaS, licencias) con drill-down.
 */
export default function MegaBillPage() {
  return (
    <PageContainer
      title="Vista MegaBill"
      description="Factura consolidada multi-proveedor en formato FOCUS con drill-down por categoría."
    >
      <div className="flex items-center justify-center h-64 bg-card border border-border rounded-lg">
        <div className="text-center text-muted-foreground">
          <FileText size={40} className="mx-auto mb-2 opacity-50" />
          <p>Módulo en construcción</p>
        </div>
      </div>
    </PageContainer>
  );
}
