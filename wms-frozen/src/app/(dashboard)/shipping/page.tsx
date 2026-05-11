'use client'

import { useState, useMemo } from 'react'
import { shippingOrders, shippingItems, customers, products } from '@/lib/mockData'
import type {
  ShippingOrder,
  ShippingOrderItem,
  ShippingOrderStatus,
  Customer,
} from '@/types'

// ─── helpers ──────────────────────────────────────────────────────────────────

function statusLabel(s: ShippingOrderStatus): string {
  const map: Record<ShippingOrderStatus, string> = {
    PENDING: 'Pendente',
    CONFIRMED: 'Confirmado',
    IN_PICKING: 'Em Picking',
    PICKED: 'Picking OK',
    DISPATCHED: 'Expedido',
    CANCELLED: 'Cancelado',
  }
  return map[s]
}

function statusClasses(s: ShippingOrderStatus): string {
  const map: Record<ShippingOrderStatus, string> = {
    PENDING: 'bg-slate-100 text-slate-600 border border-slate-200',
    CONFIRMED: 'bg-blue-100 text-blue-700 border border-blue-200',
    IN_PICKING: 'bg-amber-100 text-amber-700 border border-amber-200',
    PICKED: 'bg-purple-100 text-purple-700 border border-purple-200',
    DISPATCHED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    CANCELLED: 'bg-gray-100 text-gray-500 border border-gray-200',
  }
  return map[s]
}

function nextStatus(s: ShippingOrderStatus): ShippingOrderStatus | null {
  const flow: Partial<Record<ShippingOrderStatus, ShippingOrderStatus>> = {
    PENDING: 'CONFIRMED',
    CONFIRMED: 'IN_PICKING',
    IN_PICKING: 'PICKED',
    PICKED: 'DISPATCHED',
  }
  return flow[s] ?? null
}

function nextLabel(s: ShippingOrderStatus): string {
  const map: Partial<Record<ShippingOrderStatus, string>> = {
    PENDING: 'Confirmar',
    CONFIRMED: 'Iniciar Picking',
    IN_PICKING: 'Picking Concluído',
    PICKED: 'Expedir',
  }
  return map[s] ?? ''
}

function fmt(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-PT')
}

function orderItems(id: string, items: ShippingOrderItem[]) {
  return items.filter((i) => i.shippingOrderId === id)
}

function totalBoxes(items: ShippingOrderItem[]) {
  return items.reduce((acc, i) => acc + i.requestedQty, 0)
}

// ─── sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="frost-card p-5 flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: ShippingOrderStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses(status)}`}
    >
      {statusLabel(status)}
    </span>
  )
}

// ─── items modal ──────────────────────────────────────────────────────────────

