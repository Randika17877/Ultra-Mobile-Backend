"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import Link from "next/link"
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconRefresh,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react"
import Image from "next/image"

type Product = {
  id: string
  productId: string
  title: string
  description: string
  price: number
  stockCount: number
  categoryName: string
  categoryId: string
  images: string[]
  status: boolean
  rating: number
  reviewCount: number
  createdAt: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/products")
      const data = await res.json()
      setProducts(data.products || [])
      setFiltered(data.products || [])
    } catch {
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      products.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q)
      )
    )
  }, [search, products])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Product deleted")
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch {
      toast.error("Failed to delete product")
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleActive = async (product: Product) => {
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, status: !product.status }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Product ${product.status ? "deactivated" : "activated"}`)
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: !p.status } : p))
      )
    } catch {
      toast.error("Failed to update product")
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchProducts}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                <IconRefresh size={15} />
                Refresh
              </button>
              <Link
                href="/products/add"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <IconPlus size={16} />
                Add Product
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{products.length} total</span>
            <span>•</span>
            <span>{products.filter((p) => p.status).length} active</span>
            <span>•</span>
            <span>{products.filter((p) => !p.status).length} inactive</span>
          </div>

          {/* Table */}
          {loading ? (
            <div className="rounded-xl border bg-card">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
                  <div className="h-12 w-12 rounded-lg bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                  </div>
                  <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stock</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rating</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-muted-foreground">
                        {search ? "No products match your search." : "No products yet. Add your first product!"}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                              {p.images?.[0] ? (
                                <Image
                                  src={p.images[0]}
                                  alt={p.title}
                                  width={48}
                                  height={48}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                                  IMG
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium leading-tight">{p.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-[200px]">
                                {p.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.categoryName || "—"}</td>
                        <td className="px-4 py-3 font-semibold">
                          LKR {(p.price || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={p.stockCount === 0 ? "text-red-500 font-medium" : ""}>
                            {p.stockCount ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                              p.status
                                ? "bg-green-500/10 text-green-700 border-green-200"
                                : "bg-gray-500/10 text-gray-600 border-gray-200"
                            }`}
                          >
                            {p.status ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          ⭐ {(p.rating || 0).toFixed(1)} ({p.reviewCount || 0})
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => handleToggleActive(p)}
                              title={p.status ? "Deactivate" : "Activate"}
                              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {p.status ? <IconEyeOff size={15} /> : <IconEye size={15} />}
                            </button>
                            <Link
                              href={`/products/add?id=${p.id}`}
                              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <IconEdit size={15} />
                            </Link>
                            <button
                              onClick={() => handleDelete(p.id, p.title)}
                              disabled={deleting === p.id}
                              className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50"
                            >
                              <IconTrash size={15} />
                            </button>
                          </div>
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
