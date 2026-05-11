'use client'

import { useState, useRef, useEffect } from 'react'
import { products, stockLots, shippingOrders, divergences, dashboardStats } from '@/lib/mockData'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTED_QUESTIONS = [
  'Que produtos estão a acabar?',
  'Que pedidos estão atrasados?',
  'Produtos que vencem nos próximos 30 dias?',
  'Qual operador fez mais picking hoje?',
  'Sugerir compras por stock mínimo',
  'Explicar divergências abertas',
]

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

  if (msg.includes('venc') || msg.includes('validade') || msg.includes('expirar') || msg.includes('expiração')) {
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
    return `Sugestão de compras baseada no stock ideal (${needed.length} produtos):\n\n${list}\n\nRecomendo criar ordens de compra para os fornecedores habituais.`
  }

  if (msg.includes('diverg')) {
    const open = divergences.filter(d => ['OPEN', 'IN_PROGRESS'].includes(d.status))
    const critical = open.filter(d => d.priority === 'CRITICAL')
    const list = open.map(d =>
      `• **${d.code}** [${d.priority}]: ${d.description.substring(0, 80)}${d.description.length > 80 ? '...' : ''}`
    ).join('\n')
    return `Existem **${open.length} divergência(s) em aberto** (${critical.length} crítica(s)):\n\n${list}\n\nDar prioridade às divergências de lotes vencidos e diferenças de receção.`
  }

  if (msg.includes('stock') && (msg.includes('resumo') || msg.includes('total') || msg.includes('geral'))) {
    return `**Resumo do Stock Actual:**\n\n• Total de caixas em stock: **${dashboardStats.totalStockValue}**\n• Produtos em stock crítico: **${dashboardStats.criticalProducts}**\n• Lotes a vencer em breve: **${dashboardStats.expiringProducts}**\n• Tarefas activas: **${dashboardStats.activeTasks}**\n• Divergências abertas: **${dashboardStats.openDivergences}**`
  }

  if (msg.includes('expediç') && msg.includes('resumo')) {
    const pending = shippingOrders.filter(o => ['PENDING', 'CONFIRMED'].includes(o.status))
    const inPicking = shippingOrders.filter(o => o.status === 'IN_PICKING')
    const dispatched = shippingOrders.filter(o => o.status === 'DISPATCHED')
    return `**Resumo de Expedições:**\n\n• Pendentes de confirmação: **${pending.length}**\n• Em picking: **${inPicking.length}**\n• Expedidas hoje: **${dispatched.length}**\n\nOrdens em curso: ${shippingOrders.filter(o => ['CONFIRMED', 'IN_PICKING'].includes(o.status)).map(o => o.code).join(', ') || 'nenhuma'}`
  }

  return 'Não tenho informação suficiente para responder a essa pergunta. Tente reformular ou escolha uma das sugestões disponíveis.'
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  const lines = message.content.split('\n')

  const renderContent = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g)
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
    )
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shadow ${isUser ? 'bg-blue-600 text-white' : 'bg-gradient-to-br from-violet-500 to-blue-600 text-white'}`}>
        {isUser ? 'JG' : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
          </svg>
        )}
      </div>
      <div className={`max-w-lg ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${isUser
          ? 'bg-blue-600 text-white rounded-tr-sm'
          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'}`}>
          <div className="space-y-1">
            {lines.map((line, i) => (
              <p key={i} className={line.startsWith('•') ? 'pl-1' : ''}>
                {renderContent(line)}
              </p>
            ))}
          </div>
        </div>
        <span className="text-xs text-slate-400 px-1">
          {message.timestamp.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
        </svg>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

const INITIAL_MESSAGE: Message = {
  id: 'init',
  role: 'assistant',
  content: 'Olá! Sou o Copiloto Logístico IA do FrostWMS. Posso ajudá-lo a analisar o stock, monitorizar validades, identificar problemas operacionais e sugerir ações corretivas.\n\nO que gostaria de saber hoje?',
  timestamp: new Date(),
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const response = generateResponse(text)
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickReport = (type: string) => {
    const questions: Record<string, string> = {
      stock: 'stock crítico resumo',
      validades: 'Produtos que vencem nos próximos 30 dias?',
      expedicoes: 'expedição resumo',
    }
    sendMessage(questions[type] || type)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Copiloto Logístico IA</h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Assistente activo · Simulado
              </div>
            </div>
          </div>
          {/* Quick Reports */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Relatórios rápidos:</span>
            <button onClick={() => handleQuickReport('stock')}
              className="flex items-center gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg font-medium transition-colors border border-red-200">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Stock Crítico
            </button>
            <button onClick={() => handleQuickReport('validades')}
              className="flex items-center gap-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg font-medium transition-colors border border-amber-200">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Validades Próximas
            </button>
            <button onClick={() => handleQuickReport('expedicoes')}
              className="flex items-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-medium transition-colors border border-blue-200">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Resumo Expedições
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6">
        {/* Suggested Questions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTED_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              disabled={isTyping}
              className="text-xs bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 px-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-300 transition-colors font-medium disabled:opacity-50 shadow-sm"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-5 pb-4 min-h-0">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm p-3 mt-4">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(input)
                }
              }}
              disabled={isTyping}
              placeholder="Escreva a sua pergunta sobre o armazém... (Enter para enviar)"
              rows={2}
              className="flex-1 resize-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent leading-relaxed disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="flex-shrink-0 h-10 w-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400">Shift+Enter para nova linha · Enter para enviar</p>
            <p className="text-xs text-slate-400">Respostas simuladas baseadas nos dados do sistema</p>
          </div>
        </div>
      </div>
    </div>
  )
}
