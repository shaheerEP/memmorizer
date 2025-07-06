import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthGuard } from "@/components/auth-guard"
import SessionProviderWrapper from "@/components/session-provider-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "StudyFlow - Spaced Repetition Study App",
  description: "Master your learning with intelligent spaced repetition",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SessionProviderWrapper>
            <AuthGuard>{children}</AuthGuard>
          </SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}