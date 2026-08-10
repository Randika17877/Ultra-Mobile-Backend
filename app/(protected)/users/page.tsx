"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { IconRefresh, IconShield, IconUser } from "@tabler/icons-react"

type AdminUser = {
  uid: string
  email: string
  displayName?: string
  role: "admin" | "user"
  createdAt?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/users")
      const data = await res.json()
      setUsers(data.users || [])
    } catch {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleCreateAdmin = async () => {
    if (!newEmail.trim() || !newPassword.trim()) return toast.error("Email and password are required")
    setCreating(true)
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim(), password: newPassword, displayName: newName.trim(), role: "admin" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      toast.success("Admin user created!")
      setNewEmail("")
      setNewPassword("")
      setNewName("")
      fetchUsers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create user")
    } finally {
      setCreating(false)
    }
  }

  const handleToggleRole = async (user: AdminUser) => {
    const newRole = user.role === "admin" ? "user" : "admin"
    if (!confirm(`Change ${user.email} role to "${newRole}"?`)) return
    setToggling(user.uid)
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, role: newRole }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Role updated to ${newRole}`)
      setUsers((prev) =>
        prev.map((u) => (u.uid === user.uid ? { ...u, role: newRole } : u))
      )
    } catch {
      toast.error("Failed to update role")
    } finally {
      setToggling(null)
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
          {/* Create admin */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold mb-1">Create Admin User</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add a new user with admin access to this dashboard.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Display name"
                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Email address *"
                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password *"
                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={handleCreateAdmin}
              disabled={creating}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <IconShield size={16} />
              {creating ? "Creating..." : "Create Admin"}
            </button>
          </div>

          {/* Users table */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
              <p className="text-sm font-medium">{users.length} admin users</p>
              <button onClick={fetchUsers} className="text-muted-foreground hover:text-foreground transition-colors">
                <IconRefresh size={15} />
              </button>
            </div>
            {loading ? (
              <div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
                    <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-48 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No admin users found. Create one above.
              </div>
            ) : (
              users.map((u) => (
                <div key={u.uid} className="flex items-center gap-4 p-4 border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-semibold flex-shrink-0 ${
                    u.role === "admin"
                      ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                      : "bg-gradient-to-br from-gray-400 to-gray-500"
                  }`}>
                    {u.role === "admin" ? (
                      <IconShield size={16} />
                    ) : (
                      <IconUser size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{u.displayName || "Unnamed"}</p>
                    <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      u.role === "admin"
                        ? "bg-blue-500/10 text-blue-700 border-blue-200"
                        : "bg-gray-500/10 text-gray-600 border-gray-200"
                    }`}>
                      {u.role}
                    </span>
                    <button
                      onClick={() => handleToggleRole(u)}
                      disabled={toggling === u.uid}
                      className="text-xs text-muted-foreground hover:text-foreground underline transition-colors disabled:opacity-50"
                    >
                      {u.role === "admin" ? "Demote" : "Make Admin"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
