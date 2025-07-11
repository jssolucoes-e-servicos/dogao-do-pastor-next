import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { evolutionAPI } from "@/lib/evolution-api"
import { validateCPF } from "@/lib/utils/cpf-validator"
import type { Customer, Voucher, VoucherUsage, Edition } from "@/lib/models/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, clientData } = body

    // Validar CPF
    if (!validateCPF(clientData.cpf)) {
      return NextResponse.json({ error: "CPF inválido" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("dogao-do-pastor")

    // Verificar se o voucher existe e não foi usado
    const voucher = await db.collection<Voucher>("vouchers").findOne({ code })

    if (!voucher) {
      return NextResponse.json({ error: "Voucher inválido ou não encontrado" }, { status: 404 })
    }

    if (voucher.used) {
      return NextResponse.json({ error: "Este voucher já foi utilizado" }, { status: 400 })
    }

    // Verificar se o voucher já foi validado (tem registro na tabela voucher_usage)
    const existingUsage = await db.collection<VoucherUsage>("voucher_usage").findOne({
      voucherCode: code,
      status: "validated",
    })

    if (existingUsage) {
      // Buscar dados do cliente que já validou
      const existingCustomer = await db.collection<Customer>("customers").findOne({
        _id: existingUsage.customerId,
      })

      return NextResponse.json(
        {
          error: `Este voucher já foi validado por ${existingCustomer?.name || "outro cliente"}. Cada voucher pode ser validado apenas uma vez.`,
        },
        { status: 400 },
      )
    }

    // Buscar qualquer edição para usar como referência (pode ser a mais recente)
    const edition = await db.collection<Edition>("editions").findOne({}, { sort: { createdAt: -1 } })

    if (!edition) {
      return NextResponse.json({ error: "Nenhuma edição encontrada no sistema" }, { status: 400 })
    }

    // REMOVER a validação de CPF único por edição - uma pessoa pode ter vários vouchers
    // Verificar se CPF já foi usado nesta edição
    // const existingCustomer = await db.collection<Customer>("customers").findOne({ cpf: clientData.cpf })
    // if (existingCustomer) {
    //   const existingUsage = await db.collection<VoucherUsage>("voucher_usage").findOne({
    //     customerId: existingCustomer._id?.toString(),
    //     editionId: edition._id?.toString(),
    //   })
    //   if (existingUsage) {
    //     return NextResponse.json({ error: "CPF já utilizado nesta edição" }, { status: 400 })
    //   }
    // }

    // Verificar se já existe cliente com este CPF
    const existingCustomer = await db.collection<Customer>("customers").findOne({ cpf: clientData.cpf })

    // Criar ou atualizar cliente
    let customer: Customer
    if (existingCustomer) {
      customer = existingCustomer
      // Atualizar dados do cliente existente
      await db.collection<Customer>("customers").updateOne(
        { _id: existingCustomer._id },
        {
          $set: {
            name: clientData.nome,
            phone: clientData.telefone,
            address: clientData.endereco,
            knowsChurch: clientData.conheceIgreja,
            allowsContact: clientData.autorizaContato,
            updatedAt: new Date(),
          },
        },
      )
    } else {
      const newCustomer: Customer = {
        name: clientData.nome,
        phone: clientData.telefone,
        cpf: clientData.cpf,
        address: clientData.endereco,
        knowsChurch: clientData.conheceIgreja,
        allowsContact: clientData.autorizaContato,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const customerResult = await db.collection<Customer>("customers").insertOne(newCustomer)
      customer = { ...newCustomer, _id: customerResult.insertedId.toString() }
    }

    // Criar registro de validação do voucher (não marca como usado ainda)
    const voucherUsage: VoucherUsage = {
      voucherId: voucher._id?.toString() || "",
      customerId: customer._id?.toString() || "",
      voucherCode: code,
      editionId: edition._id?.toString() || "",
      usedAt: new Date(),
      status: "validated", // Apenas validado, não usado
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection<VoucherUsage>("voucher_usage").insertOne(voucherUsage)

    // Enviar WhatsApp
    try {
      await evolutionAPI.sendWelcomeMessage(
        customer,
        edition.ativa || false,
        edition.dataProducao?.toISOString().split("T")[0] || edition.productionDate?.toISOString().split("T")[0],
        edition.horaTermino || edition.endTime,
      )
    } catch (whatsappError) {
      console.error("Erro ao enviar WhatsApp:", whatsappError)
    }

    return NextResponse.json({
      success: true,
      message: "Voucher validado com sucesso!",
      customer,
    })
  } catch (error) {
    console.error("Erro ao validar voucher:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
