"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { ArrowRight, ChefHat, Clock, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"

export default function ProducaoPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/production-queue?t=${Date.now()}`, {
        cache: "no-store",
      })
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error("Erro ao buscar fila de produção:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchOrders()
    setRefreshing(false)
  }

  const moveToReady = async (orderId: string) => {
    try {
      const response = await fetch("/api/production-queue/move-to-ready", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Pedido Pronto",
          description: `Pedido #${data.orderNumber} movido para fila de entrega`,
        })
        await fetchOrders()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      })
    }
  }

  const stats = {
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    total: orders.length,
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
          <h1 className="text-3xl font-bold tracking-tight">Fila de Produção</h1>
          <p className="text-muted-foreground">Controle de pedidos para preparo</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preparando</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.preparing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total na Fila</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Fila de Produção */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos para Produção</CardTitle>
          <CardDescription>Pedidos aguardando preparo ou em preparo</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum pedido na fila de produção</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono font-bold">#{order.orderNumber}</TableCell>
                    <TableCell className="font-medium">{order.customerName} {order.isTelevendas === true && (` - ${order.customerHour}`)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.items?.map((item: any, index: number) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">
                              {item.quantity}x {item.itemName}
                            </span>
                            {item.observations && (
                              <div className="text-xs text-muted-foreground">{item.observations}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.status === "pending" ? "secondary" : "default"}>
                        {order.status === "pending" ? "Pendente" : "Preparando"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {order.isVoucher && <Badge variant="outline">Voucher</Badge>}
                        {order.isTicket && <Badge variant="outline">Ticket</Badge>}
                        {order.isTelevendas && <Badge variant="outline">Entrega</Badge>}
                        {!order.isVoucher && !order.isTicket && !order.isTelevendas && (
                          <Badge variant="outline">Retirada</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleTimeString("pt-BR")}</TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => moveToReady(order._id)}>
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Pronto
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
