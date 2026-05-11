'use client'

import { useState, useMemo } from 'react'
import {
  pickingTasks,
  shippingOrders,
  products,
  stockLots,
  locations,
  users,
} from '@/lib/mockData'
import type {
  PickingTask,
  PickingTaskItem,
  TaskStatus,
  TaskPriority,
} from '@/types'

// ─── seed items for demo ──────────────────────────────────────────────────────

const seedItems: PickingTaskItem[] = [
  {
    id: 'pti1',
    pickingTaskId: 'pt1',
    productId: 'p1',
    stockLotId: 'sl1',
    locationCode: 'B1-E1-N1-P1',
    requestedQty: 15,
    pickedQty: 8,
    confirmed: false,
  },
  {
    id: 'pti2',
    pickingTaskId: 'pt1',
    productId: 'p4',
    stockLotId: 'sl5',
    locationCode: 'B2-E3-N1-P1',
    requestedQty: 25,
    pickedQty: 15,
    confirmed: false,
  },
  {
    id: 'pti3',
    pickingTaskId: 'pt2',
    productId: 'p5',
    stockLotId: 'sl9',
    locationCode: 'B1-E1-N2-P1',
    requestedQty: 10,
    pickedQty: 0,
    confirmed: false,
  },
  {
    id: 'pti4',
    pickingTaskId: 'pt2',
    productId: 'p2',
    stockLotId: 'sl3',
    locationCode: 'B1-E1-N1-P2',
    requestedQty: 20,
    pickedQty: 0,
    confirmed: false,
  },
  {
    id: 'pti5',
    pickingTaskId: 'pt3',
    productId: 'p9',
    stockLotId: 'sl7',
    locationCode: 'C1-P1-N1-P1',
    requestedQty: 50,
    pickedQty: 0,
    confirmed: false,
  },
  {
    id: 'pti6',
    pickingTaskId: 'pt3',
    productId: 'p10',
    stockLotId: 'sl7',
    locationCode: 'C1-P1-N1-P2',
    requestedQty: 40,
    pickedQty: 0,
    confirmed: false,
  },
]

// ─── helpers ──────────────────────────────────────────────────────────────────

function taskStatusLabel(s: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    PENDING: 'Pendente',
    ASSIGNED: 'Atribuído',
    IN_PROGRESS: 'Em Curso',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
    BLOCKED: 'Bloqueado',
  }
  return map[s]
}

function taskStatusClasses(s: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    PENDING: 'bg-slate-100 text-slate-600 border border-slate-200',
    ASSIGNED: 'bg-blue-100 text-blue-700 border border-blue-200',
    IN_PROGRESS: 'bg-amber-100 text-amber-700 border border-amber-200',
    COMPLETED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    CANCELLED: 'bg-gray-100 text-gray-500 border border-gray-200',
    BLOCKED: 'bg-red-100 text-red-700 border border-red-200',
  }
  return map[s]
}

function priorityClasses(p: TaskPriority): string {
  const map: Record<TaskPriority, string> = {
    URGENT: 'bg-red-100 text-red-700 border border-red-200',
    HIGH: 'bg-orange-100 text-orange-700 border border-orange-200',
    NORMAL: 'bg-blue-100 text-blue-700 border border-blue-200',
    LOW: 'bg-gray-100 text-gray-500 border border-gray-200',
  }
  return map[p]
}

function priorityLabel(p: TaskPriority): string {
  const map: Record<TaskPriority, string> = {
    URGENT: 'Urgente',
    HIGH: 'Alta',
    NORMAL: 'Normal',
    LOW: 'Baixa',
  }
  return map[p]
}

function taskProgress(items: PickingTaskItem[]): number {
  if (items.length === 0) return 0
  const confirmed = items.filter((i) => i.confirmed).length
  return Math.round((confirmed / items.length) * 100)
}

function fmt(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-PT')
}

// ─── sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <div className="frost-card p-5 flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
      {sub && <span className="text-xs text-slate-400">{sub}</span>}
    </div>
  )
}

function ProgressBar({ pct }: { pct: number }) {
  const color =
    pct === 100
      ? 'bg-emerald-500'
      : pct > 0
        ? 'bg-blue-500'
        : 'bg-slate-200'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 w-8 text-right">{pct}%</span>
    </div>
  )
}

// ─── task detail panel ────────────────────────────────────────────────────────

