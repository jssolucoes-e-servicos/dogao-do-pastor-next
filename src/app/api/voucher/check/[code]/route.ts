import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params

    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    const voucher = await db.collection("vouchers").findOne({ code })

    if (!voucher) {
      return NextResponse.json({ error: "Voucher não encontrado", valid: false }, { status: 404 })
    }

    if (voucher.used) {
      return NextResponse.json({ error: "Voucher já utilizado", valid: false, used: true }, { status: 400 })
    }

    // Verificar se o voucher já foi validado (tem registro na tabela voucher_usage)
    const existingUsage = await db.collection("voucher_usage").findOne({
      voucherCode: code,
      status: "validated",
    })

    if (existingUsage) {
      // Buscar dados do cliente que já validou
      const existingCustomer = await db.collection("customers").findOne({
        _id: existingUsage.customerId,
      })

      return NextResponse.json(
        {
          error: `Este voucher já foi validado por ${existingCustomer?.name || "outro cliente"}. Cada voucher pode ser validado apenas uma vez.`,
          valid: false,
          alreadyValidated: true,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      valid: true,
      voucher: {
        code: voucher.code,
        used: voucher.used,
      },
    })
  } catch (error) {
    console.error("Erro ao verificar voucher:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
