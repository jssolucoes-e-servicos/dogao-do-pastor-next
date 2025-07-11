export interface Voucher {
  _id?: string
  code: string
  used: boolean
  usedAt?: Date
  clientId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  _id?: string
  nome: string
  telefone: string
  cpf: string
  endereco: string
  conheceIgreja: boolean
  autorizaContato: boolean
  voucherCode: string
  dataUtilizacao: Date
  status: "cadastrado" | "retirado"
  createdAt: Date
  updatedAt: Date
}

export interface ProductionConfig {
  _id?: string
  ativa: boolean
  dataProducao: string
  horarioFechamento: string
  proximaEdicao?: string
  createdAt: Date
  updatedAt: Date
}
