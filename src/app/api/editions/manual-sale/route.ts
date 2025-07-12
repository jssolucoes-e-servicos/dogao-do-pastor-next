import type { Edition, Sale } from "@/lib/models/database"
import clientPromise from "@/lib/mongodb"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cellName, quantity } = body

    const editionId = '68703b3580b075178fc218ad';

    if (!cellName || !quantity || !editionId) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    const { ObjectId } = require("mongodb")

    // Buscar edição
    const edition = await db.collection<Edition>("editions").findOne({ _id: new ObjectId(editionId) })

    if (!edition) {
      return NextResponse.json({ error: "Edição não encontrada" }, { status: 404 })
    }

    // Gerar número sequencial de 4 dígitos
    const lastSale = await db.collection<Sale>("sales").findOne({}, { sort: { orderNumber: -1 } })

    let nextNumber = 1
    if (lastSale?.orderNumber) {
      const lastNum = Number.parseInt(lastSale.orderNumber)
      nextNumber = lastNum + 1
    }

    const orderNumber = nextNumber.toString().padStart(4, "0")

    // Criar registro de venda manual
    const sale: Sale = {
      orderNumber,
      customerName: `ACERTO DA CÉLULA - ${cellName}`,
      customerPhone: "N/A",
      paymentMethod: "cash", // Assumir dinheiro para vendas manuais
      totalValue: edition.valorDog * Number.parseInt(quantity),
      editionId: editionId,
      isVoucher: false,
      isTicket: false,
      cellName: cellName,
      countInSales: true, // Vendas manuais contam no limite
      status: "delivered", // Vendas manuais já são consideradas entregues
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection<Sale>("sales").insertOne(sale)

    // Atualizar quantidade vendida na edição
    await db.collection<Edition>("editions").updateOne(
      { _id: new ObjectId(editionId) },
      {
        $inc: { quantidadeVendida: Number.parseInt(quantity) },
        $set: { updatedAt: new Date() },
      },
    )

    return NextResponse.json(
      {
        success: true,
        message: "Venda manual registrada com sucesso!",
        sale,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error) {
    console.error("Erro ao registrar venda manual:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
