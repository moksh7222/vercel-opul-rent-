"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts"
import { ChartTooltip } from "@/components/ui/chart"

interface InvestmentChartProps {
  data: number[]
  chartType: "line" | "bar"
  labels?: string[]
}

export default function InvestmentChart({ data, chartType, labels }: InvestmentChartProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (chartType === "line") {
      // For line chart, create data points for years
      const lineData = data.map((value, index) => ({
        year: `Year ${index + 1}`,
        value,
      }))
      setChartData(lineData)
    } else {
      // For bar chart, use provided labels or generate default ones
      const barData = data.map((value, index) => ({
        name: labels ? labels[index] : `Metric ${index + 1}`,
        value,
      }))
      setChartData(barData)
    }
  }, [data, chartType, labels])

  if (!mounted) return null

  const textColor = theme === "dark" ? "#f8fafc" : "#0f172a"
  const gridColor = theme === "dark" ? "#334155" : "#e2e8f0"

  return (
    <ResponsiveContainer width="100%" height="100%">
      {chartType === "line" ? (
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="year" stroke={textColor} fontSize={12} tickLine={false} />
          <YAxis
            stroke={textColor}
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      ) : (
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} />
          <YAxis
            stroke={textColor}
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
        </BarChart>
      )}
    </ResponsiveContainer>
  )
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) {
    return null
  }

  return (
    <ChartTooltip>
      <div className="font-medium">{label}</div>
      <div className="text-sm text-muted-foreground">${payload[0].value?.toLocaleString()}</div>
    </ChartTooltip>
  )
}
