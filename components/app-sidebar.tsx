"use client"

import * as React from "react"
import {
  IconDashboard,
  IconFolder,
  IconReport,
  IconUsers,
  IconUserCircle,
  IconCategory,
  IconLogout,
  IconDeviceMobile,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

const navItems = [
  { title: "Dashboard", url: "/", icon: IconDashboard },
  { title: "Products", url: "/products", icon: IconFolder },
  { title: "Categories", url: "/categories", icon: IconCategory },
  { title: "Orders", url: "/orders", icon: IconReport },
  { title: "Customers", url: "/customers", icon: IconUsers },
  { title: "Users", url: "/users", icon: IconUserCircle },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await logout()
    router.push("/sign-in")
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 hover:bg-transparent"
            >
              <Link href="/" className="hover:bg-transparent flex items-center gap-2 px-2 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 shadow-lg">
                  <IconDeviceMobile size={22} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white leading-tight">Ultra Mobile</span>
                  <span className="text-[10px] text-blue-300 leading-tight">Admin Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-3 p-4 border-t border-sidebar-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-sm font-semibold shadow">
            {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {user?.displayName || "Admin"}
            </p>
            <p className="text-xs text-blue-300 truncate">
              {user?.email || ""}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-blue-300 hover:text-white transition-colors p-1 rounded"
            title="Sign out"
          >
            <IconLogout size={18} />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
