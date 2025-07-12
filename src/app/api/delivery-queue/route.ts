import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    // Buscar pedidos prontos e saindo para entrega
    const orders = await db
      .collection("sales")
      .aggregate([
        {
          $match: {
            status: { $in: ["ready", "out_for_delivery"] },
            isTelevendas: true, // Apenas pedidos de entrega
          },
        },
        {
          $lookup: {
            from: "delivery_persons",
            localField: "deliveryPersonId",
            foreignField: "_id",
            as: "deliveryPerson",
          },
        },
        {
          $addFields: {
            deliveryPersonName: { $arrayElemAt: ["$deliveryPerson.name", 0] },
          },
        },
        {
          $sort: { createdAt: 1 },
        },
      ])
      .toArray()

    return NextResponse.json(
      {
        orders,
        total: orders.length,
        ready: orders.filter((o) => o.status === "ready").length,
        outForDelivery: orders.filter((o) => o.status === "out_for_delivery").length,
        delivered: orders.filter((o) => o.status === "delivered").length,
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
    console.error("Erro ao buscar fila de entregas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
