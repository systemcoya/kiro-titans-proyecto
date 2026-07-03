import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  direction: 'up' | 'down' | 'stable' | null;
}

/**
 * Colored directional arrow indicating cost trend vs. previous week.
 */
export function TrendIndicator({ direction }: TrendIndicatorProps) {
  if (!direction) return null;

  switch (direction) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    case 'down':
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    case 'stable':
      return <Minus className="h-4 w-4 text-gray-400" />;
  }
}
