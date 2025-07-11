import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Voucher, Sale, Edition } from "@/lib/models/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { voucherCode, customerName, customerPhone, ingredientesRemovidos } = body

    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    // Verificar se o voucher existe e não foi usado
    const voucher = await db.collection<Voucher>("vouchers").findOne({ code: voucherCode })

    if (!voucher) {
      return NextResponse.json({ error: "Voucher não encontrado" }, { status: 404 })
    }

    if (voucher.used) {
      return NextResponse.json({ error: "Voucher já foi utilizado" }, { status: 400 })
    }

    // Buscar edição ativa
    const activeEdition = await db.collection<Edition>("editions").findOne({ ativa: true })

    if (!activeEdition) {
      return NextResponse.json({ error: "Nenhuma edição ativa encontrada" }, { status: 400 })
    }

    // Criar registro de venda como voucher
    const sale: Sale = {
      customerName,
      customerPhone,
      quantidade: 1,
      formaPagamento: "voucher",
      ingredientesRemovidos: ingredientesRemovidos || [],
      valorTotal: 0, // Voucher não tem valor
      valorUnitario: 0,
      editionId: activeEdition._id?.toString() || "",
      isVoucher: true,
      voucherCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection<Sale>("sales").insertOne(sale)

    // Marcar voucher como usado
    await db.collection<Voucher>("vouchers").updateOne(
      { code: voucherCode },
      {
        $set: {
          used: true,
          usedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    // Atualizar quantidade vendida na edição
    await db.collection<Edition>("editions").updateOne(
      { _id: activeEdition._id },
      {
        $inc: { quantidadeVendida: 1 },
        $set: { updatedAt: new Date() },
      },
    )

    return NextResponse.json({
      success: true,
      message: "Voucher resgatado com sucesso!",
      sale,
    })
  } catch (error) {
    console.error("Erro ao resgatar voucher:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
