'use client'

import { useState, useMemo } from 'react'
import { receivings, receivingItems, suppliers, products } from '@/lib/mockData'
import type {
  Receiving,
  ReceivingItem,
  ReceivingStatus,
  Supplier,
  Product,
} from '@/types'

// ─── helpers ──────────────────────────────────────────────────────────────────

function statusLabel(s: ReceivingStatus): string {
  const map: Record<ReceivingStatus, string> = {
    PENDING: 'Pendente',
    IN_PROGRESS: 'Em Curso',
    COMPLETED: 'Concluído',
    APPROVED: 'Aprovado',
    WITH_DIVERGENCE: 'Divergência',
    CANCELLED: 'Cancelado',
  }
  return map[s]
}

function statusClasses(s: ReceivingStatus): string {
  const map: Record<ReceivingStatus, string> = {
    PENDING: 'bg-slate-100 text-slate-600 border border-slate-200',
    IN_PROGRESS: 'bg-blue-100 text-blue-700 border border-blue-200',
    COMPLETED: 'bg-green-100 text-green-700 border border-green-200',
    APPROVED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    WITH_DIVERGENCE: 'bg-red-100 text-red-700 border border-red-200',
    CANCELLED: 'bg-gray-100 text-gray-500 border border-gray-200',
  }
  return map[s]
}

function fmt(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-PT')
}

function recItems(id: string, items: ReceivingItem[]) {
  return items.filter((i) => i.receivingId === id)
}

// ─── types ────────────────────────────────────────────────────────────────────

interface NewLine {
  productId: string
  expectedQty: number
}

