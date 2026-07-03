import { useState } from 'react';
import { Shield, CheckCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useGovernanceRules, useRecommendations, useImplementRecommendation } from './hooks/useGovernance';

type Tab = 'recommendations' | 'rules';

/**
 * Governance page — Req 7.
 * Automated policies for idle/oversized resource detection with recommendations.
 */
export default function GovernancePage() {
  const [tab, setTab] = useState<Tab>('recommendations');
  const rules = useGovernanceRules();
  const recommendations = useRecommendations();
  const implement = useImplementRecommendation();

  const handleImplement = (id: string) => {
    implement.mutate(id, {
      onSuccess: () => toast.success('Recomendación marcada como implementada'),
      onError: () => toast.error('Error al implementar'),
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Shield className="h-6 w-6" /> Gobernanza y Optimización
      </h1>

      {/* Total savings */}
      {recommendations.data && (
        <div className="p-4 border rounded-lg bg-green-50 flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-green-600" />
          <div>
            <p className="text-sm text-muted-foreground">Ahorro estimado total (activo)</p>
            <p className="text-xl font-bold text-green-700">
              ${recommendations.data.totalEstimatedSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(['recommendations', 'rules'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm border-b-2 ${
              tab === t ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'
            }`}
          >
            {t === 'recommendations' ? 'Recomendaciones' : 'Reglas'}
          </button>
        ))}
      </div>

      {/* Recommendations */}
      {tab === 'recommendations' && (
        <div className="space-y-3">
          {recommendations.isLoading && <div className="animate-pulse h-32 bg-muted rounded" />}
          {recommendations.data?.recommendations
            .filter((r) => r.status === 'active')
            .map((rec) => (
              <div key={rec.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">{rec.resourceId}</p>
                  <p className="text-sm text-muted-foreground">{rec.ruleName}</p>
                  <p className="text-sm">
                    Acción: <span className="font-medium">{rec.suggestedAction}</span> |
                    Ahorro: <span className="text-green-600 font-bold">${rec.estimatedSavingsUsd.toLocaleString()}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleImplement(rec.id)}
                  disabled={implement.isPending}
                  className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md text-xs hover:bg-green-700"
                >
                  <CheckCircle className="h-3 w-3" /> Implementar
                </button>
              </div>
            ))}
          {recommendations.data?.recommendations.filter((r) => r.status === 'active').length === 0 && (
            <p className="text-center py-8 text-muted-foreground">No hay recomendaciones activas</p>
          )}
        </div>
      )}

      {/* Rules */}
      {tab === 'rules' && (
        <div className="space-y-3">
          {rules.isLoading && <div className="animate-pulse h-32 bg-muted rounded" />}
          {rules.data?.map((rule) => (
            <div key={rule.id} className="p-3 border rounded-lg text-sm">
              <p className="font-medium">{rule.resource}</p>
              <p className="text-muted-foreground">
                {rule.metric} {rule.operator} {rule.value} durante {rule.evaluationPeriodDays} días
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
