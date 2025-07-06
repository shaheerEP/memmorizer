"use client"

import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AnalyticsAreaChartProps {
  data: {
    day: string
    items: number
  }[]
}

export function AnalyticsAreaChart({ data }: AnalyticsAreaChartProps) {
  return (
    <ChartContainer
      config={{
        items: {
          label: "Items Due",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.getDate().toString()
            }}
          />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="items"
            stroke="var(--color-items)"
            fill="var(--color-items)"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
