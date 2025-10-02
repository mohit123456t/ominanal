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
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { EngagementData } from '@/lib/types';

type FollowerGrowthChartProps = {
  data: { date: string; followers: number }[];
};

export function FollowerGrowthChart({ data }: FollowerGrowthChartProps) {
  const chartConfig = {
    followers: {
      label: 'Followers',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="followers"
          stroke={chartConfig.followers.color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}

type EngagementRateChartProps = {
  data: EngagementData[];
};

export function EngagementRateChart({ data }: EngagementRateChartProps) {
    const chartConfig = {
      likes: {
        label: "Likes",
        color: "hsl(var(--primary))",
      },
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
        <Bar dataKey="likes" fill="var(--color-likes)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

type ReachAndImpressionsChartProps = {
  data: { month: string; reach: number; impressions: number }[];
};

export function ReachAndImpressionsChart({ data }: ReachAndImpressionsChartProps) {
  const chartConfig = {
    reach: {
      label: 'Reach',
      color: 'hsl(var(--accent))',
    },
    impressions: {
      label: 'Impressions',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickFormatter={(value) => value.toLocaleString()}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="impressions"
          stackId="1"
          stroke={chartConfig.impressions.color}
          fill={chartConfig.impressions.color}
          fillOpacity={0.4}
        />
        <Area
          type="monotone"
          dataKey="reach"
          stackId="1"
          stroke={chartConfig.reach.color}
          fill={chartConfig.reach.color}
          fillOpacity={0.4}
        />
      </AreaChart>
    </ChartContainer>
  );
}
