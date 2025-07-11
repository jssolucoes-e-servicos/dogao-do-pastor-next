"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Gift, CheckCircle, Calendar, QrCode, DollarSign, AlertTriangle } from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/seed?t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const availableCount = stats?.availableCount || 0
  const isLowStock = availableCount <= 50
  const isOutOfStock = availableCount <= 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema Dogão do Pastor</p>
      </div>

      {/* Status da Edição Ativa */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {stats?.activeEdition?.nome || "Edição Ativa"}
              </CardTitle>
              <CardDescription>Status da edição atual</CardDescription>
            </div>
            <Badge variant="default">Ativa</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Horário de Funcionamento</p>
              <p className="text-lg font-semibold">
                {stats?.activeEdition?.horaInicio || "10:00"} - {stats?.activeEdition?.horaTermino || "22:00"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor do Dogão</p>
              <p className="text-lg font-semibold">R$ {(stats?.activeEdition?.valorDog || 19.99).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Limite da Edição</p>
              <p className="text-lg font-semibold">{stats?.activeEdition?.limiteEdicao || 1000} unidades</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vendidos (que contam)</p>
              <p className="text-lg font-semibold">{stats?.totalSoldCount || 0} unidades</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerta de Estoque */}
      {(isLowStock || isOutOfStock) && (
        <Card className={`border-l-4 ${isOutOfStock ? "border-l-red-500" : "border-l-yellow-500"}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${isOutOfStock ? "text-red-500" : "text-yellow-500"}`} />
              {isOutOfStock ? "Estoque Esgotado!" : "Estoque Baixo!"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {isOutOfStock
                ? "Limite de produção atingido. Novas vendas precisam de autorização do admin."
                : `Restam apenas ${availableCount} dogões disponíveis para venda.`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${isOutOfStock ? "text-red-500" : isLowStock ? "text-yellow-500" : ""}`}
            >
              {availableCount}
            </div>
            <p className="text-xs text-muted-foreground">Dogões para venda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vouchers</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVouchers || 0}</div>
            <p className="text-xs text-muted-foreground">Vouchers cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vouchers Utilizados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.usedVouchers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalVouchers > 0 ? ((stats.usedVouchers / stats.totalVouchers) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Cadastrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.customers || 0}</div>
            <p className="text-xs text-muted-foreground">Total de clientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Realizadas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.sales || 0}</div>
            <p className="text-xs text-muted-foreground">Vendas do PDV</p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              PDV - Ponto de Venda
            </CardTitle>
            <CardDescription>Realizar vendas do dia</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => (window.location.href = "/app/pdv")}>
              Abrir PDV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scanner QR Code
            </CardTitle>
            <CardDescription>Escaneie vouchers para validação</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => (window.location.href = "/app/scanner")}
            >
              Abrir Scanner
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Buscar Cliente
            </CardTitle>
            <CardDescription>Pesquisar cliente por nome, telefone ou CPF</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => (window.location.href = "/app/clientes")}
            >
              Buscar Cliente
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
