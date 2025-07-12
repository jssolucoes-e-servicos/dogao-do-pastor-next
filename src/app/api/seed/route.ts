import type { Edition } from "@/lib/models/database"
import clientPromise from "@/lib/mongodb"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { authorization } = await request.json()

    if (authorization !== "dogao2025") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    // Verificar se já existem vouchers
    const existingVouchers = await db.collection("vouchers").countDocuments()

    if (existingVouchers === 0) {
      // Criar 10 vouchers únicos
      const vouchers = []
      for (let i = 1; i <= 10; i++) {
        vouchers.push({
          code: `DOG${i.toString().padStart(3, "0")}`,
          used: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }

      await db.collection("vouchers").insertMany(vouchers)
    }

    // Verificar se já existe edição ativa
    const existingEdition = await db.collection("editions").findOne({ ativa: true })

    if (!existingEdition) {
      const edition: Edition = {
        nome: "Dogão do Pastor - Edição 1",
        dataProducao: new Date(),
        horaInicio: "10:00",
        horaTermino: "22:00",
        valorDog: 19.99,
        limiteEdicao: 1000,
        quantidadeVendida: 0,
        ativa: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await db.collection("editions").insertOne(edition)
    }

    // Listar dados criados
    const vouchers = await db.collection("vouchers").find({}).toArray()
    const editions = await db.collection("editions").find({}).toArray()

    return NextResponse.json({
      success: true,
      message: "Setup realizado com sucesso!",
      vouchers: vouchers.map((v) => v.code),
      editions: editions.length,
    })
  } catch (error) {
    console.error("Erro ao fazer setup:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    // Buscar dados sem cache
    const vouchers = await db.collection("vouchers").find({}).toArray()
    const customers = await db.collection("customers").find({}).toArray()
    const editions = await db.collection("editions").find({}).toArray()
    const voucherUsage = await db.collection("voucher_usage").find({}).toArray()
    const sales = await db.collection("sales").find({}).toArray()
    const dogs = await db.collection("sale_items").find({}).toArray()

    // Buscar edição ativa
    const activeEdition = await db.collection("editions").findOne({ ativa: true })

    // Calcular vendas que contam no limite (excluir vouchers e tickets)
    const countedSales = await db
      .collection("sale_items")
      .find({
        countInSales: { $ne: true },
      })
      .toArray()

    const totalSoldCount = countedSales.reduce((sum, sale) => {
      // Buscar itens da venda que contam
      return sum + (sale.quantity || 1)
    }, 0)

    return NextResponse.json(
      {
        vouchers: vouchers.map((v) => ({ code: v.code, used: v.used })),
        customers: customers.length,
        editions: editions.length,
        voucherUsage: voucherUsage.length,
        sales: sales.length,
        totalVouchers: vouchers.length,
        usedVouchers: vouchers.filter((v) => v.used).length,
        activeEdition: activeEdition,
        dogs: dogs,
        totalSoldCount, // Quantidade real vendida (que conta no limite)
        availableCount: activeEdition ? activeEdition.limiteEdicao - totalSoldCount : 0,
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
    console.error("Erro ao buscar dados:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
