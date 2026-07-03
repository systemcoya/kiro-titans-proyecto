import { Cpu, Zap, Clock } from 'lucide-react';
import type { AISpendItem } from '@/types';

interface ConsumptionMetricsProps {
  items: AISpendItem[];
}

/** Formats large numbers with locale separators. */
function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Displays consumption metrics (tokens, inferences, GPU-hours) per AI service.
 */
export function ConsumptionMetrics({ items }: ConsumptionMetricsProps) {
  const servicesWithMetrics = items.filter(
    (item) => item.tokens || item.inferences || item.gpuHours
  );

  if (servicesWithMetrics.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Métricas de Consumo</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicesWithMetrics.map((item) => (
          <div key={item.name} className="border rounded-lg p-4 space-y-2">
            <p className="font-medium text-sm truncate">{item.name}</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              {item.tokens !== undefined && item.tokens > 0 && (
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  <span>{formatNumber(item.tokens)} tokens</span>
                </div>
              )}
              {item.inferences !== undefined && item.inferences > 0 && (
                <div className="flex items-center gap-2">
                  <Cpu className="h-3 w-3" />
                  <span>{formatNumber(item.inferences)} inferencias</span>
                </div>
              )}
              {item.gpuHours !== undefined && item.gpuHours > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{item.gpuHours.toFixed(2)} GPU-hours</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
