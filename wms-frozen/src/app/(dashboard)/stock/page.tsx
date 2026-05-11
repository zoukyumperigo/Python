'use client'

import { useState, useMemo } from 'react'
import { stockLots, stockMovements, products, suppliers, locations } from '@/lib/mockData'
import type { StockLot, StockMovement, StockStatus, MovementType } from '@/types'

// ── helpers ────────────────────────────────────────────────────────────────

function expiryColor(days?: number): string {
  if (days === undefined) return 'text-slate-400'
  if (days < 0) return 'text-red-700'
  if (days <= 7) return 'text-red-600'
  if (days <= 30) return 'text-amber-600'
  if (days <= 90) return 'text-emerald-600'
  return 'text-slate-500'
}

function expiryBadge(days?: number): string {
  if (days === undefined) return 'bg-slate-100 text-slate-500'
  if (days < 0) return 'bg-red-100 text-red-700'
  if (days <= 7) return 'bg-red-100 text-red-600'
  if (days <= 30) return 'bg-amber-100 text-amber-700'
  if (days <= 90) return 'bg-yellow-50 text-yellow-700'
  return 'bg-emerald-50 text-emerald-700'
}

function expiryLabel(days?: number): string {
  if (days === undefined) return 'S/D'
  if (days < 0) return `Vencido ${Math.abs(days)}d`
  if (days === 0) return 'Hoje'
  return `${days}d`
}

function statusBadge(status: StockStatus): string {
  const map: Record<StockStatus, string> = {
    AVAILABLE: 'bg-emerald-50 text-emerald-700',
    RESERVED: 'bg-blue-50 text-blue-700',
    BLOCKED: 'bg-red-100 text-red-700',
    DAMAGED: 'bg-red-50 text-red-600',
    RETURNED: 'bg-amber-50 text-amber-700',
    IN_REVIEW: 'bg-purple-50 text-purple-700',
    QUARANTINE: 'bg-orange-50 text-orange-700',
    EXPIRED: 'bg-gray-100 text-gray-600',
  }
  return map[status] ?? 'bg-slate-100 text-slate-500'
}

function statusLabel(status: StockStatus): string {
  const map: Record<StockStatus, string> = {
    AVAILABLE: 'Disponível', RESERVED: 'Reservado', BLOCKED: 'Bloqueado',
    DAMAGED: 'Danificado', RETURNED: 'Devolvido', IN_REVIEW: 'Em Análise',
    QUARANTINE: 'Quarentena', EXPIRED: 'Vencido',
  }
  return map[status] ?? status
}

function movBadge(type: MovementType): string {
  const map: Record<MovementType, string> = {
    RECEIVING: 'bg-emerald-50 text-emerald-700',
    SHIPPING: 'bg-blue-50 text-blue-700',
    TRANSFER: 'bg-purple-50 text-purple-700',
    ADJUSTMENT: 'bg-amber-50 text-amber-700',
    INVENTORY: 'bg-slate-100 text-slate-600',
    RETURN: 'bg-orange-50 text-orange-700',
    WASTE: 'bg-red-50 text-red-600',
    QUARANTINE: 'bg-red-100 text-red-700',
  }
  return map[type] ?? 'bg-slate-100 text-slate-500'
}

function movLabel(type: MovementType): string {
  const map: Record<MovementType, string> = {
    RECEIVING: 'Receção', SHIPPING: 'Expedição', TRANSFER: 'Transferência',
    ADJUSTMENT: 'Ajuste', INVENTORY: 'Inventário', RETURN: 'Devolução',
    WASTE: 'Desperdício', QUARANTINE: 'Quarentena',
  }
  return map[type] ?? type
}

function formatDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── SVG icons ──────────────────────────────────────────────────────────────

function IconWarning() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    </svg>
  )
}

function IconBox() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0v10l-8 4m0-14L4 7m8 4v10" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4" />
    </svg>
  )
}

function IconTransfer() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  )
}

function IconEye() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

// ── Enriched lots ──────────────────────────────────────────────────────────

type EnrichedLot = StockLot & {
  product: (typeof products)[0] | undefined
  supplier: (typeof suppliers)[0] | undefined
  location: (typeof locations)[0] | undefined
}

type EnrichedMovement = StockMovement & {
  product: (typeof products)[0] | undefined
  lotNumber: string | undefined
  fromLoc: string | undefined
  toLoc: string | undefined
}

// ── Tabs ───────────────────────────────────────────────────────────────────

type Tab = 'lots' | 'products' | 'movements'

// ── Main ───────────────────────────────────────────────────────────────────

