import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    const { ObjectId } = require("mongodb")

    // Atualizar status do pedido para "ready"
    const result = await db.collection("sales").updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          status: "ready",
          updatedAt: new Date(),
        },
      },
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    // Buscar dados do pedido para retornar
    const order = await db.collection("sales").findOne({ _id: new ObjectId(orderId) })

    return NextResponse.json({
      success: true,
      message: "Pedido movido para fila de entrega",
      orderNumber: order?.orderNumber,
    })
  } catch (error) {
    console.error("Erro ao mover pedido:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
