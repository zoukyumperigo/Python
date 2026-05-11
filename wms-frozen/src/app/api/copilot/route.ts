import { NextRequest, NextResponse } from 'next/server'
import { products, stockLots, shippingOrders, divergences, dashboardStats } from '@/lib/mockData'

function generateResponse(message: string): string {
  const msg = message.toLowerCase()

  if (msg.includes('acab') || msg.includes('crític') || msg.includes('mínimo')) {
    const critical = products.filter(p => (p.currentStock ?? 0) <= p.minStock)
    if (critical.length === 0) return 'Não existem produtos em stock crítico no momento.'
    const list = critical.map(p =>
      `• **${p.name}** (${p.code}): stock actual ${p.currentStock ?? 0} caixas, mínimo ${p.minStock} caixas`
    ).join('\n')
    return `Encontrei **${critical.length} produto(s) com stock crítico**:\n\n${list}\n\nRecomendo criar ordens de compra urgentes para estes produtos.`
  }

  if (msg.includes('atras') || msg.includes('pend')) {
    const overdue = shippingOrders.filter(s =>
      ['PENDING', 'CONFIRMED', 'IN_PICKING'].includes(s.status) &&
      s.requestedDate && new Date(s.requestedDate) <= new Date()
    )
    if (overdue.length === 0) return 'Não existem pedidos de expedição atrasados no momento.'
    const list = overdue.map(o =>
      `• **${o.code}** — Data solicitada: ${o.requestedDate ? new Date(o.requestedDate).toLocaleDateString('pt-PT') : 'N/D'} — Estado: ${o.status}`
    ).join('\n')
    return `Existem **${overdue.length} pedido(s) atrasado(s)**:\n\n${list}\n\nRecomendo verificar o estado do picking e contactar os clientes afetados.`
  }

  if (msg.includes('venc') || msg.includes('validade') || msg.includes('expirar')) {
    const expiring = stockLots.filter(s =>
      s.daysUntilExpiry !== undefined && s.daysUntilExpiry > 0 && s.daysUntilExpiry <= 30
    )
    if (expiring.length === 0) return 'Não existem lotes a vencer nos próximos 30 dias.'
    const list = expiring.map(s => {
      const prod = products.find(p => p.id === s.productId)
      return `• **${prod?.name ?? s.productId}** — Lote ${s.lotNumber}: vence em **${s.daysUntilExpiry} dias** (${s.quantity} caixas, ${s.status})`
    }).join('\n')
    return `Existem **${expiring.length} lote(s) a vencer nos próximos 30 dias**:\n\n${list}\n\nAção recomendada: priorizar expedição destes lotes e criar alertas para os clientes.`
  }

  if (msg.includes('pick') || msg.includes('operador') || msg.includes('produtividade')) {
    const ops = dashboardStats.operatorProductivity
    const sorted = [...ops].sort((a, b) => b.picking - a.picking)
    const top = sorted[0]
    const list = sorted.map(o =>
      `• **${o.name}**: ${o.picking} picking, ${o.recepcao} receção, ${o.transferencia} transferência`
    ).join('\n')
    return `Produtividade dos operadores hoje:\n\n${list}\n\nO operador mais produtivo em picking é **${top.name}** com ${top.picking} tarefas.`
  }

  if (msg.includes('compras') || msg.includes('encomendar') || msg.includes('repor')) {
    const needed = products.filter(p => (p.currentStock ?? 0) < p.idealStock)
    if (needed.length === 0) return 'Todos os produtos estão acima do stock ideal.'
    const list = needed.map(p => {
      const qty = p.idealStock - (p.currentStock ?? 0)
      return `• **${p.name}** (${p.code}): encomendar **${qty} caixas** (actual: ${p.currentStock ?? 0}, ideal: ${p.idealStock})`
    }).join('\n')
    return `Sugestão de compras baseada no stock ideal (${needed.length} produtos):\n\n${list}`
  }

  if (msg.includes('diverg')) {
    const open = divergences.filter(d => ['OPEN', 'IN_PROGRESS'].includes(d.status))
    const critical = open.filter(d => d.priority === 'CRITICAL')
    const list = open.map(d =>
      `• **${d.code}** [${d.priority}]: ${d.description.substring(0, 100)}${d.description.length > 100 ? '...' : ''}`
    ).join('\n')
    return `Existem **${open.length} divergência(s) em aberto** (${critical.length} crítica(s)):\n\n${list}`
  }

  return 'Não tenho informação suficiente para responder a essa pergunta. Tente reformular com palavras-chave como: "stock crítico", "validades", "pedidos atrasados", "operadores", "compras" ou "divergências".'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Campo obrigatório em falta: message' },
        { status: 400 }
      )
    }

    // Simulate processing delay (optional — commented out for API responsiveness)
    // await new Promise(resolve => setTimeout(resolve, 500))

    const response = generateResponse(body.message)

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao processar pedido' }, { status: 500 })
  }
}
