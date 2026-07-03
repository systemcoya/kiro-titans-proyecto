import type { AISpendItem } from '@/types';

interface SpendBreakdownProps {
  items: AISpendItem[];
  totalCost: number;
}

/** Formats a number as USD currency. */
function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

/**
 * Displays the AI spend breakdown as a table with name, cost, and percentage.
 */
export function SpendBreakdown({ items, totalCost }: SpendBreakdownProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay datos de gasto para los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Desglose de Gasto</h3>
        <span className="text-xl font-bold text-primary">{formatUsd(totalCost)}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-3 px-2">Nombre</th>
              <th className="py-3 px-2 text-right">Costo USD</th>
              <th className="py-3 px-2 text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.name} className="border-b hover:bg-muted/50">
                <td className="py-3 px-2 font-medium">{item.name}</td>
                <td className="py-3 px-2 text-right">{formatUsd(item.costUsd)}</td>
                <td className="py-3 px-2 text-right">{item.percentage.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
