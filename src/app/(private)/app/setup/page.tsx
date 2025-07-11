"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Database, Loader2 } from "lucide-react"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")
  const [dbStatus, setDbStatus] = useState<any>(null)

  const checkDatabase = async () => {
    setChecking(true)
    setError("")

    try {
      const response = await fetch("/api/seed", {
        method: "GET",
      })

      const data = await response.json()

      if (response.ok) {
        setDbStatus(data)
      } else {
        setError(data.error)
      }
    } catch (err: any) {
      setError("Erro ao verificar banco de dados")
    } finally {
      setChecking(false)
    }
  }

  const createInitialData = async () => {
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorization: "dogao2024",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        await checkDatabase()
      } else {
        setError(data.error)
      }
    } catch (err: any) {
      setError("Erro ao criar dados iniciais")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Setup do Sistema</h1>
        <p className="text-muted-foreground">Configuração inicial do banco de dados</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Status do Banco de Dados
            </CardTitle>
            <CardDescription>Verificar dados existentes no sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkDatabase} disabled={checking} variant="outline" className="w-full bg-transparent">
              {checking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar Banco de Dados"
              )}
            </Button>

            {dbStatus && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Vouchers:</span>
                    <Badge variant={dbStatus.totalVouchers > 0 ? "default" : "secondary"}>
                      {dbStatus.totalVouchers}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Usados:</span>
                    <Badge variant={dbStatus.usedVouchers > 0 ? "destructive" : "secondary"}>
                      {dbStatus.usedVouchers}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Clientes:</span>
                    <Badge variant={dbStatus.customers > 0 ? "default" : "secondary"}>{dbStatus.customers}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Edições:</span>
                    <Badge variant={dbStatus.editions > 0 ? "default" : "secondary"}>{dbStatus.editions}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Vendas:</span>
                    <Badge variant={dbStatus.sales > 0 ? "default" : "secondary"}>{dbStatus.sales}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Usos:</span>
                    <Badge variant={dbStatus.voucherUsage > 0 ? "default" : "secondary"}>{dbStatus.voucherUsage}</Badge>
                  </div>
                </div>

                {dbStatus.vouchers && dbStatus.vouchers.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium">Vouchers:</span>
                    <div className="grid grid-cols-5 gap-1">
                      {dbStatus.vouchers.map((voucher: any) => (
                        <Badge
                          key={voucher.code}
                          variant={voucher.used ? "destructive" : "default"}
                          className="text-xs"
                        >
                          {voucher.code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Criar Dados Iniciais
            </CardTitle>
            <CardDescription>Setup inicial do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={createInitialData} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Executar Setup Inicial"
              )}
            </Button>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Criará vouchers DOG001 até DOG010</p>
              <p>• Configurará edição inicial</p>
              <p>• Definirá horários e valores padrão</p>
              <p>• Só executa se não existirem dados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">{result.message}</p>
              {result.vouchers && (
                <div>
                  <p className="text-sm">Vouchers: {result.vouchers.join(", ")}</p>
                  <p className="text-sm">Edições: {result.editions}</p>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>URLs de Teste</CardTitle>
          <CardDescription>Links para testar o sistema após o setup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid gap-2">
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="text-sm">Voucher DOG001:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`${window.location.origin}/voucher/DOG001`, "_blank")}
              >
                Testar
              </Button>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="text-sm">Voucher DOG002:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`${window.location.origin}/voucher/DOG002`, "_blank")}
              >
                Testar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
