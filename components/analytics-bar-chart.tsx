"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AnalyticsBarChartProps {
  data: {
    subject: string
    completed: number
    total: number
  }[]
}

export function AnalyticsBarChart({ data }: AnalyticsBarChartProps) {
  return (
    <ChartContainer
      config={{
        completed: {
          label: "Completed",
          color: "hsl(var(--chart-1))",
        },
        total: {
          label: "Total",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="subject" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="total" fill="var(--color-total)" opacity={0.3} />
          <Bar dataKey="completed" fill="var(--color-completed)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
