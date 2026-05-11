'use client'

import { useState, useMemo } from 'react'
import { divergences as mockDivergences, users } from '@/lib/mockData'
import type { Divergence, DivergenceType, DivergencePriority, DivergenceStatus } from '@/types'

const TYPE_LABELS: Record<DivergenceType, string> = {
  RECEIVING_DIFFERENCE: 'Divergência Receção',
  INCOMPLETE_PICKING: 'Picking Incompleto',
  NEGATIVE_STOCK: 'Stock Negativo',
  NO_LOCATION: 'Sem Localização',
  EXPIRED_LOT: 'Lote Vencido',
  BLOCKED_PRODUCT: 'Produto Bloqueado',
  STALLED_ORDER: 'Pedido Parado',
  PENDING_TASK: 'Tarefa Pendente',
  OPERATOR_ERROR: 'Erro Operador',
  TEMPERATURE_BREACH: 'Quebra Temperatura',
}

const TYPE_COLORS: Record<DivergenceType, string> = {
  RECEIVING_DIFFERENCE: 'bg-blue-100 text-blue-800',
  INCOMPLETE_PICKING: 'bg-amber-100 text-amber-800',
  NEGATIVE_STOCK: 'bg-red-100 text-red-800',
  NO_LOCATION: 'bg-slate-100 text-slate-700',
  EXPIRED_LOT: 'bg-orange-100 text-orange-800',
  BLOCKED_PRODUCT: 'bg-rose-100 text-rose-800',
  STALLED_ORDER: 'bg-yellow-100 text-yellow-800',
  PENDING_TASK: 'bg-indigo-100 text-indigo-800',
  OPERATOR_ERROR: 'bg-pink-100 text-pink-800',
  TEMPERATURE_BREACH: 'bg-cyan-100 text-cyan-800',
}

const PRIORITY_CONFIG: Record<DivergencePriority, { label: string; color: string; dotColor: string }> = {
  CRITICAL: { label: 'Crítica', color: 'bg-red-100 text-red-800', dotColor: 'bg-red-500' },
  HIGH: { label: 'Alta', color: 'bg-orange-100 text-orange-800', dotColor: 'bg-orange-500' },
  MEDIUM: { label: 'Média', color: 'bg-yellow-100 text-yellow-800', dotColor: 'bg-yellow-500' },
  LOW: { label: 'Baixa', color: 'bg-blue-100 text-blue-800', dotColor: 'bg-blue-500' },
}

const STATUS_CONFIG: Record<DivergenceStatus, { label: string; color: string }> = {
  OPEN: { label: 'Aberta', color: 'bg-red-100 text-red-700' },
  IN_PROGRESS: { label: 'Em Progresso', color: 'bg-blue-100 text-blue-700' },
  RESOLVED: { label: 'Resolvida', color: 'bg-green-100 text-green-700' },
  CLOSED: { label: 'Fechada', color: 'bg-slate-100 text-slate-600' },
}

const MOCK_TIMELINE = [
  { time: '09:15', action: 'Divergência criada automaticamente pelo sistema', user: 'Sistema' },
  { time: '09:20', action: 'Atribuída a responsável', user: 'João Gestor' },
  { time: '10:05', action: 'Estado alterado para Em Progresso', user: 'João Gestor' },
]

