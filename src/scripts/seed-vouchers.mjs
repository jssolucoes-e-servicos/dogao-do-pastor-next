import { MongoClient } from "mongodb"

const MONGODB_URI = "mongodb+srv://smartchurchplatform:DEV1_jssolucoes@cluster0.nrzefzq.mongodb.net/dogao-do-pastor?retryWrites=true&w=majority"

async function seedVouchers() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Conectado ao MongoDB")

    const db = client.db("dogao-do-pastor")

    // Limpar coleções existentes
    await db.collection("vouchers").deleteMany({})
    await db.collection("production_config").deleteMany({})

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
    console.log("10 vouchers criados com sucesso!")

    // Configuração inicial de produção
    const productionConfig = {
      ativa: true,
      dataProducao: new Date().toISOString().split("T")[0],
      horarioFechamento: "18:00",
      proximaEdicao: "2024-01-20",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection("production_config").insertOne(productionConfig)
    console.log("Configuração de produção criada!")

    // Listar vouchers criados
    const createdVouchers = await db.collection("vouchers").find({}).toArray()
    console.log("\nVouchers criados:")
    createdVouchers.forEach((voucher) => {
      console.log(`- ${voucher.code}`)
    })
  } catch (error) {
    console.error("Erro:", error)
  } finally {
    await client.close()
  }
}

seedVouchers()
