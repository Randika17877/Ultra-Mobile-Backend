import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-6xl">🔒</div>
      <h1 className="text-2xl font-bold">Access Denied</h1>
      <p className="text-muted-foreground max-w-sm">
        You do not have admin access to Ultra Mobile Admin. Please contact the system administrator.
      </p>
      <Link href="/sign-in" className="mt-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
        Back to Sign In
      </Link>
    </div>
  )
}
