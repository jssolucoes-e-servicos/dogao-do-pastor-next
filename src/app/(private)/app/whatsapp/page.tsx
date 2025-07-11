"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Send, Settings, CheckCircle } from "lucide-react"

export default function WhatsAppPage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSendMessage = async () => {
    setLoading(true)
    // Implementar envio de mensagem
    setTimeout(() => {
      setLoading(false)
      setPhoneNumber("")
      setMessage("")
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp</h1>
        <p className="text-muted-foreground">Gerenciar mensagens via Evolution API</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Status da API
            </CardTitle>
            <CardDescription>Configuração da Evolution API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status da Conexão:</span>
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Conectado
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Instância:</span>
              <Badge variant="outline">IgrejaViva</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Mensagens Enviadas:</span>
              <Badge variant="secondary">0</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Enviar Mensagem
            </CardTitle>
            <CardDescription>Enviar mensagem manual via WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Número do WhatsApp</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>
            <Button onClick={handleSendMessage} disabled={loading || !phoneNumber || !message} className="w-full">
              {loading ? "Enviando..." : "Enviar Mensagem"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mensagens Automáticas</CardTitle>
          <CardDescription>Configurar mensagens automáticas do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Mensagem de Boas-vindas</h4>
              <p className="text-sm text-muted-foreground mb-2">Enviada automaticamente quando um voucher é validado</p>
              <Badge variant="default">Ativa</Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Lembrete de Retirada</h4>
              <p className="text-sm text-muted-foreground mb-2">Enviada 1 hora antes do fechamento da produção</p>
              <Badge variant="secondary">Em desenvolvimento</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