function TaskDetail({
  task,
  items,
  onItemScan,
  onItemConfirm,
  onComplete,
  onScanError,
  scanError,
}: {
  task: PickingTask
  items: PickingTaskItem[]
  onItemScan: (itemId: string) => void
  onItemConfirm: (itemId: string) => void
  onComplete: (taskId: string) => void
  onScanError: (msg: string) => void
  scanError: string
}) {
  const order = shippingOrders.find((o) => o.id === task.shippingOrderId)
  const operator = users.find((u) => u.id === task.assignedToId)
  const pct = taskProgress(items)
  const allConfirmed = items.length > 0 && items.every((i) => i.confirmed)

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* task header */}
      <div className="frost-card p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              {task.code}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pedido: {order?.code ?? task.shippingOrderId ?? '—'}
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityClasses(task.priority)}`}
            >
              {priorityLabel(task.priority)}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${taskStatusClasses(task.status)}`}
            >
              {taskStatusLabel(task.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs mb-3">
          <div>
            <p className="text-slate-400">Operador</p>
            <p className="font-medium text-slate-700 dark:text-slate-200">
              {operator?.name ?? 'Não atribuído'}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Iniciado</p>
            <p className="font-medium text-slate-700 dark:text-slate-200">
              {task.startedAt ? fmt(task.startedAt) : '—'}
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Progresso</span>
            <span>
              {items.filter((i) => i.confirmed).length}/{items.length} artigos
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* scan error */}
      {scanError && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
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
          <span>{scanError}</span>
        </div>
      )}

      {/* items list */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {items.map((item) => {
          const product = products.find((p) => p.id === item.productId)
          const lot = stockLots.find((s) => s.id === item.stockLotId)
          const itemPct =
            item.requestedQty > 0
              ? Math.round((item.pickedQty / item.requestedQty) * 100)
              : 0
          return (
            <div
              key={item.id}
              className={`frost-card p-3 border-l-4 transition-all ${
                item.confirmed
                  ? 'border-l-emerald-400 opacity-80'
                  : 'border-l-blue-400'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-700 dark:text-slate-200 truncate">
                    {product?.name ?? item.productId}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    {product?.code}
                  </p>
                </div>
                {item.confirmed && (
                  <span className="ml-2 flex-shrink-0 inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Confirmado
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                <div>
                  <p className="text-slate-400">Localização</p>
                  <p className="font-mono text-slate-600 dark:text-slate-300 text-xs">
                    {item.locationCode ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Lote</p>
                  <p className="font-mono text-slate-600 dark:text-slate-300 text-xs">
                    {lot?.lotNumber ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Validade</p>
                  <p className="text-slate-600 dark:text-slate-300">
                    {lot?.expiryDate ? fmt(lot.expiryDate) : '—'}
                  </p>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>
                    Picking: {item.pickedQty}/{item.requestedQty}
                  </span>
                  <span>{itemPct}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      itemPct === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${itemPct}%` }}
                  />
                </div>
              </div>

              {!item.confirmed && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onItemScan(item.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z"
                        clipRule="evenodd"
                      />
                      <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z" />
                    </svg>
                    Simular Leitura
                  </button>
                  {item.pickedQty === item.requestedQty && (
                    <button
                      onClick={() => onItemConfirm(item.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Confirmar
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* complete button */}
      {task.status !== 'COMPLETED' && (
        <button
          onClick={() => {
            if (!allConfirmed) {
              onScanError(
                'Confirme todos os artigos antes de concluir o picking.'
              )
              return
            }
            onComplete(task.id)
          }}
          disabled={!allConfirmed}
          className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
            allConfirmed
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          Concluir Picking
        </button>
      )}
      {task.status === 'COMPLETED' && (
        <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-medium py-2">
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Picking concluído
        </div>
      )}
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function PickingPage() {
  const [tasks, setTasks] = useState<PickingTask[]>(pickingTasks)
  const [taskItems, setTaskItems] = useState<PickingTaskItem[]>(seedItems)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    pickingTasks[0]?.id ?? null
  )
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('')
  const [operatorFilter, setOperatorFilter] = useState('')
  const [scanError, setScanError] = useState('')

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchStatus = !statusFilter || t.status === statusFilter
      const matchPriority = !priorityFilter || t.priority === priorityFilter
      const matchOperator =
        !operatorFilter || t.assignedToId === operatorFilter
      return matchStatus && matchPriority && matchOperator
    })
  }, [tasks, statusFilter, priorityFilter, operatorFilter])

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null
  const selectedItems = taskItems.filter(
    (i) => i.pickingTaskId === selectedTaskId
  )

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return {
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      pending: tasks.filter((t) => t.status === 'PENDING').length,
      completedToday: tasks.filter(
        (t) =>
          t.status === 'COMPLETED' &&
          (t.completedAt ?? '').startsWith(today)
      ).length,
    }
  }, [tasks])

  function handleScan(itemId: string) {
    // simulate random validation error (10% chance)
    const errorChance = Math.random()
    if (errorChance < 0.1) {
      setScanError(
        'Código de barras não corresponde ao artigo esperado. Verifique o produto.'
      )
      setTimeout(() => setScanError(''), 4000)
      return
    }
    setScanError('')
    setTaskItems((prev) =>
      prev.map((i) => {
        if (i.id !== itemId) return i
        const newQty = Math.min(i.requestedQty, i.pickedQty + Math.ceil(i.requestedQty / 2))
        return { ...i, pickedQty: newQty }
      })
    )
  }

  function handleConfirm(itemId: string) {
    setScanError('')
    setTaskItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, confirmed: true, pickedQty: i.requestedQty } : i
      )
    )
  }

  function handleComplete(taskId: string) {
    setScanError('')
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'COMPLETED' as TaskStatus,
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    )
  }

  const operatorOptions = useMemo(
    () =>
      users.filter((u) =>
        tasks.some((t) => t.assignedToId === u.id)
      ),
    [tasks]
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Gestão de Picking
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Preparação e controlo de pedidos de recolha
        </p>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Em Curso" value={stats.inProgress} color="text-amber-600" />
        <StatCard label="Pendentes" value={stats.pending} color="text-slate-700 dark:text-slate-200" />
        <StatCard
          label="Concluídos Hoje"
          value={stats.completedToday}
          color="text-emerald-600"
        />
        <StatCard
          label="Taxa de Erro"
          value="2.3%"
          sub="últimos 30 dias"
          color="text-red-500"
        />
      </div>

      {/* two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 min-h-[600px]">
        {/* left: task list */}
        <div className="flex flex-col gap-3">
          {/* filters */}
          <div className="frost-card p-3 flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
              className="flex-1 min-w-28 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Todos estados</option>
              <option value="PENDING">Pendente</option>
              <option value="ASSIGNED">Atribuído</option>
              <option value="IN_PROGRESS">Em Curso</option>
              <option value="COMPLETED">Concluído</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as TaskPriority | '')
              }
              className="flex-1 min-w-28 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Todas prioridades</option>
              <option value="URGENT">Urgente</option>
              <option value="HIGH">Alta</option>
              <option value="NORMAL">Normal</option>
              <option value="LOW">Baixa</option>
            </select>
            <select
              value={operatorFilter}
              onChange={(e) => setOperatorFilter(e.target.value)}
              className="flex-1 min-w-28 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Todos operadores</option>
              {operatorOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* task cards */}
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[600px]">
            {filteredTasks.length === 0 && (
              <p className="text-sm text-slate-400 italic text-center py-8">
                Nenhuma tarefa encontrada.
              </p>
            )}
            {filteredTasks.map((task) => {
              const order = shippingOrders.find(
                (o) => o.id === task.shippingOrderId
              )
              const operator = users.find((u) => u.id === task.assignedToId)
              const items = taskItems.filter(
                (i) => i.pickingTaskId === task.id
              )
              const pct = taskProgress(items)
              const isSelected = task.id === selectedTaskId
              return (
                <button
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskId(task.id)
                    setScanError('')
                  }}
                  className={`w-full text-left frost-card p-3 border-2 transition-all hover:border-blue-300 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {task.code}
                      </p>
                      <p className="text-xs text-slate-400">
                        {order?.code ?? '—'}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${priorityClasses(task.priority)}`}
                      >
                        {priorityLabel(task.priority)}
                      </span>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${taskStatusClasses(task.status)}`}
                      >
                        {taskStatusLabel(task.status)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>
                      {operator?.name ?? 'Não atribuído'}
                    </span>
                    <span>
                      {items.filter((i) => i.confirmed).length}/{items.length}{' '}
                      artigos
                    </span>
                  </div>

                  <ProgressBar pct={pct} />
                </button>
              )
            })}
          </div>
        </div>

        {/* right: task detail */}
        <div className="frost-card p-4 overflow-y-auto max-h-[700px]">
          {selectedTask ? (
            <TaskDetail
              task={selectedTask}
              items={selectedItems}
              onItemScan={handleScan}
              onItemConfirm={handleConfirm}
              onComplete={handleComplete}
              onScanError={setScanError}
              scanError={scanError}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
              <svg
                className="w-12 h-12 mb-3 opacity-30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                />
              </svg>
              <p className="text-sm">Selecione uma tarefa para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
