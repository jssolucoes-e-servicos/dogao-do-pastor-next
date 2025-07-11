"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, ShoppingCart, Gift, CreditCard, RefreshCw, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ORDER_STATUS } from "@/lib/models/database"

export default function VendasPage() {
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedSale, setSelectedSale] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sales?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      const data = await response.json()
      setSales(data.sales || [])
    } catch (error) {
      console.error("Erro ao buscar vendas:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchSales()
    setRefreshing(false)
  }

  const stats = {
    total: sales.length,
    totalValue: sales.reduce((sum, sale) => sum + sale.totalValue, 0),
    vouchers: sales.filter((s) => s.isVoucher).length,
    paid: sales.filter((s) => !s.isVoucher && !s.isTicket).length,
    tickets: sales.filter((s) => s.isTicket).length,
    televendas: sales.filter((s) => s.isTelevendas).length,
  }

  const getPaymentIcon = (formaPagamento: string) => {
    switch (formaPagamento) {
      case "voucher":
        return <Gift className="h-4 w-4" />
      case "cash":
        return <DollarSign className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getPaymentLabel = (formaPagamento: string) => {
    const labels: { [key: string]: string } = {
      cash: "Dinheiro",
      pix: "PIX",
      credit_card: "Cartão de Crédito",
      debit_card: "Cartão de Débito",
      voucher: "Voucher",
      ticket_dogao: "Ticket Dogão",
    }
    return labels[formaPagamento] || formaPagamento
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = ORDER_STATUS.find((s) => s.value === status)
    return <Badge variant={(statusConfig?.color as any) || "secondary"}>{statusConfig?.label || status}</Badge>
  }

  const openDetailsModal = (sale: any) => {
    setSelectedSale(sale)
    setShowDetailsModal(true)
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Vendas</h1>
          <p className="text-muted-foreground">Visualizar todas as vendas e resgates realizados</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Pagas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paid}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vouchers</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vouchers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tickets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Televendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.televendas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
          <CardDescription>Todas as vendas e resgates realizados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale._id}>
                  <TableCell className="font-mono font-bold">#{sale.orderNumber}</TableCell>
                  <TableCell className="font-medium">{sale.customerName}</TableCell>
                  <TableCell>{sale.customerPhone}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {sale.isVoucher && <Badge variant="default">Voucher</Badge>}
                      {sale.isTicket && <Badge variant="secondary">Ticket</Badge>}
                      {sale.isTelevendas && <Badge variant="outline">Entrega</Badge>}
                      {!sale.isVoucher && !sale.isTicket && !sale.isTelevendas && (
                        <Badge variant="outline">Retirada</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPaymentIcon(sale.paymentMethod)}
                      {getPaymentLabel(sale.paymentMethod)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {sale.isVoucher || sale.totalValue === 0 ? (
                      <Badge variant="secondary">Gratuito</Badge>
                    ) : (
                      `R$ ${sale.totalValue.toFixed(2)}`
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(sale.status)}</TableCell>
                  <TableCell>{new Date(sale.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => openDetailsModal(sale)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido #{selectedSale?.orderNumber}</DialogTitle>
            <DialogDescription>Informações completas da venda</DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Cliente</h4>
                  <p className="text-sm text-muted-foreground">{selectedSale.customerName}</p>
                </div>
                <div>
                  <h4 className="font-medium">Telefone</h4>
                  <p className="text-sm text-muted-foreground">{selectedSale.customerPhone}</p>
                </div>
                {selectedSale.customerAddress && (
                  <div className="col-span-2">
                    <h4 className="font-medium">Endereço</h4>
                    <p className="text-sm text-muted-foreground">{selectedSale.customerAddress}</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Itens do Pedido</h4>
                <div className="space-y-2">
                  {selectedSale.items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div>
                        <p className="font-medium">
                          {item.quantity}x {item.itemName}
                        </p>
                        <p className="text-sm text-muted-foreground">{item.observations}</p>
                      </div>
                      <p className="font-medium">R$ {item.totalPrice.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-medium">Total:</span>
                <span className="text-lg font-bold">R$ {selectedSale.totalValue.toFixed(2)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
