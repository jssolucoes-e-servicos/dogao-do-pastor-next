import type { ObjectId } from "mongodb"

// Interfaces principais
export interface Edition {
  _id?: ObjectId
  nome: string
  dataProducao: Date
  horarioFechamento: string
  quantidadeTotal: number
  quantidadeVendida: number
  valorDog: number
  ativa: boolean
  producaoAtiva: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Voucher {
  _id?: ObjectId
  code: string
  clientName: string
  clientPhone: string
  clientCPF?: string
  isUsed: boolean
  usedAt?: Date
  editionId: string
  createdAt: Date
  updatedAt: Date
}

export interface Customer {
  _id?: ObjectId
  name: string
  phone: string
  cpf?: string
  address?: string
  createdAt: Date
  updatedAt: Date
}

export interface Sale {
  _id?: ObjectId
  orderNumber: string
  customerName: string
  customerPhone: string
  customerAddress?: string
  paymentMethod: string
  totalValue: number
  editionId: string
  isVoucher: boolean
  isTicket: boolean
  isTelevendas: boolean
  voucherCode?: string
  ticketNumbers?: string[]
  countInSales: boolean
  status: string
  deliveryPersonId?: string
  createdAt: Date
  updatedAt: Date
}

export interface SaleItem {
  _id?: ObjectId
  saleId: string
  itemName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  removedIngredients: string[]
  observations: string
  countInSales: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Ticket {
  _id?: ObjectId
  number: string
  isUsed: boolean
  usedAt?: Date
  saleId?: string
  createdAt: Date
  updatedAt: Date
}

export interface DeliveryPerson {
  _id?: ObjectId
  name: string
  phone: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Config {
  _id?: ObjectId
  key: string
  value: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

// Constantes
export const AVAILABLE_INGREDIENTS = [
  "Batata Palha",
  "Ervilha",
  "Ketchup",
  "Maionese",
  "Milho",
  "Molho 4 Queijos",
  "Molho vermelho",
  "Mostarda",
  "Pão",
  "Queijo",
  "Salsicha",
]

export const PAYMENT_METHODS = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "ticket_dogao", label: "Ticket Dogão" },
]

export const DELIVERY_TYPES = [
  { value: "pickup", label: "Retirada no Local" },
  { value: "televendas", label: "Entrega (Televendas)" },
]

export const ORDER_STATUS = [
  { value: "pending", label: "Pendente" },
  { value: "preparing", label: "Preparando" },
  { value: "ready", label: "Pronto" },
  { value: "expedition", label: "Balcão" }
  { value: "out_for_delivery", label: "Saiu para Entrega" },
  { value: "delivered", label: "Entregue" },
  { value: "cancelled", label: "Cancelado" },
]

export const CELL_GROUPS = [
  "Aba - Uilian Silva",
  "Ágape - Alexandre Cardoso",
  "Ebenézer 1 - Anderson Briance",
  "Ebenézer 2 - Mônica Junker",
  "Ebenézer 3 - Elusa Lauermann",
  "Ebenézer 4 - Carla",
  "Ebenézer 5 - Mara",
  "Emaús - Jackson de Abreu",
  "Igreja Viva - Pr Fabiano Santos",
  "Jardim Ragado 2 - Alice Taboada",
  "Jardim Regado 3 - Adriana Batista",
  "Jardim Regado 5 - Patricia Borges",
  "Jovens - Kelvin",
  "JUNI'S ALIVE - Kerollen Bica",
  "JUNIS's - Aline Moraes",
  "VIDA 1 - Pr. Fabiano",
  "Viva Kids - Shayane Correa",
]
