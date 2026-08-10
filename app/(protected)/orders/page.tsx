"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { IconSearch, IconRefresh, IconChevronDown } from "@tabler/icons-react"

type OrderItem = {
  productId: string
  quantity: number
  unitPrice: number
  attributes?: { name: string; value: string }[]
}

type Address = {
  name: string
  email: string
  contact: string
  address1: string
  address2?: string
  city: string
  postcode: string
}

type Order = {
  id: number
  docId: string
  orderId: string
  customer: string
  total: number
  status: string
  date: string
  orderItems?: OrderItem[]
  shippingAddress?: Address
}

const STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]

const statusColor: Record<string, string> = {
  PAID: "bg-green-500/10 text-green-700 border-green-200",
  PENDING: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  SHIPPED: "bg-blue-500/10 text-blue-700 border-blue-200",
  DELIVERED: "bg-cyan-500/10 text-cyan-700 border-cyan-200",
  CANCELLED: "bg-red-500/10 text-red-700 border-red-200",
  REFUNDED: "bg-gray-500/10 text-gray-600 border-gray-200",
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filtered, setFiltered] = useState<Order[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/orders")
      const data = await res.json()
      setOrders(data)
      setFiltered(data)
    } catch {
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      orders.filter((o) => {
        const matchSearch =
          o.orderId?.toLowerCase().includes(q) ||
          o.customer?.toLowerCase().includes(q)
        const matchStatus =
          statusFilter === "ALL" || o.status?.toUpperCase() === statusFilter
        return matchSearch && matchStatus
      })
    )
  }, [search, statusFilter, orders])

  const handleStatusChange = async (order: Order, newStatus: string) => {
    setUpdatingStatus(order.docId)
    try {
      const res = await fetch(`/api/orders/${order.docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Order status updated to ${newStatus}`)
      setOrders((prev) =>
        prev.map((o) =>
          o.docId === order.docId ? { ...o, status: newStatus } : o
        )
      )
    } catch {
      toast.error("Failed to update order status")
    } finally {
      setUpdatingStatus(null)
    }
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 lg:p-6 gap-4">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order ID or customer..."
                className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="ALL">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={fetchOrders}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <IconRefresh size={15} />
              Refresh
            </button>
          </div>

          <p className="text-sm text-muted-foreground">{filtered.length} orders</p>

          {/* Orders table */}
          {loading ? (
            <div className="rounded-xl border bg-card">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
                  <div className="h-4 w-28 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-24 rounded bg-muted animate-pulse ml-auto" />
                  <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground w-8" />
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order ID</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-muted-foreground">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((order) => (
                      <>
                        <tr
                          key={order.docId}
                          className="border-b hover:bg-muted/20 transition-colors cursor-pointer"
                          onClick={() =>
                            setExpanded(expanded === order.docId ? null : order.docId)
                          }
                        >
                          <td className="px-4 py-3">
                            <IconChevronDown
                              size={14}
                              className={`text-muted-foreground transition-transform ${
                                expanded === order.docId ? "rotate-180" : ""
                              }`}
                            />
                          </td>
                          <td className="px-4 py-3 font-mono text-xs font-medium">
                            #{(order.orderId || String(order.id)).slice(-8).toUpperCase()}
                          </td>
                          <td className="px-4 py-3 font-medium">{order.customer || "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground text-sm">
                            {order.date
                              ? new Date(order.date).toLocaleDateString("en-LK", {
                                  day: "2-digit", month: "short", year: "numeric",
                                })
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                statusColor[order.status?.toUpperCase()] ||
                                "bg-gray-500/10 text-gray-600 border-gray-200"
                              }`}
                            >
                              {order.status || "UNKNOWN"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            LKR {(order.total || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={order.status?.toUpperCase() || "PENDING"}
                              onChange={(e) => handleStatusChange(order, e.target.value)}
                              disabled={updatingStatus === order.docId}
                              className="rounded-md border bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                        {expanded === order.docId && (
                          <tr key={`${order.docId}-detail`} className="bg-muted/10">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {order.shippingAddress && (
                                  <div>
                                    <p className="font-medium mb-1">Shipping Address</p>
                                    <div className="text-muted-foreground space-y-0.5">
                                      <p>{order.shippingAddress.name}</p>
                                      <p>{order.shippingAddress.email}</p>
                                      <p>{order.shippingAddress.contact}</p>
                                      <p>{order.shippingAddress.address1}</p>
                                      {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                                      <p>{order.shippingAddress.city}, {order.shippingAddress.postcode}</p>
                                    </div>
                                  </div>
                                )}
                                {order.orderItems && order.orderItems.length > 0 && (
                                  <div>
                                    <p className="font-medium mb-1">Order Items ({order.orderItems.length})</p>
                                    <div className="space-y-1">
                                      {order.orderItems.map((item, i) => (
                                        <div key={i} className="text-muted-foreground">
                                          <span className="font-mono text-xs">{item.productId?.slice(-6)}</span>
                                          {" — "}Qty: {item.quantity} × LKR {item.unitPrice?.toLocaleString()}
                                          {item.attributes?.map((a) => (
                                            <span key={a.name} className="ml-1 text-xs bg-muted rounded px-1">
                                              {a.name}: {a.value}
                                            </span>
                                          ))}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
