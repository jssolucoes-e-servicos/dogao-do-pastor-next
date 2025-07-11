import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Config } from "@/lib/models/database"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    const configs = await db.collection<Config>("configs").find({}).toArray()

    // Converter para objeto chave-valor
    const configObj: Record<string, string> = {}
    configs.forEach((config) => {
      configObj[config.key] = config.value
    })

    return NextResponse.json(configObj, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Erro ao buscar configurações:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { configs } = body

    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    // Atualizar ou inserir cada configuração
    for (const [key, value] of Object.entries(configs)) {
      await db.collection<Config>("configs").updateOne(
        { key },
        {
          $set: {
            key,
            value: value as string,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true },
      )
    }

    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error) {
    console.error("Erro ao salvar configurações:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
