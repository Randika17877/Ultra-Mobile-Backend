"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { IconPlus, IconTrash, IconEdit, IconX, IconCheck } from "@tabler/icons-react"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"

type Category = {
  id: string
  name: string
  imageUrl?: string
  productCount?: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [newImageUrl, setNewImageUrl] = useState("")
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editImageUrl, setEditImageUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      setCategories(data.categories || [])
    } catch {
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const handleAdd = async () => {
    if (!newName.trim()) return toast.error("Category name is required")
    setAdding(true)
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), imageUrl: newImageUrl.trim() }),
      })
      if (!res.ok) throw new Error()
      toast.success("Category added!")
      setNewName("")
      setNewImageUrl("")
      fetchCategories()
    } catch {
      toast.error("Failed to add category")
    } finally {
      setAdding(false)
    }
  }

  const startEdit = (cat: Category) => {
    setEditId(cat.id)
    setEditName(cat.name)
    setEditImageUrl(cat.imageUrl || "")
  }

  const handleUpdate = async () => {
    if (!editId || !editName.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, name: editName.trim(), imageUrl: editImageUrl.trim() }),
      })
      if (!res.ok) throw new Error()
      toast.success("Category updated!")
      setEditId(null)
      fetchCategories()
    } catch {
      toast.error("Failed to update category")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Category deleted")
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch {
      toast.error("Failed to delete category")
    } finally {
      setDeleting(null)
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
        <div className="flex flex-1 flex-col p-4 lg:p-6 gap-6 max-w-3xl">
          {/* Add new */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold mb-4">Add New Category</h3>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Category name (e.g. Smartphones)"
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Image URL (optional)"
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={handleAdd}
                disabled={adding}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <IconPlus size={16} />
                {adding ? "Adding..." : "Add"}
              </button>
            </div>
          </div>

          {/* List */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30">
              <p className="text-sm font-medium">{categories.length} categories</p>
            </div>
            {loading ? (
              <div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
                    <div className="h-12 w-12 rounded-lg bg-muted animate-pulse" />
                    <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                    <div className="ml-auto h-4 w-20 rounded bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                No categories yet. Add your first one above!
              </div>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-4 p-4 border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    <ImageWithFallback src={cat.imageUrl} alt={cat.name} width={48} height={48} />
                  </div>

                  {editId === cat.id ? (
                    <div className="flex flex-1 gap-2">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                        autoFocus
                      />
                      <input
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                        placeholder="Image URL"
                        className="flex-1 rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button onClick={handleUpdate} disabled={saving} className="p-1.5 text-green-600 hover:text-green-700">
                        <IconCheck size={16} />
                      </button>
                      <button onClick={() => setEditId(null)} className="p-1.5 text-muted-foreground hover:text-foreground">
                        <IconX size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="font-medium">{cat.name}</p>
                        {cat.productCount !== undefined && (
                          <p className="text-xs text-muted-foreground">{cat.productCount} products</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <IconEdit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          disabled={deleting === cat.id}
                          className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          <IconTrash size={15} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
