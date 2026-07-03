import { PiggyBank } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

/**
 * Self-Funding — Ratio de autofinanciamiento de IA.
 * Muestra inversión vs ahorros generados con ratio calculado.
 */
export default function SelfFundingPage() {
  return (
    <PageContainer
      title="Self-Funding"
      description="Ratio de autofinanciamiento: ahorros generados por IA vs inversión realizada."
    >
      <div className="flex items-center justify-center h-64 bg-card border border-border rounded-lg">
        <div className="text-center text-muted-foreground">
          <PiggyBank size={40} className="mx-auto mb-2 opacity-50" />
          <p>Módulo en construcción</p>
        </div>
      </div>
    </PageContainer>
  );
}
