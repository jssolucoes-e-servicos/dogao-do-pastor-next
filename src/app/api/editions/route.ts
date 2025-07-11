import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    const editions = await db.collection("editions").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      editions,
      total: editions.length,
      active: editions.filter((e) => e.ativa).length,
    })
  } catch (error) {
    console.error("Erro ao buscar edições:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
