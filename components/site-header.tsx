"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { usePathname } from "next/navigation"

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/products": "Products",
  "/products/add": "Add Product",
  "/categories": "Categories",
  "/orders": "Orders",
  "/customers": "Customers",
  "/users": "Users",
}

export function SiteHeader() {
  const pathname = usePathname()
  const title = titles[pathname] ?? "Ultra Mobile Admin"

  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-sm px-4 transition-[width,height] ease-linear sticky top-0 z-10">
      <div className="flex items-center gap-2 flex-1">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-600">Live</span>
        </div>
      </div>
    </header>
  )
}
