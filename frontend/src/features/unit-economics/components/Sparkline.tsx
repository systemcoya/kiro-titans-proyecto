import { LineChart, Line } from 'recharts';

interface SparklineProps {
  data: (number | null)[];
}

/**
 * Miniature line chart showing 8-week unit cost trend.
 */
export function Sparkline({ data }: SparklineProps) {
  const chartData = data.map((value, index) => ({ week: index, value }));

  return (
    <LineChart width={80} height={30} data={chartData}>
      <Line
        type="monotone"
        dataKey="value"
        stroke="#6366f1"
        strokeWidth={1.5}
        dot={false}
        connectNulls
      />
    </LineChart>
  );
}
