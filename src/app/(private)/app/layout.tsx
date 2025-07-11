import { Toaster } from "@/components/toaster"
import "@/styles/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import ClientAppLayout from "./client-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dogão do Pastor - Sistema",
  description: "Sistema de gerenciamento Dogão do Pastor",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={inter.className}>
        <ClientAppLayout>{children}</ClientAppLayout>
        <Toaster />
      </body>
    </html>
  )
}
