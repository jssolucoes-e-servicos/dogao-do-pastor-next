"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Package, RefreshCw, Send, Truck } from "lucide-react"
import { useEffect, useState } from "react"

export default function EntregasPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [deliveryPersons, setDeliveryPersons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showFinishedModal, setShowFinishedModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    setOrders([])
    fetchOrders()
    fetchDeliveryPersons()
  }, [])

  const fetchOrders = async () => {
    try {
      setOrders([])
      setLoading(true)
      const response = await fetch(`/api/delivery-queue?t=${Date.now()}`, {
        cache: "no-store",
      })
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error("Erro ao buscar fila de entregas:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDeliveryPersons = async () => {
    try {
      const response = await fetch("/api/delivery-persons")
      const data = await response.json()
      setDeliveryPersons(data.deliveryPersons || [])
    } catch (error) {
      console.error("Erro ao buscar entregadores:", error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    setOrders([])
    await fetchOrders()
    setRefreshing(false)
  }

  const assignDeliveryPerson = async () => {
    if (!selectedOrder || !selectedDeliveryPerson) return

    try {
      const response = await fetch("/api/delivery-queue/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: selectedOrder._id,
          deliveryPersonId: selectedDeliveryPerson,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Entregador Atribuído",
          description: `Pedido #${selectedOrder.orderNumber} atribuído para entrega`,
        })
        setShowAssignModal(false)
        setSelectedOrder(null)
        setSelectedDeliveryPerson("")
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

  const assignDelivered = async () => {
    if (!selectedOrder) return

    try {
      const response = await fetch("/api/delivery-queue/finished", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: selectedOrder._id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Pedido entregue com sucesso",
          description: `Pedido #${selectedOrder.orderNumber} Finalizado`,
        })
        setShowFinishedModal(false)
        setSelectedOrder(null)
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
    ready: orders.filter((o) => o.status === "ready").length,
    outForDelivery: orders.filter((o) => o.status === "out_for_delivery").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
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
          <h1 className="text-3xl font-bold tracking-tight">Fila de Entregas</h1>
          <p className="text-muted-foreground">Controle de pedidos para entrega</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ready}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em rota</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.outForDelivery}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total na Fila</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregues</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
          </CardContent>
        </Card>

      </div>

      {/* Fila de Entregas */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos para Entrega</CardTitle>
          <CardDescription>Pedidos prontos ou saindo para entrega</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum pedido na fila de entregas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Entregador</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono font-bold">#{order.orderNumber}</TableCell>
                    <TableCell className="font-medium">{order.customerName}{order.isTelevendas === true && (` - ${order.customerHour}`)}</TableCell>
                    <TableCell>{order.customerPhone}</TableCell>
                    <TableCell className="max-w-xs truncate">{order.customerAddress}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === "ready" ? "default" : "secondary"}>
                        {order.status === "ready" ? "Pronto" : order.status === "delivered" ? "Entregue" : "Saiu para Entrega"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.deliveryPersonName ? (
                        <Badge variant="outline">{order.deliveryPersonName}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Não atribuído</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.status === "ready" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowAssignModal(true)
                          }}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Enviar
                        </Button>
                      )}

                      {order.status === "out_for_delivery" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowFinishedModal(true)
                          }}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Entregue
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Atribuição */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Entregador</DialogTitle>
            <DialogDescription>Selecione um entregador para o pedido #{selectedOrder?.orderNumber}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Entregador</Label>
              <Select value={selectedDeliveryPerson} onValueChange={setSelectedDeliveryPerson}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um entregador" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryPersons
                    .filter((dp) => dp.isActive)
                    .map((dp) => (
                      <SelectItem key={dp._id} value={dp._id}>
                        {dp.name} - {dp.phone}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={assignDeliveryPerson} disabled={!selectedDeliveryPerson} className="flex-1">
                Atribuir e Enviar
              </Button>
              <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de finalização */}
      <Dialog open={showFinishedModal} onOpenChange={setShowFinishedModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar entrega</DialogTitle>
            <DialogDescription>O pedido #{selectedOrder?.orderNumber} foi realmente entregue?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2 pt-4">
              <Button onClick={assignDelivered} className="flex-1">
                Finalizar
              </Button>
              <Button variant="outline" onClick={() => setShowFinishedModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
