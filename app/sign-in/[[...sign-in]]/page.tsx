"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { IconDeviceMobile, IconEye, IconEyeOff } from "@tabler/icons-react"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    if (!email || !password) return toast.error("Enter email and password")
    setLoading(true)
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth")
      const { getFirebaseAuth } = await import("@/lib/firebase")
      const auth = await getFirebaseAuth()
      await signInWithEmailAndPassword(auth, email, password)
      toast.success("Signed in successfully")
      router.push("/")
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") {
        toast.error("Invalid email or password")
      } else {
        toast.error("Sign-in failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-blue-500/20" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-cyan-500/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-blue-400/10" />
        </div>
        <div className="relative z-10 text-center text-white">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm mb-6 shadow-xl">
            <IconDeviceMobile size={42} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Ultra Mobile</h1>
          <p className="text-xl text-blue-200 mb-8">Admin Dashboard</p>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4">
              <p className="text-2xl font-bold">📦</p>
              <p className="text-sm text-blue-200 mt-1">Products</p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4">
              <p className="text-2xl font-bold">🛒</p>
              <p className="text-sm text-blue-200 mt-1">Orders</p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4">
              <p className="text-2xl font-bold">👥</p>
              <p className="text-sm text-blue-200 mt-1">Customers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg mb-4 lg:hidden">
              <IconDeviceMobile size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to Ultra Mobile Admin</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ultramobile.lk"
                className="w-full rounded-xl border bg-muted/30 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border bg-muted/30 px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3 text-sm font-semibold text-white hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Access restricted to authorized administrators only.
          </p>
        </div>
      </div>
    </div>
  )
}