interface NewReceivingForm {
  supplierId: string
  documentNumber: string
  expectedDate: string
  lines: NewLine[]
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

function StatusBadge({ status }: { status: ReceivingStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses(status)}`}
    >
      {statusLabel(status)}
    </span>
  )
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100))
  const color =
    pct === 100
      ? 'bg-emerald-500'
      : pct > 0
        ? 'bg-blue-500'
        : 'bg-slate-200'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 w-10 text-right">{pct}%</span>
    </div>
  )
}

// ─── detail modal ─────────────────────────────────────────────────────────────

function DetailModal({
  receiving,
  items,
  onClose,
}: {
  receiving: Receiving
  items: ReceivingItem[]
  onClose: () => void
}) {
  const supplier = suppliers.find((s) => s.id === receiving.supplierId)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto frost-card p-0">
        {/* header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {receiving.code}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {supplier?.name ?? receiving.supplierId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={receiving.status} />
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
          {/* meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400 text-xs">Doc. Entrada</p>
              <p className="font-medium text-slate-700 dark:text-slate-200">
                {receiving.documentNumber ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Data Prevista</p>
              <p className="font-medium text-slate-700 dark:text-slate-200">
                {fmt(receiving.expectedDate)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Data Real</p>
              <p className="font-medium text-slate-700 dark:text-slate-200">
                {fmt(receiving.receivedDate)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Notas</p>
              <p className="font-medium text-slate-700 dark:text-slate-200 text-xs">
                {receiving.notes ?? '—'}
              </p>
            </div>
          </div>

          {/* divergence alert */}
          {receiving.hasDivergence && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <svg
                className="w-4 h-4 mt-0.5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Divergência detectada</strong> — existe diferença entre
                as quantidades esperadas e as recebidas.
              </span>
            </div>
          )}

          {/* items table */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Artigos
            </h3>
            {items.length === 0 ? (
              <p className="text-sm text-slate-400 italic">
                Sem artigos registados.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      {[
                        'Produto',
                        'Qtd Esperada',
                        'Qtd Recebida',
                        'Lote',
                        'Validade',
                        'Estado',
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left py-2 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const product = products.find(
                        (p) => p.id === item.productId
                      )
                      const isDivergent =
                        item.receivedQty > 0 &&
                        item.receivedQty !== item.expectedQty
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
                          <td className="py-3 px-2 text-slate-600 dark:text-slate-300">
                            {item.expectedQty}
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={
                                isDivergent
                                  ? 'font-semibold text-red-600'
                                  : 'text-slate-600 dark:text-slate-300'
                              }
                            >
                              {item.receivedQty}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-slate-500 text-xs font-mono">
                            {item.lotNumber ?? '—'}
                          </td>
                          <td className="py-3 px-2 text-slate-500 text-xs">
                            {fmt(item.expiryDate)}
                          </td>
                          <td className="py-3 px-2">
                            <div className="w-32">
                              <ProgressBar
                                value={item.receivedQty}
                                max={item.expectedQty}
                              />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── new receiving modal ──────────────────────────────────────────────────────

function NewReceivingModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (rec: Receiving) => void
}) {
  const [form, setForm] = useState<NewReceivingForm>({
    supplierId: '',
    documentNumber: '',
    expectedDate: '',
    lines: [{ productId: '', expectedQty: 1 }],
  })
  const [error, setError] = useState('')

  function addLine() {
    setForm((f) => ({ ...f, lines: [...f.lines, { productId: '', expectedQty: 1 }] }))
  }

  function removeLine(idx: number) {
    setForm((f) => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }))
  }

  function setLine(idx: number, field: keyof NewLine, value: string | number) {
    setForm((f) => {
      const lines = [...f.lines]
      lines[idx] = { ...lines[idx], [field]: value }
      return { ...f, lines }
    })
  }

  function handleSubmit() {
    if (!form.supplierId) { setError('Selecione um fornecedor.'); return }
    if (form.lines.some((l) => !l.productId)) {
      setError('Todos os artigos precisam de produto selecionado.')
      return
    }
    setError('')
    const now = new Date().toISOString()
    const newRec: Receiving = {
      id: `rec-${Date.now()}`,
      code: `REC-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      supplierId: form.supplierId,
      documentNumber: form.documentNumber || undefined,
      expectedDate: form.expectedDate || undefined,
      status: 'PENDING',
      hasDivergence: false,
      items: form.lines.map((l, i) => ({
        id: `ri-new-${Date.now()}-${i}`,
        receivingId: '',
        productId: l.productId,
        expectedQty: l.expectedQty,
        receivedQty: 0,
      })),
      createdAt: now,
      updatedAt: now,
    }
    onCreate(newRec)
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
            Nova Receção
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
          {/* supplier */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Fornecedor *
            </label>
            <select
              value={form.supplierId}
              onChange={(e) =>
                setForm((f) => ({ ...f, supplierId: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Selecionar fornecedor…</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* document number */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Número de Documento
            </label>
            <input
              type="text"
              placeholder="Ex: FT2024/1234"
              value={form.documentNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, documentNumber: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* expected date */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Data Prevista
            </label>
            <input
              type="date"
              value={form.expectedDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, expectedDate: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* product lines */}
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
              {form.lines.map((line, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={line.productId}
                    onChange={(e) => setLine(idx, 'productId', e.target.value)}
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
                    value={line.expectedQty}
                    onChange={(e) =>
                      setLine(idx, 'expectedQty', Number(e.target.value))
                    }
                    className="w-20 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {form.lines.length > 1 && (
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
            Criar Receção
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function ReceivingPage() {
  const [allItems] = useState<ReceivingItem[]>(receivingItems)
  const [rows, setRows] = useState<Receiving[]>(() =>
    receivings.map((r) => ({
      ...r,
      supplier: suppliers.find((s) => s.id === r.supplierId),
    }))
  )
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReceivingStatus | ''>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [detailRec, setDetailRec] = useState<Receiving | null>(null)
  const [showNew, setShowNew] = useState(false)

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const supplier = suppliers.find((s) => s.id === r.supplierId)
      const matchSearch =
        !search ||
        r.code.toLowerCase().includes(search.toLowerCase()) ||
        (supplier?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (r.documentNumber ?? '').toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || r.status === statusFilter
      const matchFrom =
        !dateFrom || (r.expectedDate ?? '') >= dateFrom
      const matchTo = !dateTo || (r.expectedDate ?? '') <= dateTo
      return matchSearch && matchStatus && matchFrom && matchTo
    })
  }, [rows, search, statusFilter, dateFrom, dateTo])

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return {
      pending: rows.filter((r) => r.status === 'PENDING').length,
      inProgress: rows.filter((r) => r.status === 'IN_PROGRESS').length,
      approvedToday: rows.filter(
        (r) =>
          (r.status === 'APPROVED' || r.status === 'COMPLETED') &&
          (r.updatedAt ?? '').startsWith(today)
      ).length,
      withDivergence: rows.filter((r) => r.hasDivergence).length,
    }
  }, [rows])

  function handleCreate(rec: Receiving) {
    setRows((prev) => [rec, ...prev])
  }

  function handleApprove(id: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: 'APPROVED' as ReceivingStatus, updatedAt: new Date().toISOString() }
          : r
      )
    )
  }

  function handleContinue(id: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id && r.status === 'PENDING'
          ? { ...r, status: 'IN_PROGRESS' as ReceivingStatus, updatedAt: new Date().toISOString() }
          : r
      )
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Receção de Mercadoria
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gestão e controlo de entradas de stock
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
          Nova Receção
        </button>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Pendentes" value={stats.pending} color="text-slate-700 dark:text-slate-200" />
        <StatCard label="Em Curso" value={stats.inProgress} color="text-blue-600" />
        <StatCard label="Hoje Aprovadas" value={stats.approvedToday} color="text-emerald-600" />
        <StatCard label="Com Divergências" value={stats.withDivergence} color="text-red-600" />
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
            placeholder="Pesquisar código, fornecedor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReceivingStatus | '')}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="">Todos os estados</option>
          <option value="PENDING">Pendente</option>
          <option value="IN_PROGRESS">Em Curso</option>
          <option value="COMPLETED">Concluído</option>
          <option value="APPROVED">Aprovado</option>
          <option value="WITH_DIVERGENCE">Divergência</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
        {(search || statusFilter || dateFrom || dateTo) && (
          <button
            onClick={() => {
              setSearch('')
              setStatusFilter('')
              setDateFrom('')
              setDateTo('')
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
                  'Fornecedor',
                  'Doc. Entrada',
                  'Data Prevista',
                  'Data Real',
                  'Items',
                  'Estado',
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
                    Nenhuma receção encontrada.
                  </td>
                </tr>
              )}
              {filtered.map((rec) => {
                const supplier = suppliers.find((s) => s.id === rec.supplierId)
                const items = recItems(rec.id, allItems)
                return (
                  <tr
                    key={rec.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {rec.code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[180px]">
                        {supplier?.name ?? rec.supplierId}
                      </p>
                      <p className="text-xs text-slate-400">{supplier?.code}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {rec.documentNumber ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs whitespace-nowrap">
                      {fmt(rec.expectedDate)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs whitespace-nowrap">
                      {fmt(rec.receivedDate)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {items.length}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={rec.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* view */}
                        <button
                          onClick={() => setDetailRec(rec)}
                          title="Ver detalhes"
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
                        {/* continue */}
                        {(rec.status === 'PENDING' || rec.status === 'IN_PROGRESS') && (
                          <button
                            onClick={() => handleContinue(rec.id)}
                            title="Continuar receção"
                            className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600"
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
                        {/* approve */}
                        {(rec.status === 'COMPLETED' || rec.status === 'IN_PROGRESS') && (
                          <button
                            onClick={() => handleApprove(rec.id)}
                            title="Aprovar receção"
                            className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600"
                          >
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
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
          {filtered.length} de {rows.length} receções
        </div>
      </div>

      {/* modals */}
      {detailRec && (
        <DetailModal
          receiving={detailRec}
          items={recItems(detailRec.id, allItems)}
          onClose={() => setDetailRec(null)}
        />
      )}
      {showNew && (
        <NewReceivingModal
          onClose={() => setShowNew(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}
