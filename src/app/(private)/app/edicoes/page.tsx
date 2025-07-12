"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { CELL_GROUPS } from "@/lib/models/database"
import { Calendar, Clock, DollarSign, Package, Settings, Users } from "lucide-react"
import { useEffect, useState } from "react"

interface Edition {
  _id: string
  nome: string
  dataProducao: string
  horarioFechamento: string
  limiteEdicao: number
  quantidadeVendida: number
  valorDog: number
  ativa: boolean
  producaoAtiva: boolean
  createdAt: string
  updatedAt: string
}

export default function EdicoesPage() {
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showManualSaleModal, setShowManualSaleModal] = useState(false)
  const [showTotalModal, setShowTotalModal] = useState(false)
  const [totalToReceive, setTotalToReceive] = useState(0)

  const _valorDog = 19.99;
  const _edition = '68703b3580b075178fc218ad';

  const [newEdition, setNewEdition] = useState({
    nome: "",
    dataProducao: "",
    horarioFechamento: "19:00",
    limiteEdicao: 500,
    valorDog: _valorDog,
  })

  const [manualSale, setManualSale] = useState({
    cellGroup: "",
    customCellGroup: "",
    quantity: 1,
    unitPrice: 19.99,
    editionId: _edition
  })

  const { toast } = useToast()

  useEffect(() => {
    loadEditions()
  }, [])

  const loadEditions = async () => {
    try {
      const response = await fetch("/api/editions", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })
      if (response.ok) {
        const data = await response.json()
        setEditions(data.editions || [])
      }
    } catch (error) {
      console.error("Erro ao carregar edições:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as edições.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEdition = async () => {
    if (!newEdition.nome || !newEdition.dataProducao) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
      })
      return
    }

    try {
      const response = await fetch("/api/editions", {
        cache: "no-store",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEdition),
      })

      if (response.ok) {
        toast({
          title: "Edição criada",
          description: "Nova edição criada com sucesso.",
        })
        setShowCreateModal(false)
        setNewEdition({
          nome: "",
          dataProducao: "",
          horarioFechamento: "19:00",
          limiteEdicao: 500,
          valorDog: 19.99,
        })
        loadEditions()
      } else {
        const data = await response.json()
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao criar edição.",
      })
    }
  }

  const handleToggleActive = async (editionId: string) => {
    try {
      const response = await fetch("/api/editions", {
        cache: "no-store",
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "toggle_active",
          editionId,
        }),
      })

      if (response.ok) {
        toast({
          title: "Status atualizado",
          description: "Status da edição atualizado com sucesso.",
        })
        loadEditions()
      } else {
        throw new Error("Erro ao atualizar status")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o status.",
      })
    }
  }

  const handleToggleProduction = async (editionId: string) => {
    try {
      const response = await fetch("/api/editions", {
        cache: "no-store",
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "toggle_production",
          editionId,
        }),
      })

      if (response.ok) {
        toast({
          title: "Produção atualizada",
          description: "Status da produção atualizado com sucesso.",
        })
        loadEditions()
      } else {
        throw new Error("Erro ao atualizar produção")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar a produção.",
      })
    }
  }

  const handleManualSale = async () => {
    const cellGroupName =
      manualSale.cellGroup === "OUTRA (informar)" ? manualSale.customCellGroup : manualSale.cellGroup

    if (!cellGroupName || manualSale.quantity <= 0) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Preencha todos os campos corretamente.",
      })
      return
    }

    const total = manualSale.quantity * _valorDog

    try {
      const response = await fetch("/api/editions/manual-sale", {
        cache: "no-store",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cellName: cellGroupName,
          quantity: manualSale.quantity,
          unitPrice: _valorDog,
          totalValue: total,
          editionId: _edition
        }),
      })

      if (response.ok) {
        setTotalToReceive(total)
        setShowTotalModal(true)
        setShowManualSaleModal(false)
        setManualSale({
          cellGroup: "",
          customCellGroup: "",
          quantity: 1,
          unitPrice: _valorDog,
          editionId: _edition
        })
        loadEditions()
      } else {
        const data = await response.json()
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao registrar venda manual.",
      })
    }
  }

  const activeEdition = editions.find((e) => e.ativa)

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edições</h1>
          <p className="text-muted-foreground">Carregando edições...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edições</h1>
          <p className="text-muted-foreground">Gerenciar edições do Dogão do Pastor</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowManualSaleModal(true)}>
            <Users className="h-4 w-4 mr-2" />
            Venda Manual
          </Button>
          {/*  <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Edição
          </Button>*/}
        </div>
      </div>

      {/* Edição Ativa */}
      {activeEdition && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {activeEdition.nome}
                  <Badge variant="default">Ativa</Badge>
                  {activeEdition.producaoAtiva && <Badge variant="secondary">Produção Ativa</Badge>}
                </CardTitle>
                <CardDescription>
                  {new Date(activeEdition.dataProducao).toLocaleDateString("pt-BR")} às{" "}
                  {activeEdition.horarioFechamento}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleToggleProduction(activeEdition._id)}>
                  {activeEdition.producaoAtiva ? "Parar Produção" : "Iniciar Produção"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold">{activeEdition.limiteEdicao}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Vendidos</p>
                  <p className="text-2xl font-bold text-green-600">{activeEdition.quantidadeVendida}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Disponível</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {activeEdition.limiteEdicao - activeEdition.quantidadeVendida}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Valor</p>
                  <p className="text-2xl font-bold">R$ {activeEdition.valorDog.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Edições */}
      <div className="grid gap-4">
        {editions.map((edition) => (
          <Card key={edition._id} className={edition.ativa ? "opacity-50" : ""}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {edition.nome}
                    {edition.ativa && <Badge variant="default">Ativa</Badge>}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(edition.dataProducao).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {edition.horarioFechamento}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      R$ {edition.valorDog.toFixed(2)}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(edition._id)}
                    disabled={edition.ativa}
                  >
                    {edition.ativa ? "Ativa" : "Ativar"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <span>
                  Vendidos: {edition.quantidadeVendida}/{edition.limiteEdicao}
                </span>
                <span>Disponível: {edition.limiteEdicao - edition.quantidadeVendida}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min((edition.quantidadeVendida / edition.limiteEdicao) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Nova Edição */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Edição</DialogTitle>
            <DialogDescription>Criar uma nova edição do Dogão do Pastor</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Edição *</Label>
              <Input
                value={newEdition.nome}
                onChange={(e) => setNewEdition({ ...newEdition, nome: e.target.value })}
                placeholder="Ex: Edição Especial de Natal"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Produção *</Label>
                <Input
                  type="date"
                  value={newEdition.dataProducao}
                  onChange={(e) => setNewEdition({ ...newEdition, dataProducao: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Horário de Fechamento</Label>
                <Input
                  type="time"
                  value={newEdition.horarioFechamento}
                  onChange={(e) => setNewEdition({ ...newEdition, horarioFechamento: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade Total</Label>
                <Input
                  type="number"
                  value={newEdition.limiteEdicao}
                  onChange={(e) => setNewEdition({ ...newEdition, limiteEdicao: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Valor do Dogão</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newEdition.valorDog}
                  onChange={(e) => setNewEdition({ ...newEdition, valorDog: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateEdition} className="flex-1">
                Criar Edição
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Venda Manual */}
      <Dialog open={showManualSaleModal} onOpenChange={setShowManualSaleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Venda Manual - Acerto da Célula</DialogTitle>
            <DialogDescription>Registrar venda manual para célula</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Célula *</Label>
              <Select
                value={manualSale.cellGroup}
                onValueChange={(value) => setManualSale({ ...manualSale, cellGroup: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a célula" />
                </SelectTrigger>
                <SelectContent>
                  {CELL_GROUPS.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                  <SelectItem value="OUTRA (informar)">OUTRA (informar)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {manualSale.cellGroup === "OUTRA (informar)" && (
              <div className="space-y-2">
                <Label>Nome da Célula *</Label>
                <Input
                  value={manualSale.customCellGroup}
                  onChange={(e) => setManualSale({ ...manualSale, customCellGroup: e.target.value })}
                  placeholder="Digite o nome da célula"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={manualSale.quantity}
                  onChange={(e) => setManualSale({ ...manualSale, quantity: Number(e.target.value) })}
                />
              </div>
              {/*  <div className="space-y-2">
                <Label>Valor Unitário</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={manualSale.unitPrice}
                  onChange={(e) => setManualSale({ ...manualSale, unitPrice: Number(e.target.value) })}
                />
              </div> */}
            </div>

            <Separator />

            <div className="flex justify-between items-center font-bold">
              <span>Total:</span>
              <span>R$ {(manualSale.quantity * manualSale.unitPrice).toFixed(2)}</span>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleManualSale} className="flex-1">
                Registrar Venda
              </Button>
              <Button variant="outline" onClick={() => setShowManualSaleModal(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Total a Receber */}
      <Dialog open={showTotalModal} onOpenChange={setShowTotalModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Total a Receber</DialogTitle>
            <DialogDescription>Valor que a tesoureira deve receber</DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <div className="text-4xl font-bold text-green-600 mb-2">R$ {totalToReceive.toFixed(2)}</div>
            <p className="text-muted-foreground">Venda registrada com sucesso!</p>
          </div>
          <Button onClick={() => setShowTotalModal(false)} className="w-full">
            Fechar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
