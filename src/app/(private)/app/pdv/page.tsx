"use client"

import { AlertTriangle, Gift, Plus, Printer, ShoppingCart, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useToast } from "@/hooks/use-toast"
import { AVAILABLE_INGREDIENTS, DELIVERY_TYPES, PAYMENT_METHODS } from "@/lib/models/database"
import { validateVoucher } from "@/lib/voucher"

interface SaleItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  removedIngredients: string[]
  observations: string
  countInSales: boolean
}

export default function PDVPage() {
  const [activeTab, setActiveTab] = useState<"venda" | "voucher">("venda")
  const [loading, setLoading] = useState(false)

  // dados da edição
  const [activeEdition, setActiveEdition] = useState<any>(null)
  const [availableCount, setAvailableCount] = useState(0)

  // venda normal
  const [saleData, setSaleData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    customerHour: "Agora",
    paymentMethod: "",
    deliveryType: "pickup",
    ticketNumbers: [] as string[],
  })
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])

  // voucher
  const [voucherData, setVoucherData] = useState({
    voucherCode: "",
    customer: {
      name: "",
      phone: "",
      cpf: ""
    },
    removedIngredients: [] as string[],
    isValidated: false,
  })

  // UI modals
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [newItemIngredients, setNewItemIngredients] = useState<string[]>([])
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [currentTicketInput, setCurrentTicketInput] = useState("")

  // última venda (para impressão)
  const [lastOrderData, setLastOrderData] = useState<{
    orderNumber: string
    customerName: string
    customerPhone: string
    items: SaleItem[]
    total: string
  } | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    loadEdition()
  }, [])

  const loadEdition = async () => {
    try {
      const res = await fetch(`/api/seed?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })
      const data = await res.json()
      setActiveEdition(data.activeEdition)
      setAvailableCount(data.availableCount)
    } catch (err) {
      console.error(err)
    }
  }

  const getCountedQuantity = () => saleItems.filter((i) => i.countInSales).reduce((s, i) => s + i.quantity, 0)

  const getTotalSale = () => saleItems.reduce((s, i) => s + i.totalPrice, 0).toFixed(2)

  const dogPrice = activeEdition?.valorDog ?? 19.99

  const handleAddItem = () => {
    const isTicketPayment = saleData.paymentMethod === "ticket_dogao"
    const ticketsNeeded = saleItems.filter((i) => i.countInSales).length + 1

    if (isTicketPayment && saleData.ticketNumbers.length < ticketsNeeded) {
      toast({
        variant: "destructive",
        title: "Ticket necessário",
        description: `Informe ${ticketsNeeded} ticket(s) para ${ticketsNeeded} dogão(ões).`,
      })
      setShowTicketModal(true)
      return
    }

    const base: SaleItem = {
      id: crypto.randomUUID(),
      name: "Dogão do Pastor",
      quantity: 1,
      unitPrice: dogPrice,
      totalPrice: isTicketPayment ? 0 : dogPrice,
      removedIngredients: newItemIngredients,
      observations: newItemIngredients.length > 0 ? `Sem: ${newItemIngredients.join(", ")}` : "Completo",
      countInSales: !isTicketPayment,
    }
    setSaleItems((prev) => [...prev, base])
    setShowAddItemModal(false)
    setNewItemIngredients([])
  }

  const handleAddTicket = async () => {
    if (!currentTicketInput.trim()) return
    const ticketNumber = currentTicketInput.trim().padStart(4, "0")

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "validate", ticketNumbers: [ticketNumber] }),
      })
      const data = await res.json()
      if (!data.allAvailable) {
        toast({
          variant: "destructive",
          title: "Ticket inválido ou já usado",
          description: `Ticket ${ticketNumber} não disponível.`,
        })
        return
      }
      if (saleData.ticketNumbers.includes(ticketNumber)) {
        toast({
          variant: "destructive",
          title: "Ticket duplicado",
          description: "Este ticket já foi adicionado.",
        })
        return
      }
      setSaleData((prev) => ({
        ...prev,
        ticketNumbers: [...prev.ticketNumbers, ticketNumber],
      }))
      setCurrentTicketInput("")
      toast({
        title: "Ticket adicionado",
        description: `Ticket ${ticketNumber} validado com sucesso.`,
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao validar ticket.",
      })
    }
  }

  const handleRemoveTicket = (ticket: string) =>
    setSaleData((prev) => ({
      ...prev,
      ticketNumbers: prev.ticketNumbers.filter((t) => t !== ticket),
    }))

  const canFinalizeSale = () => {
    const hasBasics = saleData.customerName && saleData.customerPhone && saleData.paymentMethod && saleItems.length
    if (saleData.paymentMethod === "ticket_dogao") {
      const ticketsNeeded = saleItems.filter((i) => i.countInSales).length
      return hasBasics && saleData.ticketNumbers.length >= ticketsNeeded
    }
    return hasBasics
  }

  const handleFinalizeSale = async () => {
    if (!canFinalizeSale()) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Preencha cliente, pagamento e itens.",
      })
      return
    }
    if (getCountedQuantity() > availableCount) {
      toast({
        variant: "destructive",
        title: "Estoque insuficiente",
        description: "Quantidade excede o limite disponível.",
      })
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...saleData,
          items: saleItems,
          totalValue: Number(getTotalSale()),
          isTicket: saleData.paymentMethod === "ticket_dogao",
          isTelevendas: saleData.deliveryType === "televendas",
          ticketNumbers: saleData.paymentMethod === "ticket_dogao" ? saleData.ticketNumbers : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast({
        title: "Venda registrada",
        description: `Pedido #${data.sale.orderNumber}`,
      })

      setLastOrderData({
        orderNumber: data.sale.orderNumber,
        customerName: saleData.customerName,
        customerPhone: saleData.customerPhone,
        items: saleItems,
        total: getTotalSale(),
      })
      setShowPrintModal(true)

      // reset
      setSaleItems([])
      setSaleData({
        customerName: "",
        customerPhone: "",
        customerAddress: "",
        customerHour: "Agora",
        paymentMethod: "",
        deliveryType: "pickup",
        ticketNumbers: [],
      })

      // Recarregar dados da edição
      loadEdition()
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro", description: err.message })
    } finally {
      setLoading(false)
    }
  }

  const printReceipt = () => {
    if (!lastOrderData) return
    const lines = lastOrderData.items
      .map((i) => `${i.quantity}x ${i.name} - R$ ${i.totalPrice.toFixed(2)}\n  ${i.observations}`)
      .join("\n")

    const ticketInfo =
      saleData.paymentMethod === "ticket_dogao" && saleData.ticketNumbers.length > 0
        ? `\nTickets: ${saleData.ticketNumbers.join(", ")}\n`
        : ""

    const receipt = `******** DOGÃO DO PASTOR ********
PEDIDO #${lastOrderData.orderNumber}

Cliente : ${lastOrderData.customerName}
Telefone: ${lastOrderData.customerPhone}

Itens:
${lines}

Total: R$ ${lastOrderData.total}${ticketInfo}
Obrigado!`

    const w = window.open("", "_blank")
    if (w) {
      w.document.write(`<pre style="font-size:14px;line-height:18px">${receipt}</pre><script>window.print()</script>`)
      w.document.close()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">PDV</h1>
        <p className="text-sm text-muted-foreground">Vendas e resgate de vouchers</p>
      </div>

      {availableCount <= 50 && (
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <CardTitle>{availableCount > 0 ? `Estoque baixo: ${availableCount}` : "Estoque esgotado"}</CardTitle>
          </CardHeader>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="venda" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Venda
          </TabsTrigger>
          <TabsTrigger value="voucher" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Voucher
          </TabsTrigger>
        </TabsList>

        <TabsContent value="venda">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cliente e Pagamento</CardTitle>
                <CardDescription>Preencha os dados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input
                    value={saleData.customerName}
                    onChange={(e) => setSaleData({ ...saleData, customerName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Telefone *</Label>
                  <Input
                    value={saleData.customerPhone}
                    onChange={(e) =>
                      setSaleData({
                        ...saleData,
                        customerPhone: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de atendimento</Label>
                  <Select
                    value={saleData.deliveryType}
                    onValueChange={(v) => setSaleData({ ...saleData, deliveryType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIVERY_TYPES.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {saleData.deliveryType === "televendas" && (
                  <>
                    <div className="space-y-2">
                      <Label>Endereço *</Label>
                      <Input
                        value={saleData.customerAddress}
                        onChange={(e) =>
                          setSaleData({
                            ...saleData,
                            customerAddress: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Horario *</Label>
                      <Input
                        value={saleData.customerHour}
                        onChange={(e) =>
                          setSaleData({
                            ...saleData,
                            customerHour: e.target.value,
                          })
                        }
                      />
                    </div>
                  </>
                )}



                <Separator />

                <div className="space-y-2">
                  <Label>Pagamento *</Label>
                  <Select
                    value={saleData.paymentMethod}
                    onValueChange={(v) => {
                      setSaleData({
                        ...saleData,
                        paymentMethod: v,
                        ticketNumbers: v === "ticket_dogao" ? saleData.ticketNumbers : [],
                      })
                      if (v === "ticket_dogao") setShowTicketModal(true)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Forma de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.filter((p) => p.value !== "voucher").map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full" onClick={() => setShowAddItemModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Dogão
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pedido</CardTitle>
                <CardDescription>
                  Contará {getCountedQuantity()} no limite (disp. {availableCount})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {saleItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nenhum item</p>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Obs.</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {saleItems.map((i) => (
                          <TableRow key={i.id}>
                            <TableCell className="whitespace-pre-line">
                              {i.quantity}x {i.name}
                              {!i.countInSales && (
                                <Badge variant="secondary" className="ml-2">
                                  grátis
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{i.totalPrice === 0 ? "R$ 0,00" : `R$ ${i.totalPrice.toFixed(2)}`}</TableCell>
                            <TableCell className="text-xs">{i.observations}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSaleItems((prev) => prev.filter((x) => x.id !== i.id))}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="border-t pt-4 flex justify-between font-bold">
                      <span>Total:</span>
                      <span>R$ {getTotalSale()}</span>
                    </div>

                    <Button className="w-full mt-4" disabled={loading} onClick={handleFinalizeSale}>
                      {loading ? "Processando..." : "Finalizar Venda"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="voucher">
          <Card>
            <CardHeader>
              <CardTitle>Resgate de Voucher</CardTitle>
              <CardDescription>Digite o código e valide.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Código *</Label>
                  <Input
                    value={voucherData.voucherCode}
                    onChange={(e) => {
                      const code = e.target.value.toUpperCase()


                      setVoucherData({ ...voucherData, voucherCode: code })
                      if (code.length >= 6)
                        validateVoucher(code).then((isValid) =>
                          setVoucherData((prev) => ({
                            ...prev,
                            isValidated: isValid,
                          })),
                        )
                    }}
                  />
                </div>
                {voucherData.isValidated && (<>
                  <div className="space-y-2">
                    <Label>Cliente</Label>
                    <Label>{voucherData.customer.name}  </Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Label>{voucherData.customer.phone}</Label>
                  </div>
                </>)}

              </div>

              {voucherData.isValidated && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Remover ingredientes (opcional)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {AVAILABLE_INGREDIENTS.map((ing) => (
                        <div key={ing} className="flex items-center space-x-2">
                          <Checkbox
                            id={ing}
                            checked={voucherData.removedIngredients.includes(ing)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setVoucherData((prev) => ({
                                  ...prev,
                                  removedIngredients: [...prev.removedIngredients, ing],
                                }))
                              } else {
                                setVoucherData((prev) => ({
                                  ...prev,
                                  removedIngredients: prev.removedIngredients.filter((i) => i !== ing),
                                }))
                              }
                            }}
                          />
                          <Label htmlFor={ing} className="text-sm">
                            {ing}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    disabled={loading}
                    onClick={async () => {
                      setLoading(true)
                      try {
                        const res = await fetch("/api/voucher/redeem", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            voucherCode: voucherData.voucherCode,
                            removedIngredients: voucherData.removedIngredients,
                          }),
                        })
                        const data = await res.json()
                        if (!res.ok) throw new Error(data.error)

                        toast({
                          title: "Voucher resgatado",
                          description: `Pedido #${data.orderNumber}`,
                        })

                        setLastOrderData({
                          orderNumber: data.orderNumber,
                          customerName: data.customerName,
                          customerPhone: data.customerPhone,
                          items: [
                            {
                              id: "voucher",
                              name: "Dogão do Pastor",
                              quantity: 1,
                              unitPrice: 0,
                              totalPrice: 0,
                              removedIngredients: voucherData.removedIngredients,
                              observations:
                                voucherData.removedIngredients.length > 0
                                  ? `Sem: ${voucherData.removedIngredients.join(", ")}`
                                  : "Completo",
                              countInSales: false,
                            },
                          ],
                          total: "0.00",
                        })
                        setShowPrintModal(true)

                        setVoucherData({
                          voucherCode: "",
                          customerName: "",
                          customerPhone: "",
                          removedIngredients: [],
                          isValidated: false,
                        })

                        // Recarregar dados da edição
                        loadEdition()
                      } catch (err: any) {
                        toast({ variant: "destructive", title: "Erro", description: err.message })
                      } finally {
                        setLoading(false)
                      }
                    }}
                  >
                    {loading ? "Processando..." : "Resgatar Voucher"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Adicionar Item */}
      <Dialog open={showAddItemModal} onOpenChange={setShowAddItemModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Dogão</DialogTitle>
            <DialogDescription>Personalizar ingredientes</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Remover ingredientes (opcional)</Label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_INGREDIENTS.map((ing) => (
                  <div key={ing} className="flex items-center space-x-2">
                    <Checkbox
                      id={ing}
                      checked={newItemIngredients.includes(ing)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewItemIngredients((prev) => [...prev, ing])
                        } else {
                          setNewItemIngredients((prev) => prev.filter((i) => i !== ing))
                        }
                      }}
                    />
                    <Label htmlFor={ing} className="text-sm">
                      {ing}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddItem} className="flex-1">
                Adicionar
              </Button>
              <Button variant="outline" onClick={() => setShowAddItemModal(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Tickets */}
      <Dialog open={showTicketModal} onOpenChange={setShowTicketModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tickets Dogão</DialogTitle>
            <DialogDescription>Adicione os números dos tickets</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Número do ticket"
                value={currentTicketInput}
                onChange={(e) => setCurrentTicketInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTicket()}
              />
              <Button onClick={handleAddTicket}>Adicionar</Button>
            </div>

            {saleData.ticketNumbers.length > 0 && (
              <div className="space-y-2">
                <Label>Tickets adicionados:</Label>
                <div className="flex flex-wrap gap-2">
                  {saleData.ticketNumbers.map((ticket) => (
                    <Badge key={ticket} variant="secondary" className="flex items-center gap-1">
                      {ticket}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => handleRemoveTicket(ticket)}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={() => setShowTicketModal(false)} className="w-full">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Impressão */}
      <Dialog open={showPrintModal} onOpenChange={setShowPrintModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Imprimir Comanda</DialogTitle>
            <DialogDescription>Pedido registrado com sucesso!</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {lastOrderData && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold">Pedido #{lastOrderData.orderNumber}</h3>
                <p>Cliente: {lastOrderData.customerName}</p>
                <p>Telefone: {lastOrderData.customerPhone}</p>
                <p>Total: R$ {lastOrderData.total}</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={printReceipt} className="flex-1">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" onClick={() => setShowPrintModal(false)} className="flex-1">
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
