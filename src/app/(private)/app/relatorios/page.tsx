"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Download, Users, DollarSign, Gift } from "lucide-react"

export default function RelatoriosPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/seed")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = (type: string) => {
    console.log(`Gerando relatório: ${type}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">Análises e relatórios do sistema</p>
      </div>

      {/* Resumo Geral */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vouchers</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVouchers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vouchers Utilizados</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.usedVouchers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.customers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.sales || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Relatórios Disponíveis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Relatórios de Vouchers</CardTitle>
            <CardDescription>Análises sobre uso de vouchers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Vouchers por Status</h4>
                <p className="text-sm text-muted-foreground">Relatório de vouchers utilizados vs disponíveis</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => generateReport("vouchers-status")}>
                <Download className="h-4 w-4 mr-2" />
                Gerar
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Histórico de Validações</h4>
                <p className="text-sm text-muted-foreground">Lista completa de validações realizadas</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => generateReport("validacoes")}>
                <Download className="h-4 w-4 mr-2" />
                Gerar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatórios de Vendas</CardTitle>
            <CardDescription>Análises financeiras e de vendas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Vendas por Período</h4>
                <p className="text-sm text-muted-foreground">Relatório de vendas por data</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => generateReport("vendas-periodo")}>
                <Download className="h-4 w-4 mr-2" />
                Gerar
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Formas de Pagamento</h4>
                <p className="text-sm text-muted-foreground">Análise por método de pagamento</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => generateReport("pagamentos")}>
                <Download className="h-4 w-4 mr-2" />
                Gerar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatórios de Clientes</CardTitle>
            <CardDescription>Análises sobre clientes cadastrados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Clientes por Região</h4>
                <p className="text-sm text-muted-foreground">Distribuição geográfica dos clientes</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => generateReport("clientes-regiao")}>
                <Download className="h-4 w-4 mr-2" />
                Gerar
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Perfil dos Clientes</h4>
                <p className="text-sm text-muted-foreground">Análise de perfil e preferências</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => generateReport("perfil-clientes")}>
                <Download className="h-4 w-4 mr-2" />
                Gerar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatórios Operacionais</CardTitle>
            <CardDescription>Análises operacionais do evento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Produção por Edição</h4>
                <p className="text-sm text-muted-foreground">Análise de produção por edição</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => generateReport("producao-edicao")}>
                <Download className="h-4 w-4 mr-2" />
                Gerar
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Relatório Completo</h4>
                <p className="text-sm text-muted-foreground">Relatório geral do sistema</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => generateReport("completo")}>
                <Download className="h-4 w-4 mr-2" />
                Gerar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
