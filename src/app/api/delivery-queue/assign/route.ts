import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { evolutionAPI } from "@/lib/evolution-api"

export async function POST(request: NextRequest) {
  try {
    const { orderId, deliveryPersonId } = await request.json()

    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    const { ObjectId } = require("mongodb")

    // Buscar dados do pedido e entregador
    const order = await db.collection("sales").findOne({ _id: new ObjectId(orderId) })
    const deliveryPerson = await db.collection("delivery_persons").findOne({ _id: new ObjectId(deliveryPersonId) })

    if (!order || !deliveryPerson) {
      return NextResponse.json({ error: "Pedido ou entregador não encontrado" }, { status: 404 })
    }

    // Atualizar pedido
    await db.collection("sales").updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          status: "out_for_delivery",
          deliveryPersonId: deliveryPersonId,
          updatedAt: new Date(),
        },
      },
    )

    // Enviar WhatsApp para cliente
    try {
      await evolutionAPI.sendDeliveryNotification(
        order.customerName,
        order.customerPhone,
        order.orderNumber,
        deliveryPerson.name,
      )
    } catch (whatsappError) {
      console.error("Erro ao enviar WhatsApp para cliente:", whatsappError)
    }

    // Enviar WhatsApp para entregador
    try {
      await evolutionAPI.sendDeliveryInstructions(deliveryPerson.phone, [
        {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerAddress: order.customerAddress,
        },
      ])
    } catch (whatsappError) {
      console.error("Erro ao enviar WhatsApp para entregador:", whatsappError)
    }

    return NextResponse.json({
      success: true,
      message: "Entregador atribuído e notificações enviadas",
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    console.error("Erro ao atribuir entregador:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
