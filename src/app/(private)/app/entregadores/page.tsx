"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { UserCheck, Plus, Edit, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function EntregadoresPage() {
  const [deliveryPersons, setDeliveryPersons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingPerson, setEditingPerson] = useState<any>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    isActive: true,
  })

  useEffect(() => {
    fetchDeliveryPersons()
  }, [])

  const fetchDeliveryPersons = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/delivery-persons?t=${Date.now()}`, {
        cache: "no-store",
      })
      const data = await response.json()
      setDeliveryPersons(data.deliveryPersons || [])
    } catch (error) {
      console.error("Erro ao buscar entregadores:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDeliveryPersons()
    setRefreshing(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingPerson ? `/api/delivery-persons/${editingPerson._id}` : "/api/delivery-persons"
      const method = editingPerson ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: editingPerson ? "Entregador Atualizado" : "Entregador Cadastrado",
          description: data.message,
        })
        resetForm()
        await fetchDeliveryPersons()
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

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      isActive: true,
    })
    setEditingPerson(null)
    setShowForm(false)
  }

  const editPerson = (person: any) => {
    setFormData({
      name: person.name,
      phone: person.phone,
      isActive: person.isActive,
    })
    setEditingPerson(person)
    setShowForm(true)
  }

  const toggleActive = async (personId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/delivery-persons/${personId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Status Atualizado",
          description: `Entregador ${isActive ? "ativado" : "desativado"}`,
        })
        await fetchDeliveryPersons()
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
    total: deliveryPersons.length,
    active: deliveryPersons.filter((dp) => dp.isActive).length,
    inactive: deliveryPersons.filter((dp) => !dp.isActive).length,
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
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Entregadores</h1>
          <p className="text-muted-foreground">Cadastrar e gerenciar entregadores</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Entregador
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativos</CardTitle>
            <UserCheck className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Entregadores */}
      <Card>
        <CardHeader>
          <CardTitle>Entregadores Cadastrados</CardTitle>
          <CardDescription>Todos os entregadores do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {deliveryPersons.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum entregador cadastrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryPersons.map((person) => (
                  <TableRow key={person._id}>
                    <TableCell className="font-medium">{person.name}</TableCell>
                    <TableCell>{person.phone}</TableCell>
                    <TableCell>
                      <Badge variant={person.isActive ? "default" : "secondary"}>
                        {person.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(person.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => editPerson(person)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Switch
                          checked={person.isActive}
                          onCheckedChange={(checked) => toggleActive(person._id, checked)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Formulário */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPerson ? "Editar Entregador" : "Novo Entregador"}</DialogTitle>
            <DialogDescription>
              {editingPerson ? "Atualizar dados do entregador" : "Cadastrar novo entregador"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Entregador ativo</Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingPerson ? "Atualizar" : "Cadastrar"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
