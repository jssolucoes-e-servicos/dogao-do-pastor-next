"use client"

import type React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Gift, Info } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function VoucherPage() {
  const params = useParams()
  const [voucher, setVoucher] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [alreadyValidated, setAlreadyValidated] = useState(false)

  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    cpf: "",
    endereco: "",
    conheceIgreja: false,
    autorizaContato: false,
  })

  useEffect(() => {
    const checkVoucher = async () => {
      setLoading(true)

      try {
        const response = await fetch(`/api/voucher/check/${params.code}`)
        const data = await response.json()

        if (!response.ok) {
          if (response.status === 400 && data.error.includes("já foi validado")) {
            setAlreadyValidated(true)
            setError(data.error)
          } else {
            setError(data.error)
          }
        } else {
          setVoucher(data.voucher)
        }
      } catch (err) {
        setError("Erro ao verificar voucher")
      } finally {
        setLoading(false)
      }
    }

    if (params.code) {
      checkVoucher()
    }
  }, [params.code])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      if (!formData.nome || !formData.telefone || !formData.cpf || !formData.endereco) {
        throw new Error("Todos os campos obrigatórios devem ser preenchidos")
      }

      const response = await fetch("/api/voucher/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: params.code,
          clientData: formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (alreadyValidated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
              <Info className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-xl">Voucher Já Validado!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Se você é o proprietário deste voucher e precisa de ajuda,</p>
              <p>entre em contato com a organização do evento.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !voucher) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-600 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-xl">Voucher Inválido</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-600 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-xl">Cadastro Realizado!</CardTitle>
            <CardDescription>Seu voucher foi validado com sucesso</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert>
              <Gift className="h-4 w-4" />
              <AlertDescription>Você receberá as instruções via WhatsApp em breve!</AlertDescription>
            </Alert>
            <div className="text-sm text-muted-foreground">
              <p>📍 Local: Igreja Viva em Células</p>
              <p>⏰ Horário: Conforme instruções no WhatsApp</p>
              <p>📱 Acompanhe seu WhatsApp para mais detalhes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-600 flex items-center justify-center">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Dogão do Pastor</CardTitle>
          <CardDescription>Preencha seus dados para validar o voucher</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Digite seu nome completo"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone (WhatsApp) *</Label>
              <Input
                id="telefone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço Completo *</Label>
              <Input
                id="endereco"
                type="text"
                placeholder="Rua, número, bairro, cidade"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="conheceIgreja"
                  checked={formData.conheceIgreja}
                  onCheckedChange={(checked) => setFormData({ ...formData, conheceIgreja: checked as boolean })}
                />
                <Label htmlFor="conheceIgreja" className="text-sm">
                  Já conheço a Igreja Viva em Células
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autorizaContato"
                  checked={formData.autorizaContato}
                  onCheckedChange={(checked) => setFormData({ ...formData, autorizaContato: checked as boolean })}
                />
                <Label htmlFor="autorizaContato" className="text-sm">
                  Autorizo receber informações da igreja via WhatsApp
                </Label>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Validando..." : "Validar Voucher"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
