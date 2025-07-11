"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, Ticket } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [stats, setStats] = useState({ usedCount: 0, availableCount: 0, totalCount: 0 })
  const [loading, setLoading] = useState(true)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkTickets, setBulkTickets] = useState("")
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await fetch(`/api/tickets?t=${Date.now()}`, {
        cache: "no-store",
      })
      const data = await response.json()
      setTickets(data.tickets || [])
      setStats({
        usedCount: data.usedCount || 0,
        availableCount: data.availableCount || 0,
        totalCount: data.totalCount || 0,
      })
    } catch (error) {
      console.error("Erro ao buscar tickets:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar tickets",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBulkMarkUsed = async () => {
    if (!bulkTickets.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Digite os números dos tickets",
      })
      return
    }

    setProcessing(true)
    try {
      // Processar números dos tickets
      const ticketNumbers = bulkTickets
        .split(/[\n,\s]+/)
        .map((num) => num.trim().padStart(4, "0"))
        .filter((num) => num.length === 4)

      if (ticketNumbers.length === 0) {
        throw new Error("Nenhum número de ticket válido encontrado")
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mark_used",
          ticketNumbers,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      toast({
        title: "Sucesso!",
        description: data.message,
      })

      setBulkTickets("")
      setShowBulkModal(false)
      fetchTickets() // Recarregar dados
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      })
    } finally {
      setProcessing(false)
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Tickets</h1>
          <p className="text-muted-foreground">Controle de tickets do Dogão</p>
        </div>
        <Button onClick={() => setShowBulkModal(true)}>
          <Ticket className="h-4 w-4 mr-2" />
          Baixa Manual
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.availableCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usados</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.usedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
          <CardDescription>Lista de todos os tickets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Uso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket._id}>
                    <TableCell className="font-mono">{ticket.number}</TableCell>
                    <TableCell>
                      <Badge variant={ticket.isUsed ? "destructive" : "default"}>
                        {ticket.isUsed ? "Usado" : "Disponível"}
                      </Badge>
                    </TableCell>
                    <TableCell>{ticket.usedAt ? new Date(ticket.usedAt).toLocaleString("pt-BR") : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Baixa Manual */}
      <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Baixa Manual de Tickets</DialogTitle>
            <DialogDescription>
              Digite os números dos tickets que foram vendidos externamente (um por linha ou separados por vírgula)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulkTickets">Números dos Tickets</Label>
              <Textarea
                id="bulkTickets"
                placeholder="Ex: 0001, 0002, 0003 ou um por linha"
                value={bulkTickets}
                onChange={(e) => setBulkTickets(e.target.value)}
                rows={6}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleBulkMarkUsed} disabled={processing} className="flex-1">
                {processing ? "Processando..." : "Marcar como Usados"}
              </Button>
              <Button variant="outline" onClick={() => setShowBulkModal(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