export default function StockPage() {
  const [tab, setTab] = useState<Tab>('lots')

  // Lot filters
  const [lotSearch, setLotSearch] = useState('')
  const [lotStatus, setLotStatus] = useState('')
  const [lotProduct, setLotProduct] = useState('')

  // Enrich lots
  const enrichedLots = useMemo<EnrichedLot[]>(() =>
    stockLots.map((l) => ({
      ...l,
      product: products.find((p) => p.id === l.productId),
      supplier: suppliers.find((s) => s.id === l.supplierId),
      location: locations.find((loc) => loc.id === l.locationId),
    })), []
  )

  // Enrich movements
  const enrichedMovements = useMemo<EnrichedMovement[]>(() =>
    stockMovements.map((m) => {
      const lot = stockLots.find((l) => l.id === m.stockLotId)
      return {
        ...m,
        product: products.find((p) => p.id === lot?.productId),
        lotNumber: lot?.lotNumber,
        fromLoc: locations.find((l) => l.id === m.fromLocationId)?.code,
        toLoc: locations.find((l) => l.id === m.toLocationId)?.code,
      }
    }), []
  )

  // Filtered lots
  const filteredLots = useMemo(() =>
    enrichedLots.filter((l) => {
      const matchSearch =
        !lotSearch ||
        l.product?.name.toLowerCase().includes(lotSearch.toLowerCase()) ||
        l.lotNumber.toLowerCase().includes(lotSearch.toLowerCase()) ||
        l.supplier?.name.toLowerCase().includes(lotSearch.toLowerCase())
      const matchStatus = !lotStatus || l.status === lotStatus
      const matchProduct = !lotProduct || l.productId === lotProduct
      return matchSearch && matchStatus && matchProduct
    }), [enrichedLots, lotSearch, lotStatus, lotProduct]
  )

  // Stats
  const totalBoxes = stockLots.reduce((a, l) => a + l.quantity, 0)
  const totalReserved = stockLots.reduce((a, l) => a + l.reservedQty, 0)
  const expiringCount = stockLots.filter(
    (l) => l.daysUntilExpiry !== undefined && l.daysUntilExpiry > 0 && l.daysUntilExpiry <= 30
  ).length
  const blockedCount = stockLots.filter((l) => l.status === 'BLOCKED').length

  // Expiry alerts
  const expiryAlerts = enrichedLots.filter(
    (l) => l.daysUntilExpiry !== undefined && l.daysUntilExpiry <= 30
  ).sort((a, b) => (a.daysUntilExpiry ?? 999) - (b.daysUntilExpiry ?? 999))

  // Product summary
  const productSummary = useMemo(() => {
    return products.map((p) => {
      const lots = enrichedLots.filter((l) => l.productId === p.id)
      const totalQty = lots.reduce((a, l) => a + l.quantity, 0)
      const totalRes = lots.reduce((a, l) => a + l.reservedQty, 0)
      const nextExpiry = lots
        .filter((l) => l.daysUntilExpiry !== undefined && l.daysUntilExpiry > 0)
        .sort((a, b) => (a.daysUntilExpiry ?? 999) - (b.daysUntilExpiry ?? 999))[0]
      return {
        product: p,
        totalQty,
        reserved: totalRes,
        available: totalQty - totalRes,
        nextExpiryDays: nextExpiry?.daysUntilExpiry,
        progressPct: p.idealStock > 0 ? Math.min(100, Math.round((totalQty / p.idealStock) * 100)) : 0,
      }
    }).filter((s) => s.totalQty > 0 || s.product.active)
  }, [enrichedLots])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Controlo de Stock</h1>
          <p className="text-sm text-slate-500 mt-0.5">Lotes, movimentos e análise de stock</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Caixas', value: totalBoxes, icon: <IconBox />, color: 'text-blue-700', bg: 'bg-blue-50', iconBg: 'bg-blue-100' },
            { label: 'Reservado', value: totalReserved, icon: <IconLock />, color: 'text-purple-700', bg: 'bg-purple-50', iconBg: 'bg-purple-100' },
            { label: 'A Vencer (30d)', value: expiringCount, icon: <IconWarning />, color: 'text-amber-700', bg: 'bg-amber-50', iconBg: 'bg-amber-100' },
            { label: 'Lotes Bloqueados', value: blockedCount, icon: <IconLock />, color: 'text-red-700', bg: 'bg-red-50', iconBg: 'bg-red-100' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500">{s.label}</span>
                <span className={`p-1.5 rounded-lg ${s.iconBg} ${s.color}`}>{s.icon}</span>
              </div>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Expiry Alerts */}
        {expiryAlerts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-amber-600"><IconWarning /></span>
              <h3 className="text-sm font-semibold text-amber-800">Alertas de Validade ({expiryAlerts.length} lotes)</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {expiryAlerts.slice(0, 8).map((l) => (
                <div
                  key={l.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                    (l.daysUntilExpiry ?? 999) <= 7 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <span>{l.product?.name ?? l.productId}</span>
                  <span className="opacity-60">·</span>
                  <span>{l.lotNumber}</span>
                  <span className="font-bold">{expiryLabel(l.daysUntilExpiry)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100">
            {([
              { key: 'lots', label: 'Por Lote' },
              { key: 'products', label: 'Por Produto' },
              { key: 'movements', label: 'Movimentos' },
            ] as { key: Tab; label: string }[]).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab: Por Lote */}
          {tab === 'lots' && (
            <div>
              {/* Lot filters */}
              <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3">
                <input
                  className="flex-1 min-w-[200px] px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Pesquisar produto, lote ou fornecedor…"
                  value={lotSearch}
                  onChange={(e) => setLotSearch(e.target.value)}
                />
                <select
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={lotStatus}
                  onChange={(e) => setLotStatus(e.target.value)}
                >
                  <option value="">Todos os estados</option>
                  {(['AVAILABLE', 'RESERVED', 'BLOCKED', 'QUARANTINE', 'EXPIRED'] as StockStatus[]).map((s) => (
                    <option key={s} value={s}>{statusLabel(s)}</option>
                  ))}
                </select>
                <select
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={lotProduct}
                  onChange={(e) => setLotProduct(e.target.value)}
                >
                  <option value="">Todos os produtos</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <span className="text-xs text-slate-400 self-center ml-auto">{filteredLots.length} lotes</span>
              </div>

              {/* Lot table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['Produto', 'Lote', 'Fornecedor', 'Localização', 'Validade', 'Qtd Cx', 'Qtd Kg', 'Reservado', 'Estado', 'Acções'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredLots.length === 0 ? (
                      <tr><td colSpan={10} className="text-center py-12 text-slate-400">Nenhum lote encontrado</td></tr>
                    ) : (
                      filteredLots.map((lot) => (
                        <tr key={lot.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 max-w-[180px]">
                            <p className="font-medium text-slate-800 truncate">{lot.product?.name ?? lot.productId}</p>
                            <p className="text-xs text-slate-400">{lot.product?.code}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{lot.lotNumber}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 text-xs">{lot.supplier?.name ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-slate-500">{lot.location?.code ?? '—'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${expiryBadge(lot.daysUntilExpiry)}`}>
                                {expiryLabel(lot.daysUntilExpiry)}
                              </span>
                              {lot.expiryDate && (
                                <span className={`text-xs ${expiryColor(lot.daysUntilExpiry)}`}>{formatDate(lot.expiryDate)}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-700">{lot.quantity}</td>
                          <td className="px-4 py-3 text-slate-600">{lot.quantityKg ? `${lot.quantityKg} kg` : '—'}</td>
                          <td className="px-4 py-3">
                            {lot.reservedQty > 0 ? (
                              <span className="text-blue-600 font-medium">{lot.reservedQty}</span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(lot.status)}`}>
                              {statusLabel(lot.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button title="Ver detalhes" className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                <IconEye />
                              </button>
                              <button title="Transferir" className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors">
                                <IconTransfer />
                              </button>
                              <button title={lot.status === 'BLOCKED' ? 'Desbloquear' : 'Bloquear'} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                <IconLock />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Por Produto */}
          {tab === 'products' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {productSummary.map(({ product, totalQty, reserved, available, nextExpiryDays, progressPct }) => {
                  const sc =
                    totalQty <= product.minStock ? 'red' :
                    totalQty < product.idealStock ? 'yellow' : 'green'
                  return (
                    <div key={product.id} className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm leading-tight">{product.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{product.code}</p>
                        </div>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            sc === 'red' ? 'bg-red-50 text-red-600' :
                            sc === 'yellow' ? 'bg-amber-50 text-amber-700' :
                            'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {sc === 'red' ? 'Crítico' : sc === 'yellow' ? 'Baixo' : 'OK'}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Stock ideal: {product.idealStock} cx</span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              sc === 'red' ? 'bg-red-500' : sc === 'yellow' ? 'bg-amber-400' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-slate-50 rounded-lg py-2">
                          <p className="text-xs text-slate-400">Total</p>
                          <p className="text-base font-bold text-slate-700">{totalQty}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg py-2">
                          <p className="text-xs text-slate-400">Reservado</p>
                          <p className="text-base font-bold text-blue-600">{reserved}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-lg py-2">
                          <p className="text-xs text-slate-400">Disponível</p>
                          <p className="text-base font-bold text-emerald-600">{available}</p>
                        </div>
                      </div>

                      {nextExpiryDays !== undefined && (
                        <div className={`mt-3 flex items-center gap-1.5 text-xs ${expiryColor(nextExpiryDays)}`}>
                          <IconWarning />
                          <span>Próx. validade: <strong>{expiryLabel(nextExpiryDays)}</strong></span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tab: Movimentos */}
          {tab === 'movements' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Data', 'Tipo', 'Produto', 'Lote', 'Qtd', 'De → Para', 'Referência', 'Utilizador'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {enrichedMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(m.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${movBadge(m.type)}`}>
                          {movLabel(m.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700 text-xs">{m.product?.name ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-500">{m.lotNumber ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold text-sm ${m.quantity < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {m.quantity > 0 ? '+' : ''}{m.quantity}
                        </span>
                        {m.quantityKg && <span className="text-xs text-slate-400 ml-1">({m.quantityKg} kg)</span>}
                      </td>
                      <td className="px-4 py-3">
                        {m.fromLoc || m.toLoc ? (
                          <span className="font-mono text-xs text-slate-500">
                            {m.fromLoc ?? '—'} → {m.toLoc ?? '—'}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500">{m.reference ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500">{m.userId ?? '—'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
