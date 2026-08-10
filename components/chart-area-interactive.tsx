"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Order = {
  id: number
  orderId: string
  customer: string
  total: number
  status: string
  date: string
}

type Props = {
  orders: Order[]
}

function buildChartData(orders: Order[]) {
  const map: Record<string, number> = {}

  orders.forEach((order) => {
    const raw = order.date || ""
    let label = ""
    try {
      const d = new Date(raw)
      if (!isNaN(d.getTime())) {
        label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      } else {
        label = raw.slice(0, 10)
      }
    } catch {
      label = raw.slice(0, 10)
    }
    if (!label) return
    map[label] = (map[label] || 0) + (order.total || 0)
  })

  return Object.entries(map)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-14)
    .map(([date, revenue]) => ({ date, revenue: Math.round(revenue) }))
}

export function ChartAreaInteractive({ orders }: Props) {
  const data = buildChartData(orders)
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-0.5">
              Daily revenue — last 14 days
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              LKR {totalRevenue.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">total revenue</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
            No revenue data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [
                  `LKR ${value.toLocaleString()}`,
                  "Revenue",
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

export function ChartSkeleton() {
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <div className="h-5 w-40 rounded bg-muted animate-pulse mb-2" />
        <div className="h-4 w-56 rounded bg-muted animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-60 rounded bg-muted animate-pulse" />
      </CardContent>
    </Card>
  )
}
