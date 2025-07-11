import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    // Buscar pedidos pendentes e preparando com itens
    const orders = await db
      .collection("sales")
      .aggregate([
        {
          $match: {
            status: { $in: ["pending", "preparing"] },
          },
        },
        {
          $lookup: {
            from: "sale_items",
            localField: "_id",
            foreignField: "saleId",
            as: "items",
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
        pending: orders.filter((o) => o.status === "pending").length,
        preparing: orders.filter((o) => o.status === "preparing").length,
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
    console.error("Erro ao buscar fila de produção:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
