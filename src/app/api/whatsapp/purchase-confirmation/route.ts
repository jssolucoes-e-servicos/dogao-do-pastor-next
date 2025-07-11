import { type NextRequest, NextResponse } from "next/server"
import { evolutionAPI } from "@/lib/evolution-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, phone, quantity, totalValue } = body

    await evolutionAPI.sendPurchaseConfirmation(customerName, phone, quantity, totalValue)

    return NextResponse.json({
      success: true,
      message: "Mensagem de confirmação enviada",
    })
  } catch (error) {
    console.error("Erro ao enviar confirmação de compra:", error)
    return NextResponse.json({ error: "Erro ao enviar mensagem" }, { status: 500 })
  }
}
