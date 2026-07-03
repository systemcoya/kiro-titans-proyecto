import { useState } from 'react';
import { Bell, Plus, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useActiveAlerts, useAlertRules, useAlertHistory, useCreateAlertRule, useDeleteAlertRule } from './hooks/useAlerts';

type Tab = 'active' | 'rules' | 'history';

/**
 * Alerts page — Req 4.
 * Configurable spend alerts with CRUD rules, active alerts panel, and history.
 */
export default function AlertsPage() {
  const [tab, setTab] = useState<Tab>('active');
  const [showForm, setShowForm] = useState(false);
  const [formService, setFormService] = useState('');
  const [formThreshold, setFormThreshold] = useState('');
  const [formRecipient, setFormRecipient] = useState('');
  const [historyPage, setHistoryPage] = useState(1);

  const activeAlerts = useActiveAlerts();
  const rules = useAlertRules();
  const history = useAlertHistory(historyPage);
  const createRule = useCreateAlertRule();
  const deleteRule = useDeleteAlertRule();

  const handleCreate = () => {
    if (!formService || !formThreshold || !formRecipient) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    createRule.mutate(
      { service: formService, threshold: parseFloat(formThreshold), recipient: formRecipient },
      {
        onSuccess: () => {
          toast.success('Regla creada');
          setShowForm(false);
          setFormService('');
          setFormThreshold('');
          setFormRecipient('');
        },
        onError: () => toast.error('Error al crear regla'),
      }
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Bell className="h-6 w-6" /> Alertas de Gasto
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(['active', 'rules', 'history'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm border-b-2 ${
              tab === t ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'active' ? 'Activas' : t === 'rules' ? 'Reglas' : 'Historial'}
          </button>
        ))}
      </div>

      {/* Active alerts */}
      {tab === 'active' && (
        <div className="space-y-3">
          {activeAlerts.isLoading && <div className="animate-pulse h-32 bg-muted rounded" />}
          {activeAlerts.data?.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 border rounded-lg flex items-start gap-3 ${
                alert.severity === 'critical' ? 'border-red-300 bg-red-50' : 'border-yellow-300 bg-yellow-50'
              }`}
            >
              {alert.severity === 'critical'
                ? <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                : <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              }
              <div className="flex-1">
                <p className="font-medium">{alert.service}</p>
                <p className="text-sm text-muted-foreground">
                  Umbral: ${alert.threshold.toLocaleString()} | Valor actual: ${alert.actualValue.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{new Date(alert.triggeredAt).toLocaleString()}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded font-medium ${
                alert.severity === 'critical' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
              }`}>
                {alert.severity}
              </span>
            </div>
          ))}
          {activeAlerts.data?.alerts.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">No hay alertas activas</p>
          )}
        </div>
      )}

      {/* Rules */}
      {tab === 'rules' && (
        <div className="space-y-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
          >
            <Plus className="h-4 w-4" /> Nueva regla
          </button>

          {showForm && (
            <div className="p-4 border rounded-lg space-y-3 bg-card">
              <input placeholder="Servicio (ej: GPT-4)" value={formService} onChange={(e) => setFormService(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
              <input placeholder="Umbral USD" type="number" value={formThreshold} onChange={(e) => setFormThreshold(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
              <input placeholder="Email destinatario" type="email" value={formRecipient} onChange={(e) => setFormRecipient(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
              <button onClick={handleCreate} disabled={createRule.isPending} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                {createRule.isPending ? 'Creando...' : 'Crear'}
              </button>
            </div>
          )}

          {rules.data?.map((rule) => (
            <div key={rule.id} className="p-3 border rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium">{rule.service}</p>
                <p className="text-sm text-muted-foreground">Umbral: ${rule.threshold.toLocaleString()} → {rule.recipient}</p>
              </div>
              <button onClick={() => deleteRule.mutate(rule.id)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="space-y-3">
          {history.data?.alerts.map((alert) => (
            <div key={alert.id} className="p-3 border rounded-lg text-sm flex justify-between">
              <div>
                <span className="font-medium">{alert.service}</span>
                <span className="ml-2 text-muted-foreground">${alert.actualValue.toLocaleString()}</span>
              </div>
              <span className="text-xs text-muted-foreground">{new Date(alert.triggeredAt).toLocaleDateString()}</span>
            </div>
          ))}
          <div className="flex justify-center gap-2">
            <button onClick={() => setHistoryPage(Math.max(1, historyPage - 1))} disabled={historyPage === 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Anterior</button>
            <span className="px-3 py-1 text-sm">Página {historyPage}</span>
            <button onClick={() => setHistoryPage(historyPage + 1)} className="px-3 py-1 border rounded text-sm">Siguiente</button>
          </div>
        </div>
      )}
    </div>
  );
}