export default function DivergencesPage() {
  const [localDivergences, setLocalDivergences] = useState<Divergence[]>(mockDivergences)
  const [selectedDivergence, setSelectedDivergence] = useState<Divergence | null>(null)
  const [filterType, setFilterType] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterAssigned, setFilterAssigned] = useState('')
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<Record<string, { text: string; user: string; time: string }[]>>({})
  const [correctiveAction, setCorrectiveAction] = useState('')
  const [newStatus, setNewStatus] = useState<DivergenceStatus>('OPEN')

  const stats = useMemo(() => ({
    open: localDivergences.filter(d => d.status === 'OPEN').length,
    inProgress: localDivergences.filter(d => d.status === 'IN_PROGRESS').length,
    resolvedToday: localDivergences.filter(d => d.status === 'RESOLVED').length,
    critical: localDivergences.filter(d => d.priority === 'CRITICAL').length,
  }), [localDivergences])

  const filtered = useMemo(() => {
    return localDivergences.filter(d => {
      if (filterType && d.type !== filterType) return false
      if (filterPriority && d.priority !== filterPriority) return false
      if (filterStatus && d.status !== filterStatus) return false
      if (filterAssigned && d.assignedToId !== filterAssigned) return false
      return true
    })
  }, [localDivergences, filterType, filterPriority, filterStatus, filterAssigned])

  const handleOpenDetail = (d: Divergence) => {
    setSelectedDivergence(d)
    setCorrectiveAction(d.correctiveAction || '')
    setNewStatus(d.status)
  }

  const handleResolve = () => {
    if (!selectedDivergence) return
    const updated = {
      ...selectedDivergence,
      status: 'RESOLVED' as DivergenceStatus,
      correctiveAction,
      resolvedAt: new Date().toISOString(),
    }
    setLocalDivergences(prev => prev.map(d => d.id === updated.id ? updated : d))
    setSelectedDivergence(updated)
  }

  const handleStatusChange = () => {
    if (!selectedDivergence) return
    const updated = { ...selectedDivergence, status: newStatus }
    setLocalDivergences(prev => prev.map(d => d.id === updated.id ? updated : d))
    setSelectedDivergence(updated)
  }

  const handleAddComment = () => {
    if (!selectedDivergence || !newComment.trim()) return
    const c = { text: newComment.trim(), user: 'João Gestor', time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) }
    setComments(prev => ({
      ...prev,
      [selectedDivergence.id]: [...(prev[selectedDivergence.id] || []), c],
    }))
    setNewComment('')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Painel de Divergências</h1>
            <p className="text-slate-500 text-sm mt-0.5">Monitorização e resolução de divergências operacionais</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Abertas', value: stats.open, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
            { label: 'Em Progresso', value: stats.inProgress, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
            { label: 'Resolvidas Hoje', value: stats.resolvedToday, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
            { label: 'Críticas', value: stats.critical, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
              <div className="text-sm font-medium text-slate-600 mb-1">{s.label}</div>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
          <div className="flex flex-wrap gap-3 items-center">
            <svg className="h-4 w-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0014 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 018 17v-3.586a1 1 0 00-.293-.707L1.293 6.707A1 1 0 011 6V4z" />
            </svg>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos os tipos</option>
              {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todas prioridades</option>
              {Object.entries(PRIORITY_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos os estados</option>
              {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
            </select>
            <select value={filterAssigned} onChange={e => setFilterAssigned(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos os responsáveis</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            {(filterType || filterPriority || filterStatus || filterAssigned) && (
              <button onClick={() => { setFilterType(''); setFilterPriority(''); setFilterStatus(''); setFilterAssigned('') }}
                className="text-xs text-slate-500 hover:text-red-600 underline">
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Código</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prioridade</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Responsável</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(div => {
                  const assignedUser = users.find(u => u.id === div.assignedToId)
                  return (
                    <tr key={div.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{div.code}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[div.type]}`}>
                          {TYPE_LABELS[div.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium ${PRIORITY_CONFIG[div.priority].color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_CONFIG[div.priority].dotColor}`} />
                          {PRIORITY_CONFIG[div.priority].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-slate-700 line-clamp-2">{div.description}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{assignedUser?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_CONFIG[div.status].color}`}>
                          {STATUS_CONFIG[div.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(div.createdAt).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleOpenDetail(div)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline"
                        >
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <svg className="h-10 w-10 mx-auto mb-2 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Nenhuma divergência encontrada com os filtros actuais.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDivergence && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-bold text-slate-900">{selectedDivergence.code}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[selectedDivergence.type]}`}>
                    {TYPE_LABELS[selectedDivergence.type]}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRIORITY_CONFIG[selectedDivergence.priority].color}`}>
                    {PRIORITY_CONFIG[selectedDivergence.priority].label}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedDivergence(null)} className="text-slate-400 hover:text-slate-600 flex-shrink-0 ml-4">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Descrição</h4>
                <p className="text-slate-700 bg-slate-50 rounded-lg p-3 text-sm">{selectedDivergence.description}</p>
              </div>

              {/* Related Links */}
              {(selectedDivergence.receivingId || selectedDivergence.shippingOrderId || selectedDivergence.inventoryId) && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Relacionado com</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDivergence.receivingId && (
                      <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        Receção: {selectedDivergence.receivingId}
                      </span>
                    )}
                    {selectedDivergence.shippingOrderId && (
                      <span className="inline-flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg font-medium">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                        Expedição: {selectedDivergence.shippingOrderId}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Status Change */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Alterar Estado</label>
                  <div className="flex gap-2">
                    <select
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value as DivergenceStatus)}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                    </select>
                    <button
                      onClick={handleStatusChange}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      OK
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Estado Actual</label>
                  <span className={`inline-flex items-center text-sm px-3 py-2 rounded-lg font-medium ${STATUS_CONFIG[selectedDivergence.status].color}`}>
                    {STATUS_CONFIG[selectedDivergence.status].label}
                  </span>
                </div>
              </div>

              {/* Corrective Action */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ação Corretiva</label>
                <textarea
                  value={correctiveAction}
                  onChange={e => setCorrectiveAction(e.target.value)}
                  rows={3}
                  placeholder="Descreva a ação corretiva tomada..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Histórico</h4>
                <div className="space-y-3">
                  {MOCK_TIMELINE.map((t, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-blue-400 mt-1 flex-shrink-0" />
                        {i < MOCK_TIMELINE.length - 1 && <div className="w-0.5 bg-slate-200 flex-1 mt-1" />}
                      </div>
                      <div className="pb-3 min-w-0">
                        <p className="text-sm text-slate-700">{t.action}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{t.time} · {t.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Comentários</h4>
                <div className="space-y-2 mb-3 max-h-36 overflow-y-auto">
                  {(comments[selectedDivergence.id] || []).map((c, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-700">{c.user}</span>
                        <span className="text-xs text-slate-400">{c.time}</span>
                      </div>
                      <p className="text-sm text-slate-600">{c.text}</p>
                    </div>
                  ))}
                  {(comments[selectedDivergence.id] || []).length === 0 && (
                    <p className="text-xs text-slate-400 italic">Sem comentários ainda.</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                    placeholder="Adicionar comentário..."
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={handleAddComment} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Enviar
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setSelectedDivergence(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                Fechar
              </button>
              <button
                onClick={handleResolve}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Resolver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
