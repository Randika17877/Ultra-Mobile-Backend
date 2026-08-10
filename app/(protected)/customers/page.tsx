"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { IconSearch, IconRefresh } from "@tabler/icons-react"

type Customer = {
  uid: string
  name: string
  email: string
  profilePicUrl?: string
  createdAt?: string
  orderCount?: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filtered, setFiltered] = useState<Customer[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/customers")
      const data = await res.json()
      setCustomers(data)
      setFiltered(data)
    } catch {
      toast.error("Failed to load customers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCustomers() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(customers.filter((c) =>
      c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
    ))
  }, [search, customers])

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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers..."
                className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={fetchCustomers}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <IconRefresh size={15} />
              Refresh
            </button>
          </div>

          <p className="text-sm text-muted-foreground">{filtered.length} customers</p>

          {loading ? (
            <div className="rounded-xl border bg-card">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-48 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">User ID</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-16 text-muted-foreground">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => (
                      <tr key={c.uid} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 text-white text-sm font-semibold flex-shrink-0">
                              {c.name?.[0]?.toUpperCase() || c.email?.[0]?.toUpperCase() || "?"}
                            </div>
                            <span className="font-medium">{c.name || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{c.email || "—"}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {c.uid?.slice(0, 12)}...
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-sm">
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleDateString("en-LK", {
                                day: "2-digit", month: "short", year: "numeric",
                              })
                            : "—"}
                        </td>
                      </tr>
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
