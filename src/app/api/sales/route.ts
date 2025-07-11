import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Sale, SaleItem, Edition, Ticket } from "@/lib/models/database"
import { evolutionAPI } from "@/lib/evolution-api"

// Função para gerar número sequencial de 4 dígitos
async function generateOrderNumber(db: any): Promise<string> {
  const lastSale = await db.collection<Sale>("sales").findOne({}, { sort: { orderNumber: -1 } })

  let nextNumber = 1
  if (lastSale?.orderNumber) {
    const lastNum = Number.parseInt(lastSale.orderNumber)
    nextNumber = lastNum + 1
  }

  return nextNumber.toString().padStart(4, "0")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerName,
      customerPhone,
      customerAddress,
      paymentMethod,
      items,
      totalValue,
      isVoucher,
      isTicket,
      isTelevendas,
      voucherCode,
      ticketNumbers,
    } = body

    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    // Buscar edição ativa
    const activeEdition = await db.collection<Edition>("editions").findOne({ ativa: true })

    if (!activeEdition) {
      return NextResponse.json({ error: "Nenhuma edição ativa encontrada" }, { status: 400 })
    }

    // Se for pagamento com ticket, validar e marcar como usado
    if (paymentMethod === "ticket_dogao" && ticketNumbers?.length > 0) {
      // Verificar se todos os tickets estão disponíveis
      const availableTickets = await db
        .collection<Ticket>("tickets")
        .find({
          number: { $in: ticketNumbers },
          isUsed: false,
        })
        .toArray()

      if (availableTickets.length !== ticketNumbers.length) {
        return NextResponse.json(
          {
            error: "Um ou mais tickets já foram utilizados",
          },
          { status: 400 },
        )
      }

      // Marcar tickets como usados
      await db.collection<Ticket>("tickets").updateMany(
        { number: { $in: ticketNumbers } },
        {
          $set: {
            isUsed: true,
            usedAt: new Date(),
            updatedAt: new Date(),
          },
        },
      )
    }

    // Determinar se conta nas vendas
    const countInSales = !isVoucher && !isTicket

    // Gerar número do pedido
    const orderNumber = await generateOrderNumber(db)

    // Criar venda
    const sale: Sale = {
      orderNumber,
      customerName,
      customerPhone,
      customerAddress: customerAddress || undefined,
      paymentMethod,
      totalValue,
      editionId: activeEdition._id?.toString() || "",
      isVoucher: isVoucher || false,
      isTicket: isTicket || false,
      isTelevendas: isTelevendas || false,
      voucherCode: voucherCode || undefined,
      ticketNumbers: ticketNumbers || undefined,
      countInSales,
      status: "pending", // Status inicial
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const saleResult = await db.collection<Sale>("sales").insertOne(sale)

    // Criar itens da venda
    const saleItems: SaleItem[] = items.map((item: any) => ({
      saleId: saleResult.insertedId.toString(),
      itemName: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      removedIngredients: item.removedIngredients || [],
      observations: item.observations || "",
      countInSales: item.countInSales !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    await db.collection<SaleItem>("sale_items").insertMany(saleItems)

    // Atualizar quantidade vendida na edição (apenas itens que contam)
    const totalQuantity = saleItems.filter((item) => item.countInSales).reduce((sum, item) => sum + item.quantity, 0)

    if (totalQuantity > 0) {
      await db.collection<Edition>("editions").updateOne(
        { _id: activeEdition._id },
        {
          $inc: { quantidadeVendida: totalQuantity },
          $set: { updatedAt: new Date() },
        },
      )
    }

    // Enviar WhatsApp de confirmação
    try {
      if (!isVoucher) {
        await evolutionAPI.sendPurchaseConfirmation(
          customerName,
          customerPhone,
          totalQuantity,
          totalValue,
          isTelevendas,
        )
      }
    } catch (whatsappError) {
      console.error("Erro ao enviar WhatsApp:", whatsappError)
      // Não falhar a venda por causa do WhatsApp
    }

    return NextResponse.json(
      {
        success: true,
        message: "Venda registrada com sucesso!",
        sale: { ...sale, _id: saleResult.insertedId },
        items: saleItems,
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
    console.error("Erro ao registrar venda:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    // Buscar vendas com itens
    const salesWithItems = await db
      .collection("sales")
      .aggregate([
        {
          $lookup: {
            from: "sale_items",
            localField: "_id",
            foreignField: "saleId",
            as: "items",
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    return NextResponse.json(
      {
        sales: salesWithItems,
        total: salesWithItems.length,
        totalValue: salesWithItems.reduce((sum, sale) => sum + sale.totalValue, 0),
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
    console.error("Erro ao buscar vendas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
