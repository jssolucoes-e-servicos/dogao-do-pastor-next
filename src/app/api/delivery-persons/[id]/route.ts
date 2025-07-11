import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    const { ObjectId } = require("mongodb")

    const result = await db.collection("delivery_persons").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      },
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Entregador não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Entregador atualizado com sucesso",
    })
  } catch (error) {
    console.error("Erro ao atualizar entregador:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
