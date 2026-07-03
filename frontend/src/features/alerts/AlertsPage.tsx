import { useState } from 'react';
import { Bell, Plus, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'active' | 'rules' | 'history';

const MOCK_ALERTS = [
  { id: '1', service: 'Bedrock (Claude 3)', threshold: 1200, actualValue: 1350, severity: 'critical' as const, triggeredAt: '2026-06-28T14:30:00Z' },
  { id: '2', service: 'EC2 Cómputo', threshold: 700, actualValue: 800, severity: 'warning' as const, triggeredAt: '2026-06-25T09:15:00Z' },
  { id: '3', service: 'Vertex AI (Gemini Pro)', threshold: 800, actualValue: 900, severity: 'critical' as const, triggeredAt: '2026-06-20T11:00:00Z' },
];

const MOCK_RULES = [
  { id: '1', service: 'Bedrock (Claude 3)', threshold: 1200, recipient: 'finops@segurosbolivar.com' },
  { id: '2', service: 'EC2 Cómputo', threshold: 700, recipient: 'infra@segurosbolivar.com' },
  { id: '3', service: 'Vertex AI (Gemini Pro)', threshold: 800, recipient: 'finops@segurosbolivar.com' },
  { id: '4', service: 'Stripe Pagos', threshold: 2500, recipient: 'pagos@segurosbolivar.com' },
];

const MOCK_HISTORY = [
  { id: 'h1', service: 'Bedrock (Claude 3)', actualValue: 1350, triggeredAt: '2026-06-28T14:30:00Z', severity: 'critical' as const },
  { id: 'h2', service: 'EC2 Cómputo', actualValue: 800, triggeredAt: '2026-06-25T09:15:00Z', severity: 'warning' as const },
  { id: 'h3', service: 'Bedrock (Claude 3)', actualValue: 1280, triggeredAt: '2026-06-15T10:00:00Z', severity: 'critical' as const },
  { id: 'h4', service: 'Vertex AI (Gemini Pro)', actualValue: 900, triggeredAt: '2026-06-20T11:00:00Z', severity: 'critical' as const },
  { id: 'h5', service: 'EC2 Cómputo', actualValue: 750, triggeredAt: '2026-06-10T08:45:00Z', severity: 'warning' as const },
];

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
  const [rules, setRules] = useState(MOCK_RULES);

  const handleCreate = () => {
    if (!formService || !formThreshold || !formRecipient) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    const newRule = {
      id: Date.now().toString(),
      service: formService,
      threshold: parseFloat(formThreshold),
      recipient: formRecipient,
    };
    setRules([...rules, newRule]);
    toast.success('Regla creada exitosamente');
    setShowForm(false);
    setFormService('');
    setFormThreshold('');
    setFormRecipient('');
  };

  const handleDelete = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
    toast.success('Regla eliminada');
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
            {t === 'active' ? `Activas (${MOCK_ALERTS.length})` : t === 'rules' ? `Reglas (${rules.length})` : 'Historial'}
          </button>
        ))}
      </div>

      {/* Active alerts */}
      {tab === 'active' && (
        <div className="space-y-3">
          {MOCK_ALERTS.map((alert) => (
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
              <button onClick={handleCreate} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">Crear</button>
            </div>
          )}

          {rules.map((rule) => (
            <div key={rule.id} className="p-3 border rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium">{rule.service}</p>
                <p className="text-sm text-muted-foreground">Umbral: ${rule.threshold.toLocaleString()} → {rule.recipient}</p>
              </div>
              <button onClick={() => handleDelete(rule.id)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="space-y-3">
          {MOCK_HISTORY.map((alert) => (
            <div key={alert.id} className="p-3 border rounded-lg text-sm flex justify-between items-center">
              <div className="flex items-center gap-2">
                {alert.severity === 'critical'
                  ? <AlertCircle className="h-4 w-4 text-red-500" />
                  : <AlertTriangle className="h-4 w-4 text-yellow-500" />
                }
                <span className="font-medium">{alert.service}</span>
                <span className="text-muted-foreground">${alert.actualValue.toLocaleString()}</span>
              </div>
              <span className="text-xs text-muted-foreground">{new Date(alert.triggeredAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
