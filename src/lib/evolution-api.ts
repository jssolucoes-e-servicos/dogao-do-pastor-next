const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "https://whats-api.silkprintgrafica.com.br"
const EVOLUTION_TOKEN = process.env.EVOLUTION_TOKEN || "E3CCC9188853-4A52-B8AE-B7D78BEB613C"
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || "IgrejaViva"

export class EvolutionAPI {
  private baseUrl: string
  private token: string
  private instance: string

  constructor() {
    this.baseUrl = EVOLUTION_API_URL
    this.token = EVOLUTION_TOKEN
    this.instance = EVOLUTION_INSTANCE
  }

  private async makeRequest(endpoint: string, method = "GET", data?: any) {
    const url = `${this.baseUrl}/${endpoint}`

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        apikey: this.token,
      },
    }

    if (data && method !== "GET") {
      options.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(url, options)
      const result = await response.json()

      if (!response.ok) {
        console.error("Evolution API Error:", result)
        throw new Error(`Evolution API Error: ${result.message || "Unknown error"}`)
      }

      return result
    } catch (error) {
      console.error("Evolution API Request Error:", error)
      throw error
    }
  }

  async sendMessage(phone: string, message: string) {
    const endpoint = `message/sendText/${this.instance}`
    const cleanPhone = phone.replace(/\D/g, "")
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`

    const data = {
      number: formattedPhone,
      text: message,
      delay: 1200,
    }

    console.log("Enviando mensagem via Evolution API v2:", {
      endpoint: `${this.baseUrl}/${endpoint}`,
      data,
    })

    return await this.makeRequest(endpoint, "POST", data)
  }

  async sendWelcomeMessage(client: any, producaoAtiva: boolean, dataProducao?: string, horarioFechamento?: string) {
    let message = `🌭 *Dogão do Pastor* 🌭\n\nOlá ${client.name || client.nome}! Seu voucher foi validado com sucesso!\n\n`

    if (producaoAtiva && dataProducao && horarioFechamento) {
      message += `📍 *Instruções para retirada:*\n`
      message += `• Local: Igreja Viva em Células\n`
      message += `• Endereço: Avenida Dr. João Dentice, 241, Restinga, Porto Alegre/RS\n`
      message += `• Data: ${new Date(dataProducao).toLocaleDateString("pt-BR")}\n`
      message += `• Horário: Até às ${horarioFechamento}\n`
      message += `• Apresente este voucher no local\n\n`
      message += `⚠️ *Importante:* Você receberá um lembrete 1 hora antes do fechamento.\n\n`
    } else {
      message += `⚠️ *Produção Encerrada*\n\n`
      message += `A produção de hoje já foi encerrada, mas não se preocupe!\n`
      message += `Guarde seu voucher para usar na próxima edição.\n`
      message += `Você receberá a data da próxima edição em breve.\n\n`
    }

    message += `Deus abençoe! 🙏`

    console.log("Enviando mensagem de boas-vindas para:", client.phone || client.telefone)

    const result = await this.sendMessage(client.phone || client.telefone, message)

    // Enviar localização como segunda mensagem
    if (producaoAtiva) {
      await this.sendLocation(client.phone || client.telefone)
    }

    return result
  }

  async sendLocation(phone: string) {
    try {
      const endpoint = `message/sendLocation/${this.instance}`
      const cleanPhone = phone.replace(/\D/g, "")
      const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`

      const data = {
        number: formattedPhone,
        latitude: -30.1146,
        longitude: -51.1281,
        name: "Igreja Viva em Células",
        address: "Avenida Dr. João Dentice, 241, Restinga, Porto Alegre/RS",
      }

      console.log("Enviando localização via Evolution API v2:", data)

      return await this.makeRequest(endpoint, "POST", data)
    } catch (error) {
      console.error("Erro ao enviar localização:", error)
      // Não falhar se a localização não for enviada
    }
  }

  async sendPurchaseConfirmation(
    customerName: string,
    phone: string,
    quantity: number,
    totalValue: number,
    isTelevendas = false,
  ) {
    let message = `🌭 *Dogão do Pastor* 🌭\n\nOlá ${customerName}!\n\nSeu pedido foi realizado com sucesso!\n\n📋 *Detalhes do Pedido:*\n• Quantidade: ${quantity}x Dogão do Pastor\n• Valor Total: R$ ${totalValue.toFixed(2)}\n\n`

    if (isTelevendas) {
      message += `🚚 *Entrega:*\nSeu pedido será entregue em sua casa.\nPrevisão: 15 a 40 minutos\n\nVocê receberá uma mensagem quando o pedido sair para entrega.\n\n`
    } else {
      message += `⏰ *Próximos Passos:*\nEm breve você será chamado pelo nome na recepção para retirar seu pedido.\n\n`
    }

    message += `Obrigado pela preferência! 🙏`

    console.log("Enviando confirmação de compra para:", phone)

    return await this.sendMessage(phone, message)
  }

  async sendVoucherRedeemConfirmation(customerName: string, phone: string) {
    const message = `🌭 *Dogão do Pastor* 🌭\n\nOlá ${customerName}!\n\nSeu voucher foi resgatado com sucesso!\n\n⏰ *Próximos Passos:*\nEm breve você será chamado pelo nome na recepção para retirar seu dogão.\n\nObrigado! 🙏`

    console.log("Enviando confirmação de resgate para:", phone)

    return await this.sendMessage(phone, message)
  }

  async sendDeliveryNotification(customerName: string, phone: string, orderNumber: string, deliveryPersonName: string) {
    const message = `🚚 *Dogão do Pastor - Entrega* 🚚\n\nOlá ${customerName}!\n\nSeu pedido #${orderNumber} saiu para entrega!\n\n👤 *Entregador:* ${deliveryPersonName}\n⏰ *Previsão:* 15 a 40 minutos\n\nEm breve você receberá seu pedido!\n\nObrigado! 🙏`

    console.log("Enviando notificação de entrega para:", phone)

    return await this.sendMessage(phone, message)
  }

  async sendDeliveryInstructions(deliveryPersonPhone: string, orders: any[]) {
    let message = `🚚 *Dogão do Pastor - Entregas* 🚚\n\nVocê tem ${orders.length} entrega(s) para fazer:\n\n`

    orders.forEach((order, index) => {
      message += `📦 *Pedido #${order.orderNumber}*\n`
      message += `👤 Cliente: ${order.customerName}\n`
      message += `📞 Telefone: ${order.customerPhone}\n`
      message += `📍 Endereço: ${order.customerAddress}\n`
      message += `🗺️ Maps: https://maps.google.com/?q=${encodeURIComponent(order.customerAddress)}\n\n`
    })

    message += `Boa entrega! 🙏`

    console.log("Enviando instruções de entrega para:", deliveryPersonPhone)

    return await this.sendMessage(deliveryPersonPhone, message)
  }

  async sendDeliveryPersonRegister(deliveryPersonPhone: string, deliveryPersonName: string) {
    let message = `🚚 *Dogão do Pastor - Cadastro de Entregador* 🚚\n\nOlá ${deliveryPersonName}, você foi cadastrado como entregador em nossa plataforma.\n\n`

    message += `Quando uma nova rota for atribuida você receberá em seu whatsapp os dados de suas entregas.\n\n`;

    message += `Boas entregas! 🙏`;

    return await this.sendMessage(deliveryPersonPhone, message)
  }

  async getInstanceStatus() {
    const endpoint = `instance/connectionState/${this.instance}`
    return await this.makeRequest(endpoint, "GET")
  }

  async checkWhatsAppNumber(phone: string) {
    const endpoint = `chat/whatsappNumbers/${this.instance}`
    const cleanPhone = phone.replace(/\D/g, "")
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`

    const data = {
      numbers: [formattedPhone],
    }

    return await this.makeRequest(endpoint, "POST", data)
  }
}

export const evolutionAPI = new EvolutionAPI()
