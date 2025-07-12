"use client"

import type React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { Navbar } from "@/components/navbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { VersionFooter } from "@/components/version-footer"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function ClientAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const auth = localStorage.getItem("isAuthenticated")
        if (auth === "true") {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(true)
          //router.push("/acesso")
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-800"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push("/acesso")
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-6">{children}</main>
        <VersionFooter />
      </SidebarInset>
    </SidebarProvider>
  )
}
