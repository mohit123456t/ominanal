'use client';

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { EngagementData } from '@/lib/types';

type EngagementRateChartProps = {
  data: EngagementData[];
};

export function EngagementRateChart({ data }: EngagementRateChartProps) {
    const chartConfig = {
      likes: {
        label: "Likes",
        color: "hsl(var(--chart-1))",
      },
      comments: {
        label: "Comments",
        color: "hsl(var(--chart-2))",
      }
    } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="platform"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
        />
        <YAxis />
        <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
        <Legend />
        <Bar dataKey="likes" fill="var(--color-likes)" radius={4} />
        <Bar dataKey="comments" fill="var(--color-comments)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
