import { MongoClient } from "mongodb"

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://smartchurchplatform:DEV1_jssolucoes@cluster0.nrzefzq.mongodb.net/dogao-do-pastor?retryWrites=true&w=majority"

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

export default clientPromise
