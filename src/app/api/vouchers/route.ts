import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    const vouchers = await db.collection("vouchers").find({}).sort({ code: 1 }).toArray()

    return NextResponse.json({
      vouchers,
      total: vouchers.length,
      used: vouchers.filter((v) => v.used).length,
      available: vouchers.filter((v) => !v.used).length,
    })
  } catch (error) {
    console.error("Erro ao buscar vouchers:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
