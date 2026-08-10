"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Order = {
  id: number
  orderId: string
  customer: string
  total: number
  status: string
  date: string
}

const statusColor: Record<string, string> = {
  PAID: "bg-green-500/10 text-green-700 border-green-200",
  PENDING: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  SHIPPED: "bg-blue-500/10 text-blue-700 border-blue-200",
  DELIVERED: "bg-cyan-500/10 text-cyan-700 border-cyan-200",
  CANCELLED: "bg-red-500/10 text-red-700 border-red-200",
  REFUNDED: "bg-gray-500/10 text-gray-700 border-gray-200",
}

export function DataTable({ data }: { data: Order[] }) {
  const recent = data.slice(0, 10)

  return (
    <div className="px-4 lg:px-6">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                recent.map((order) => (
                  <TableRow key={order.orderId || order.id} className="hover:bg-muted/30">
                    <TableCell className="pl-6 font-mono text-xs font-medium">
                      #{(order.orderId || String(order.id)).slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell className="font-medium">{order.customer || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {order.date
                        ? new Date(order.date).toLocaleDateString("en-LK", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          statusColor[order.status?.toUpperCase()] ||
                          "bg-gray-500/10 text-gray-600 border-gray-200"
                        }`}
                      >
                        {order.status || "UNKNOWN"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6 font-semibold">
                      LKR {(order.total || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export function DataTableSkeleton() {
  return (
    <div className="px-4 lg:px-6">
      <Card className="border shadow-sm">
        <CardHeader>
          <div className="h-5 w-32 rounded bg-muted animate-pulse" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-4 px-6 py-3 border-b last:border-0">
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                <div className="h-4 w-20 rounded bg-muted animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Re-export Badge so other files can use it
export { Badge }
