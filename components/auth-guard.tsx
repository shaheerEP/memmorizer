"use client"

import type React from "react"
import { useSession } from "next-auth/react"
import { Brain, Loader2 } from "lucide-react"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AuthGuardProps {
  children: React.ReactNode
}

// Public routes that don't require authentication
const publicRoutes = ['/login', '/auth/callback']

export function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // If not authenticated and not on a public route, redirect to login
    if (status === "unauthenticated" && !publicRoutes.includes(pathname)) {
      router.push("/login")
    }
  }, [status, pathname, router])

  // Show loading spinner while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-3 bg-primary rounded-full">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Loading StudyFlow...</p>
          </div>
        </div>
      </div>
    )
  }

  // If on a public route, always show the content
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>
  }

  // If authenticated, show the protected content
  if (status === "authenticated") {
    return <>{children}</>
  }

  // If not authenticated and not on public route, show nothing (will redirect)
  return null
}