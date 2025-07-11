"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Save, Database, MessageSquare, Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState({
    // Configurações gerais
    siteName: "Dogão do Pastor",
    siteDescription: "Sistema de Gerenciamento de Vouchers",

    // Configurações de notificação
    emailNotifications: "true",
    whatsappNotifications: "true",

    // Configurações da Evolution API - Vendas
    evolutionApiUrl: "",
    evolutionToken: "",
    evolutionInstance: "",

    // Configurações da Evolution API - Expedição
    expeditionApiUrl: "",
    expeditionToken: "",
    expeditionInstance: "",

    // Configurações de mensagens
    welcomeMessage: `🌭 *Dogão do Pastor* 🌭

Olá {nome}! Seu voucher foi validado com sucesso!

📍 *Instruções para retirada:*
• Local: Igreja Viva em Células
• Data: {data}
• Horário: Até às {horario}
• Apresente este voucher no local

⚠️ *Importante:* Você receberá um lembrete 1 hora antes do fechamento.

Deus abençoe! 🙏`,

    purchaseMessage: `🌭 *Dogão do Pastor* 🌭

Olá {nome}!

Seu pedido foi realizado com sucesso!

📋 *Detalhes do Pedido:*
• Quantidade: {quantidade}x Dogão do Pastor
• Valor Total: R$ {valor}

{instrucoes}

Obrigado pela preferência! 🙏`,

    deliveryMessage: `🚚 *Dogão do Pastor - Entrega* 🚚

Olá {nome}!

Seu pedido #{pedido} saiu para entrega!

👤 *Entregador:* {entregador}
⏰ *Previsão:* 15 a 40 minutos

Em breve você receberá seu pedido!

Obrigado! 🙏`,
  })

  const [loading, setLoading] = useState(false)
  const [loadingConfigs, setLoadingConfigs] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    try {
      const response = await fetch("/api/config", {
        cache: "no-store",
      })
      if (response.ok) {
        const configs = await response.json()
        setSettings((prev) => ({ ...prev, ...configs }))
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error)
    } finally {
      setLoadingConfigs(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ configs: settings }),
      })

      if (response.ok) {
        toast({
          title: "Configurações salvas",
          description: "As configurações foram atualizadas com sucesso.",
        })
      } else {
        throw new Error("Erro ao salvar configurações")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingConfigs) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerenciar configurações do sistema</p>
      </div>

      <div className="grid gap-6">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Gerais
            </CardTitle>
            <CardDescription>Configurações básicas do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Nome do Sistema</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Descrição</Label>
                <Input
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Notificação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>Configurar tipos de notificação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">Receber notificações por email</p>
              </div>
              <Switch
                checked={settings.emailNotifications === "true"}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked.toString() })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações por WhatsApp</Label>
                <p className="text-sm text-muted-foreground">Enviar notificações via WhatsApp</p>
              </div>
              <Switch
                checked={settings.whatsappNotifications === "true"}
                onCheckedChange={(checked) => setSettings({ ...settings, whatsappNotifications: checked.toString() })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações da Evolution API - Vendas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Evolution API - Vendas
            </CardTitle>
            <CardDescription>Configurações da API do WhatsApp para vendas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="evolutionApiUrl">URL da API</Label>
                <Input
                  id="evolutionApiUrl"
                  value={settings.evolutionApiUrl}
                  onChange={(e) => setSettings({ ...settings, evolutionApiUrl: e.target.value })}
                  placeholder="https://api.evolution.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evolutionInstance">Instância</Label>
                <Input
                  id="evolutionInstance"
                  value={settings.evolutionInstance}
                  onChange={(e) => setSettings({ ...settings, evolutionInstance: e.target.value })}
                  placeholder="IgrejaViva"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="evolutionToken">Token de Acesso</Label>
              <Input
                id="evolutionToken"
                type="password"
                value={settings.evolutionToken}
                onChange={(e) => setSettings({ ...settings, evolutionToken: e.target.value })}
                placeholder="••••••••••••••••"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações da Evolution API - Expedição */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Evolution API - Expedição
            </CardTitle>
            <CardDescription>Configurações da API do WhatsApp para expedição</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expeditionApiUrl">URL da API</Label>
                <Input
                  id="expeditionApiUrl"
                  value={settings.expeditionApiUrl}
                  onChange={(e) => setSettings({ ...settings, expeditionApiUrl: e.target.value })}
                  placeholder="https://api.evolution.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expeditionInstance">Instância</Label>
                <Input
                  id="expeditionInstance"
                  value={settings.expeditionInstance}
                  onChange={(e) => setSettings({ ...settings, expeditionInstance: e.target.value })}
                  placeholder="Expedicao"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expeditionToken">Token de Acesso</Label>
              <Input
                id="expeditionToken"
                type="password"
                value={settings.expeditionToken}
                onChange={(e) => setSettings({ ...settings, expeditionToken: e.target.value })}
                placeholder="••••••••••••••••"
              />
            </div>
          </CardContent>
        </Card>

        {/* Templates de Mensagens */}
        <Card>
          <CardHeader>
            <CardTitle>Templates de Mensagens</CardTitle>
            <CardDescription>Personalizar mensagens enviadas automaticamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">Mensagem de Boas-vindas (Voucher)</Label>
              <Textarea
                id="welcomeMessage"
                value={settings.welcomeMessage}
                onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                Variáveis: {"{nome}"}, {"{data}"}, {"{horario}"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseMessage">Mensagem de Confirmação de Compra</Label>
              <Textarea
                id="purchaseMessage"
                value={settings.purchaseMessage}
                onChange={(e) => setSettings({ ...settings, purchaseMessage: e.target.value })}
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                Variáveis: {"{nome}"}, {"{quantidade}"}, {"{valor}"}, {"{instrucoes}"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryMessage">Mensagem de Saída para Entrega</Label>
              <Textarea
                id="deliveryMessage"
                value={settings.deliveryMessage}
                onChange={(e) => setSettings({ ...settings, deliveryMessage: e.target.value })}
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                Variáveis: {"{nome}"}, {"{pedido}"}, {"{entregador}"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configurações do Banco de Dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Banco de Dados
            </CardTitle>
            <CardDescription>Informações sobre o banco de dados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status da Conexão</Label>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Conectado</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Banco de Dados</Label>
                <span className="text-sm text-muted-foreground">dogao-do-pastor</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Salvar */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </div>
    </div>
  )
}
