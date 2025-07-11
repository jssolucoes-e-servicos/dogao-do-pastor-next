"use client"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { APP_NAME } from "@/configs/version"
import {
  BarChart3,
  Calendar,
  ChefHat,
  DollarSign,
  Gift,
  Home,
  MessageSquare,
  QrCode,
  Settings,
  ShoppingCart,
  Ticket,
  Truck,
  UserCheck,
  Users
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const menuItems = [
  {
    title: "Dashboard",
    url: "/app",
    icon: Home,
  },
  {
    title: "PDV - Vendas",
    url: "/app/pdv",
    icon: DollarSign,
  },
  {
    title: "Vouchers",
    url: "/app/vouchers",
    icon: Gift,
  },
  {
    title: "Tickets",
    url: "/app/tickets",
    icon: Ticket,
  },
  {
    title: "Clientes",
    url: "/app/clientes",
    icon: Users,
  },
  {
    title: "Vendas",
    url: "/app/vendas",
    icon: ShoppingCart,
  },
  {
    title: "Fila de Produção",
    url: "/app/producao",
    icon: ChefHat,
  },
  {
    title: "Fila de Entregas",
    url: "/app/entregas",
    icon: Truck,
  },
  {
    title: "Entregadores",
    url: "/app/entregadores",
    icon: UserCheck,
  },
  {
    title: "QR Scanner",
    url: "/app/scanner",
    icon: QrCode,
  },
  {
    title: "Edições",
    url: "/app/edicoes",
    icon: Calendar,
  },
  {
    title: "WhatsApp",
    url: "/app/whatsapp",
    icon: MessageSquare,
  },
  {
    title: "Relatórios",
    url: "/app/relatorios",
    icon: BarChart3,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("user")
      window.location.href = "/acesso"
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="h-8 w-8 rounded-full bg-orange-600 flex items-center justify-center">
            <span className="text-white font-bold">🌭</span>
          </div>
          <div>
            <h2 className="font-semibold">{APP_NAME}</h2>
            <p className="text-xs text-muted-foreground">Sistema de Vouchers</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <div className="p-4">
          <Button variant="outline" className="w-full bg-transparent" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
