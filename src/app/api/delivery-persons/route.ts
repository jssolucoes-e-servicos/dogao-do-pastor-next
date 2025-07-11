import { evolutionAPI } from "@/lib/evolution-api"
import type { DeliveryPerson } from "@/lib/models/database"
import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    const deliveryPersons = await db.collection<DeliveryPerson>("delivery_persons").find({}).sort({ name: 1 }).toArray()

    return NextResponse.json(
      {
        deliveryPersons,
        total: deliveryPersons.length,
        active: deliveryPersons.filter((dp) => dp.isActive).length,
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
    console.error("Erro ao buscar entregadores:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, isActive } = body

    if (!name || !phone) {
      return NextResponse.json({ error: "Nome e telefone são obrigatórios" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    const deliveryPerson: DeliveryPerson = {
      name,
      phone,
      isActive: isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection<DeliveryPerson>("delivery_persons").insertOne(deliveryPerson)

    try {
      await evolutionAPI.sendDeliveryPersonRegister(phone, name);
    } catch (whatsappError) {
      console.error("Erro ao enviar WhatsApp para cliente:", whatsappError)
    }

    return NextResponse.json({
      success: true,
      message: "Entregador cadastrado com sucesso",
    })
  } catch (error) {
    console.error("Erro ao cadastrar entregador:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
