import clientPromise from "@/lib/mongodb"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    const { ObjectId } = require("mongodb")

    // Buscar dados do pedido e entregador
    const order = await db.collection("sales").findOne({ _id: new ObjectId(orderId) })

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    // Atualizar pedido
    await db.collection("sales").updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          status: "delivered",
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({
      success: true,
      message: "Pedido finalizado",
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    console.error("Erro ao finalizar entrega:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
