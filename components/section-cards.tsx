"use client"

import {
  IconTrendingUp,
  IconShoppingCart,
  IconUsers,
  IconCurrencyDollar,
} from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
  productCount?: number
  customerCount?: number
}

export function SectionCards({ orders, productCount = 0, customerCount = 0 }: Props) {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const totalOrders = orders.length
  const pendingOrders = orders.filter(
    (o) => o.status === "PENDING" || o.status === "pending"
  ).length

  const cards = [
    {
      title: "Total Revenue",
      value: `LKR ${totalRevenue.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`,
      icon: IconCurrencyDollar,
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      sub: `${totalOrders} orders`,
    },
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      icon: IconShoppingCart,
      color: "from-indigo-500 to-blue-500",
      bg: "bg-indigo-500/10",
      iconColor: "text-indigo-600",
      sub: `${pendingOrders} pending`,
    },
    {
      title: "Customers",
      value: customerCount.toLocaleString(),
      icon: IconUsers,
      color: "from-cyan-500 to-teal-500",
      bg: "bg-cyan-500/10",
      iconColor: "text-cyan-600",
      sub: "registered users",
    },
    {
      title: "Products",
      value: productCount.toLocaleString(),
      icon: IconTrendingUp,
      color: "from-sky-500 to-blue-600",
      bg: "bg-sky-500/10",
      iconColor: "text-sky-600",
      sub: "active listings",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
      {cards.map((card) => (
        <Card key={card.title} className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${card.bg}`}>
              <card.icon size={18} className={card.iconColor} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function SectionCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-7 w-32 rounded bg-muted animate-pulse mb-2" />
            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
