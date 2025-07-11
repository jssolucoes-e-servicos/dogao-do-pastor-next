import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params

    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    // Verificar se o voucher existe
    const voucher = await db.collection("vouchers").findOne({ code })

    if (!voucher) {
      return NextResponse.json({ error: "Voucher não encontrado" }, { status: 404 })
    }

    if (voucher.used) {
      // Buscar dados do uso para mostrar quando foi usado
      const usage = await db.collection("voucher_usage").findOne({ voucherCode: code, status: "redeemed" })
      const edition = usage ? await db.collection("editions").findOne({ _id: usage.editionId }) : null

      return NextResponse.json(
        {
          error: `Voucher já foi resgatado na edição: ${edition?.nome || "Edição anterior"} em ${new Date(voucher.usedAt).toLocaleDateString("pt-BR")}`,
        },
        { status: 400 },
      )
    }

    // Verificar se o voucher foi validado (tem registro na tabela voucher_usage)
    const voucherUsage = await db.collection("voucher_usage").findOne({
      voucherCode: code,
      status: "validated",
    })

    if (!voucherUsage) {
      return NextResponse.json(
        {
          error: "Voucher não liberado para resgate. Cliente deve primeiro validar o voucher através do link.",
        },
        { status: 400 },
      )
    }

    // Buscar dados do cliente usando ObjectId corretamente
    const { ObjectId } = require("mongodb")
    const customer = await db.collection("customers").findOne({
      _id: new ObjectId(voucherUsage.customerId),
    })

    if (!customer) {
      return NextResponse.json({ error: "Dados do cliente não encontrados" }, { status: 404 })
    }

    return NextResponse.json({
      valid: true,
      voucher: {
        code: voucher.code,
        used: voucher.used,
      },
      customer: {
        name: customer.name,
        phone: customer.phone,
        cpf: customer.cpf,
      },
    })
  } catch (error) {
    console.error("Erro ao validar voucher para resgate:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
