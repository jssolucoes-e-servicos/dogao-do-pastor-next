"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Camera, Search } from "lucide-react"

export default function ScannerPage() {
  const [manualCode, setManualCode] = useState("")

  const handleManualValidation = () => {
    if (manualCode) {
      window.open(`/voucher/${manualCode}`, "_blank")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Scanner</h1>
        <p className="text-muted-foreground">Escaneie ou digite códigos de vouchers</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scanner QR Code
            </CardTitle>
            <CardDescription>Use a câmera para escanear vouchers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Scanner QR Code em desenvolvimento</p>
              </div>
            </div>
            <Button className="w-full" disabled>
              Ativar Câmera
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Validação Manual
            </CardTitle>
            <CardDescription>Digite o código do voucher manualmente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manualCode">Código do Voucher</Label>
              <Input
                id="manualCode"
                placeholder="DOG001"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              />
            </div>
            <Button onClick={handleManualValidation} className="w-full" disabled={!manualCode}>
              Validar Voucher
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vouchers de Teste</CardTitle>
          <CardDescription>Links rápidos para testar vouchers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            {["DOG001", "DOG002", "DOG003", "DOG004", "DOG005"].map((code) => (
              <Button
                key={code}
                variant="outline"
                onClick={() => window.open(`/voucher/${code}`, "_blank")}
                className="justify-start"
              >
                {code}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
