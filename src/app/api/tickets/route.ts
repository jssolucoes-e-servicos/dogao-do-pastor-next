import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Ticket } from "@/lib/models/database"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    const tickets = await db.collection<Ticket>("tickets").find({}).sort({ number: 1 }).toArray()

    const usedCount = await db.collection<Ticket>("tickets").countDocuments({ isUsed: true })
    const availableCount = await db.collection<Ticket>("tickets").countDocuments({ isUsed: false })

    return NextResponse.json(
      {
        tickets,
        usedCount,
        availableCount,
        totalCount: tickets.length,
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
    console.error("Erro ao buscar tickets:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ticketNumbers } = body

    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    if (action === "mark_used") {
      // Marcar tickets como usados (baixa manual)
      const result = await db.collection<Ticket>("tickets").updateMany(
        {
          number: { $in: ticketNumbers },
          isUsed: false,
        },
        {
          $set: {
            isUsed: true,
            usedAt: new Date(),
            updatedAt: new Date(),
          },
        },
      )

      return NextResponse.json({
        success: true,
        message: `${result.modifiedCount} tickets marcados como usados`,
        modifiedCount: result.modifiedCount,
      })
    }

    if (action === "validate") {
      // Validar se tickets estão disponíveis
      const tickets = await db
        .collection<Ticket>("tickets")
        .find({
          number: { $in: ticketNumbers },
          isUsed: false,
        })
        .toArray()

      const availableTickets = tickets.map((t) => t.number)
      const unavailableTickets = ticketNumbers.filter((num: string) => !availableTickets.includes(num))

      return NextResponse.json({
        availableTickets,
        unavailableTickets,
        allAvailable: unavailableTickets.length === 0,
      })
    }

    return NextResponse.json({ error: "Ação não reconhecida" }, { status: 400 })
  } catch (error) {
    console.error("Erro ao processar tickets:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