function ItemsModal({
  order,
  items,
  onClose,
}: {
  order: ShippingOrder
  items: ShippingOrderItem[]
  onClose: () => void
}) {
  const customer = customers.find((c) => c.id === order.customerId)
  const total = items.reduce(
    (acc, i) => acc + (i.unitPrice ?? 0) * i.requestedQty,
    0
  )
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto frost-card p-0">
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {order.code}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {customer?.name ?? order.customerId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400 text-xs">Rota</p>
              <p className="font-medium text-slate-700 dark:text-slate-200">
                {order.route ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Data Pedida</p>
              <p className="font-medium text-slate-700 dark:text-slate-200">
                {fmt(order.requestedDate)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Data Expedição</p>
              <p className="font-medium text-slate-700 dark:text-slate-200">
                {fmt(order.shippedDate)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Notas</p>
              <p className="font-medium text-slate-700 dark:text-slate-200 text-xs">
                {order.notes ?? '—'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  {[
                    'Produto',
                    'Lote',
                    'Qtd Pedida',
                    'Qtd Picked',
                    'Qtd Expedida',
                    'Preço Unit.',
                    'Total',
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left py-2 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const product = products.find((p) => p.id === item.productId)
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-3 px-2">
                        <p className="font-medium text-slate-700 dark:text-slate-200">
                          {product?.name ?? item.productId}
                        </p>
                        <p className="text-xs text-slate-400">
                          {product?.code}
                        </p>
                      </td>
                      <td className="py-3 px-2 text-slate-500 text-xs font-mono">
                        {item.stockLot?.lotNumber ?? '—'}
                      </td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-300">
                        {item.requestedQty}
                      </td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-300">
                        {item.pickedQty}
                      </td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-300">
                        {item.shippedQty}
                      </td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-300">
                        {item.unitPrice != null
                          ? `€${item.unitPrice.toFixed(2)}`
                          : '—'}
                      </td>
                      <td className="py-3 px-2 font-medium text-slate-700 dark:text-slate-200">
                        {item.unitPrice != null
                          ? `€${(item.unitPrice * item.requestedQty).toFixed(2)}`
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 dark:border-slate-700">
                  <td
                    colSpan={6}
                    className="py-2 px-2 text-sm font-semibold text-right text-slate-600 dark:text-slate-300"
                  >
                    Total
                  </td>
                  <td className="py-2 px-2 text-sm font-bold text-slate-800 dark:text-slate-100">
                    €{total.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── new order modal ──────────────────────────────────────────────────────────

interface NewLine {
  productId: string
  requestedQty: number
  unitPrice: number
}

function NewOrderModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (order: ShippingOrder) => void
}) {
  const [customerId, setCustomerId] = useState('')
  const [route, setRoute] = useState('')
  const [requestedDate, setRequestedDate] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<NewLine[]>([
    { productId: '', requestedQty: 1, unitPrice: 0 },
  ])
  const [error, setError] = useState('')

  function addLine() {
    setLines((l) => [...l, { productId: '', requestedQty: 1, unitPrice: 0 }])
  }

  function removeLine(idx: number) {
    setLines((l) => l.filter((_, i) => i !== idx))
  }

  function setLine(
    idx: number,
    field: keyof NewLine,
    value: string | number
  ) {
    setLines((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  function handleSubmit() {
    if (!customerId) { setError('Selecione um cliente.'); return }
    if (lines.some((l) => !l.productId)) {
      setError('Todos os artigos precisam de produto selecionado.')
      return
    }
    setError('')
    const now = new Date().toISOString()
    const newOrder: ShippingOrder = {
      id: `ship-${Date.now()}`,
      code: `EXP-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      customerId,
      route: route || undefined,
      requestedDate: requestedDate || undefined,
      status: 'PENDING',
      notes: notes || undefined,
      items: lines.map((l, i) => ({
        id: `si-new-${Date.now()}-${i}`,
        shippingOrderId: '',
        productId: l.productId,
        requestedQty: l.requestedQty,
        pickedQty: 0,
        shippedQty: 0,
        unitPrice: l.unitPrice || undefined,
      })),
      createdAt: now,
      updatedAt: now,
    }
    onCreate(newOrder)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto frost-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Novo Pedido de Expedição
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Cliente *
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Selecionar cliente…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Rota
              </label>
              <input
                type="text"
                placeholder="Ex: Lisboa Centro"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Data Pedida
              </label>
              <input
                type="date"
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Notas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Artigos *
              </label>
              <button
                type="button"
                onClick={addLine}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                + Adicionar linha
              </button>
            </div>
            <div className="space-y-2">
              {lines.map((line, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={line.productId}
                    onChange={(e) =>
                      setLine(idx, 'productId', e.target.value)
                    }
                    className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Produto…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    placeholder="Qtd"
                    value={line.requestedQty}
                    onChange={(e) =>
                      setLine(idx, 'requestedQty', Number(e.target.value))
                    }
                    className="w-16 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="€"
                    value={line.unitPrice || ''}
                    onChange={(e) =>
                      setLine(idx, 'unitPrice', Number(e.target.value))
                    }
                    className="w-20 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Criar Pedido
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function ShippingPage() {
  const [allItems] = useState<ShippingOrderItem[]>(shippingItems)
  const [orders, setOrders] = useState<ShippingOrder[]>(() =>
    shippingOrders.map((o) => ({
      ...o,
      customer: customers.find((c) => c.id === o.customerId),
    }))
  )
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ShippingOrderStatus | ''>('')
  const [routeFilter, setRouteFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [detailOrder, setDetailOrder] = useState<ShippingOrder | null>(null)
  const [showNew, setShowNew] = useState(false)

  const routes = useMemo(
    () => Array.from(new Set(orders.map((o) => o.route).filter(Boolean) as string[])),
    [orders]
  )

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const customer = customers.find((c) => c.id === o.customerId)
      const matchSearch =
        !search ||
        o.code.toLowerCase().includes(search.toLowerCase()) ||
        (customer?.name ?? '').toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || o.status === statusFilter
      const matchRoute = !routeFilter || o.route === routeFilter
      const matchDate =
        !dateFilter || (o.requestedDate ?? '').startsWith(dateFilter)
      return matchSearch && matchStatus && matchRoute && matchDate
    })
  }, [orders, search, statusFilter, routeFilter, dateFilter])

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return {
      pending: orders.filter((o) => o.status === 'PENDING').length,
      inPicking: orders.filter((o) => o.status === 'IN_PICKING').length,
      ready: orders.filter((o) => o.status === 'PICKED').length,
      dispatchedToday: orders.filter(
        (o) => o.status === 'DISPATCHED' && (o.shippedDate ?? '').startsWith(today)
      ).length,
    }
  }, [orders])

  function handleCreate(order: ShippingOrder) {
    setOrders((prev) => [order, ...prev])
  }

  function handleAdvance(id: string) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o
        const ns = nextStatus(o.status)
        if (!ns) return o
        return {
          ...o,
          status: ns,
          shippedDate:
            ns === 'DISPATCHED'
              ? new Date().toISOString().split('T')[0]
              : o.shippedDate,
          updatedAt: new Date().toISOString(),
        }
      })
    )
  }

  function handleCancel(id: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id && o.status !== 'DISPATCHED'
          ? { ...o, status: 'CANCELLED' as ShippingOrderStatus, updatedAt: new Date().toISOString() }
          : o
      )
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Pedidos de Expedição
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gestão e controlo de saídas de stock
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Novo Pedido
        </button>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Pendentes" value={stats.pending} color="text-slate-700 dark:text-slate-200" />
        <StatCard label="Em Picking" value={stats.inPicking} color="text-amber-600" />
        <StatCard label="Prontos" value={stats.ready} color="text-purple-600" />
        <StatCard label="Expedidos Hoje" value={stats.dispatchedToday} color="text-emerald-600" />
      </div>

      {/* filter bar */}
      <div className="frost-card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            placeholder="Pesquisar código, cliente…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as ShippingOrderStatus | '')
          }
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="">Todos os estados</option>
          <option value="PENDING">Pendente</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="IN_PICKING">Em Picking</option>
          <option value="PICKED">Picking OK</option>
          <option value="DISPATCHED">Expedido</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
        <select
          value={routeFilter}
          onChange={(e) => setRouteFilter(e.target.value)}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="">Todas as rotas</option>
          {routes.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
        {(search || statusFilter || routeFilter || dateFilter) && (
          <button
            onClick={() => {
              setSearch('')
              setStatusFilter('')
              setRouteFilter('')
              setDateFilter('')
            }}
            className="text-sm text-slate-500 hover:text-slate-700 px-2"
          >
            Limpar
          </button>
        )}
      </div>

      {/* table */}
      <div className="frost-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50">
                {[
                  'Código',
                  'Cliente',
                  'Rota',
                  'Data Pedida',
                  'Estado',
                  'Items',
                  'Total Caixas',
                  'Ações',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-10 text-slate-400 italic"
                  >
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
              {filtered.map((order) => {
                const customer = customers.find((c) => c.id === order.customerId)
                const items = orderItems(order.id, allItems)
                const boxes = totalBoxes(items)
                const nl = nextLabel(order.status)
                return (
                  <tr
                    key={order.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {order.code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[180px]">
                        {customer?.name ?? order.customerId}
                      </p>
                      <p className="text-xs text-slate-400">{customer?.code}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">
                      {order.route ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs whitespace-nowrap">
                      {fmt(order.requestedDate)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {items.length}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {boxes}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* view items */}
                        <button
                          onClick={() => setDetailOrder(order)}
                          title="Ver artigos"
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600"
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path
                              fillRule="evenodd"
                              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        {/* advance status */}
                        {nl && (
                          <button
                            onClick={() => handleAdvance(order.id)}
                            title={nl}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 text-xs font-medium"
                          >
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        )}
                        {/* cancel */}
                        {order.status !== 'DISPATCHED' &&
                          order.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleCancel(order.id)}
                              title="Cancelar"
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400"
                            >
                              <svg
                                className="w-4 h-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
          {filtered.length} de {orders.length} pedidos
        </div>
      </div>

      {/* modals */}
      {detailOrder && (
        <ItemsModal
          order={detailOrder}
          items={orderItems(detailOrder.id, allItems)}
          onClose={() => setDetailOrder(null)}
        />
      )}
      {showNew && (
        <NewOrderModal
          onClose={() => setShowNew(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}
