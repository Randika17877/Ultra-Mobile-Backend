"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive, ChartSkeleton } from "@/components/chart-area-interactive"
import { DataTable, DataTableSkeleton } from "@/components/data-table"
import { SectionCards, SectionCardsSkeleton } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"

type Order = {
  id: number
  orderId: string
  customer: string
  total: number
  status: string
  date: string
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [productCount, setProductCount] = useState(0)
  const [customerCount, setCustomerCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [ordersRes, productsRes, customersRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/products"),
          fetch("/api/customers"),
        ])
        const ordersData = ordersRes.ok ? await ordersRes.json() : []
        const productsData = productsRes.ok ? await productsRes.json() : { products: [] }
        const customersData = customersRes.ok ? await customersRes.json() : []
        setOrders(ordersData)
        setProductCount(productsData.products?.length ?? 0)
        setCustomerCount(Array.isArray(customersData) ? customersData.length : 0)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {loading ? (
                <>
                  <SectionCardsSkeleton />
                  <div className="px-4 lg:px-6"><ChartSkeleton /></div>
                  <DataTableSkeleton />
                </>
              ) : error ? (
                <div className="flex h-64 items-center justify-center px-6">
                  <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                    <p className="font-medium text-red-700">Failed to load dashboard</p>
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <SectionCards orders={orders} productCount={productCount} customerCount={customerCount} />
                  <div className="px-4 lg:px-6">
                    <ChartAreaInteractive orders={orders} />
                  </div>
                  <DataTable data={orders} />
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
