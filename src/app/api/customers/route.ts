import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    // Buscar clientes sem cache, forçando nova consulta
    const customers = await db.collection("customers").find({}).sort({ createdAt: -1 }).toArray()

    console.log("Clientes encontrados:", customers.length)

    return NextResponse.json(
      {
        customers,
        total: customers.length,
        conhecemIgreja: customers.filter((c) => c.knowsChurch || c.conheceIgreja).length,
        autorizamContato: customers.filter((c) => c.allowsContact || c.autorizaContato).length,
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
    console.error("Erro ao buscar clientes:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
