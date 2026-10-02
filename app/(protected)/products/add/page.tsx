"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { IconArrowLeft, IconPlus, IconTrash, IconUpload, IconX } from "@tabler/icons-react"
import Link from "next/link"
import Image from "next/image"
import { formatImageUrl } from "@/lib/utils"

type Category = { id: string; name: string }
type AttributeValue = string
type Attribute = { name: string; type: string; values: AttributeValue[] }

export default function AddProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("id")
  const isEdit = !!editId

  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [stockCount, setStockCount] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [attributes, setAttributes] = useState<Attribute[]>([])

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((d) => {
      setCategories(d.categories || [])
    })

    if (editId) {
      fetch("/api/products").then((r) => r.json()).then((d) => {
        const product = d.products?.find((p: { id: string, title?: string, price?: number, stockCount?: number, images?: string[], description?: string, categoryId?: string, categoryDocId?: string, attributes?: Attribute[] }) => p.id === editId)
        if (product) {
          setTitle(product.title || "")
          setDescription(product.description || "")
          setPrice(String(product.price || ""))
          setCategoryId(product.categoryDocId || product.categoryId || "")
          setStockCount(String(product.stockCount || ""))
          setImages(product.images || [])
          setAttributes(product.attributes || [])
        }
      })
    }
  }, [editId])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body: formData })
        const data = await res.json()
        if (data.url) {
          setImages((prev) => [...prev, data.url])
        } else {
          toast.error("Failed to upload image")
        }
      }
    } catch {
      toast.error("Upload error")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const addAttribute = () => {
    setAttributes((prev) => [...prev, { name: "", type: "text", values: [""] }])
  }

  const removeAttribute = (idx: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateAttr = (idx: number, field: keyof Attribute, value: string) => {
    setAttributes((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a))
    )
  }

  const addAttrValue = (idx: number) => {
    setAttributes((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, values: [...a.values, ""] } : a))
    )
  }

  const updateAttrValue = (attrIdx: number, valIdx: number, value: string) => {
    setAttributes((prev) =>
      prev.map((a, i) =>
        i === attrIdx
          ? { ...a, values: a.values.map((v, j) => (j === valIdx ? value : v)) }
          : a
      )
    )
  }

  const removeAttrValue = (attrIdx: number, valIdx: number) => {
    setAttributes((prev) =>
      prev.map((a, i) =>
        i === attrIdx ? { ...a, values: a.values.filter((_, j) => j !== valIdx) } : a
      )
    )
  }

  const handleSubmit = async () => {
    if (!title.trim()) return toast.error("Product title is required")
    if (!price || isNaN(Number(price))) return toast.error("Valid price is required")
    if (!categoryId) return toast.error("Please select a category")

    setSaving(true)
    try {
      const payload = {
        ...(isEdit ? { id: editId } : {}),
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        categoryId,
        stockCount: Number(stockCount) || 0,
        images,
        attributes,
        updatedAt: new Date().toISOString(),
        ...(!isEdit ? { createdAt: new Date().toISOString(), status: true, rating: 0, reviewCount: 0 } : {}),
      }

      const res = await fetch("/api/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error()
      toast.success(isEdit ? "Product updated!" : "Product added!")
      router.push("/products")
    } catch {
      toast.error("Failed to save product")
    } finally {
      setSaving(false)
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
        <div className="flex flex-1 flex-col p-4 lg:p-6 gap-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            >
              <IconArrowLeft size={18} />
            </Link>
            <h2 className="text-lg font-semibold">{isEdit ? "Edit Product" : "Add New Product"}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main form */}
            <div className="lg:col-span-2 space-y-5">
              {/* Basic Info */}
              <div className="rounded-xl border bg-card p-5 space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Basic Information</h3>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Product Name *</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Samsung Galaxy S24 Ultra"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Product description..."
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Base Price (LKR) *</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Stock Count</label>
                    <input
                      type="number"
                      value={stockCount}
                      onChange={(e) => setStockCount(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Attributes */}
              <div className="rounded-xl border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Product Attributes
                  </h3>
                  <button
                    onClick={addAttribute}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80"
                  >
                    <IconPlus size={14} /> Add Attribute
                  </button>
                </div>

                {attributes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No attributes yet. Add attributes like Storage, Color, RAM, etc.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {attributes.map((attr, attrIdx) => (
                      <div key={attrIdx} className="rounded-lg border p-4 space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <input
                              value={attr.name}
                              onChange={(e) => updateAttr(attrIdx, "name", e.target.value)}
                              placeholder="Attribute name (e.g. Storage)"
                              className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />
                            <select
                              value={attr.type}
                              onChange={(e) => updateAttr(attrIdx, "type", e.target.value)}
                              className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                              <option value="text">Text</option>
                              <option value="color">Color</option>
                              <option value="size">Size</option>
                              <option value="number">Number</option>
                            </select>
                          </div>
                          <button
                            onClick={() => removeAttribute(attrIdx)}
                            className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <IconTrash size={15} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {attr.values.map((val, valIdx) => (
                            <div key={valIdx} className="flex items-center gap-1">
                              <input
                                value={val}
                                onChange={(e) => updateAttrValue(attrIdx, valIdx, e.target.value)}
                                placeholder="Value"
                                className="rounded-md border bg-background px-2 py-1 text-xs w-24 outline-none focus:ring-2 focus:ring-ring"
                              />
                              {attr.values.length > 1 && (
                                <button
                                  onClick={() => removeAttrValue(attrIdx, valIdx)}
                                  className="text-muted-foreground hover:text-red-500"
                                >
                                  <IconX size={12} />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => addAttrValue(attrIdx)}
                            className="text-xs text-primary hover:text-primary/80 flex items-center gap-0.5"
                          >
                            <IconPlus size={12} /> Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar: Images + Actions */}
            <div className="space-y-5">
              {/* Images */}
              <div className="rounded-xl border bg-card p-5 space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Product Images</h3>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <IconUpload size={24} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {uploading ? "Uploading..." : "Click to upload images"}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG up to 10MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((url, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden bg-muted aspect-square">
                        <Image src={formatImageUrl(url)} alt={`Image ${i + 1}`} fill className="object-cover" unoptimized />
                        <button
                          onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <IconX size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="rounded-xl border bg-card p-5 space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={saving || uploading}
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : isEdit ? "Update Product" : "Add Product"}
                </button>
                <Link
                  href="/products"
                  className="block w-full text-center rounded-lg border py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
