'use client'

import { useState, useMemo } from 'react'
import { inventories, products } from '@/lib/mockData'
import type { Inventory, InventoryType, InventoryItem } from '@/types'

const TYPE_LABELS: Record<InventoryType, string> = {
  TOTAL: 'Total',
  PARTIAL: 'Parcial',
  BY_PRODUCT: 'Por Produto',
  BY_LOCATION: 'Por Localização',
  BY_CATEGORY: 'Por Categoria',
  BY_LOT: 'Por Lote',
  CYCLIC: 'Cíclico',
}

const TYPE_COLORS: Record<InventoryType, string> = {
  TOTAL: 'bg-purple-100 text-purple-800',
  PARTIAL: 'bg-blue-100 text-blue-800',
  BY_PRODUCT: 'bg-cyan-100 text-cyan-800',
  BY_LOCATION: 'bg-teal-100 text-teal-800',
  BY_CATEGORY: 'bg-indigo-100 text-indigo-800',
  BY_LOT: 'bg-orange-100 text-orange-800',
  CYCLIC: 'bg-green-100 text-green-800',
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  IN_PROGRESS: 'Em Curso',
  COUNTING: 'Em Contagem',
  REVIEW: 'Em Revisão',
  APPROVED: 'Aprovado',
  CLOSED: 'Fechado',
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COUNTING: 'bg-yellow-100 text-yellow-800',
  REVIEW: 'bg-orange-100 text-orange-800',
  APPROVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-slate-100 text-slate-600',
}

function generateInventoryItems(inventoryId: string): InventoryItem[] {
  return products.slice(0, 8).map((p, i) => ({
    id: `${inventoryId}-item-${i}`,
    inventoryId,
    productId: p.id,
    product: p,
    systemQty: p.currentStock ?? 0,
    countedQty: undefined,
    difference: undefined,
  }))
}

export default function InventoryPage() {
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [showNewModal, setShowNewModal] = useState(false)
  const [newType, setNewType] = useState<InventoryType>('TOTAL')
  const [newNotes, setNewNotes] = useState('')
  const [localInventories, setLocalInventories] = useState<Inventory[]>(inventories)

  const stats = useMemo(() => ({
    draft: localInventories.filter(i => i.status === 'DRAFT').length,
    inProgress: localInventories.filter(i => i.status === 'IN_PROGRESS' || i.status === 'COUNTING').length,
    review: localInventories.filter(i => i.status === 'REVIEW').length,
    approved: localInventories.filter(i => i.status === 'APPROVED').length,
  }), [localInventories])

  const handleSelectInventory = (inv: Inventory) => {
    setSelectedInventory(inv)
    setInventoryItems(generateInventoryItems(inv.id))
  }

  const handleSimulateCount = () => {
    setInventoryItems(prev => prev.map(item => {
      const variance = (Math.random() - 0.5) * 0.2
      const counted = Math.max(0, Math.round(item.systemQty * (1 + variance)))
      return {
        ...item,
        countedQty: counted,
        difference: counted - item.systemQty,
      }
    }))
  }

  const handleApprove = () => {
    if (!selectedInventory) return
    setLocalInventories(prev => prev.map(inv =>
      inv.id === selectedInventory.id
        ? { ...inv, status: 'APPROVED', approvedAt: new Date().toISOString() }
        : inv
    ))
    setSelectedInventory(prev => prev ? { ...prev, status: 'APPROVED' } : null)
    alert('Ajustes aprovados com sucesso!')
  }

  const handleCreateInventory = () => {
    const newInv: Inventory = {
      id: `inv-${Date.now()}`,
      code: `INV-2024-00${localInventories.length + 1}`,
      type: newType,
      status: 'DRAFT',
      notes: newNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setLocalInventories(prev => [newInv, ...prev])
    setShowNewModal(false)
    setNewNotes('')
    setNewType('TOTAL')
  }

  const countedCount = inventoryItems.filter(i => i.countedQty !== undefined).length
  const progress = inventoryItems.length > 0 ? Math.round((countedCount / inventoryItems.length) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestão de Inventários</h1>
            <p className="text-slate-500 text-sm mt-0.5">Controlo e gestão de contagens de inventário</p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Novo Inventário
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Rascunho', value: stats.draft, color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { label: 'Em Curso', value: stats.inProgress, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
            { label: 'Em Revisão', value: stats.review, color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
            { label: 'Aprovados', value: stats.approved, color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          ].map(stat => (
            <div key={stat.label} className={`rounded-xl border p-4 ${stat.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">{stat.label}</span>
                <svg className={`h-5 w-5 ${stat.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </div>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Inventory List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Inventários</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {localInventories.map(inv => (
                  <button
                    key={inv.id}
                    onClick={() => handleSelectInventory(inv)}
                    className={`w-full text-left px-4 py-4 hover:bg-slate-50 transition-colors ${selectedInventory?.id === inv.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-mono text-sm font-semibold text-slate-800">{inv.code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[inv.status]}`}>
                        {STATUS_LABELS[inv.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[inv.type]}`}>
                        {TYPE_LABELS[inv.type]}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                      {inv.startedAt && (
                        <span>Início: {new Date(inv.startedAt).toLocaleDateString('pt-PT')}</span>
                      )}
                      {inv.completedAt && (
                        <span>Fim: {new Date(inv.completedAt).toLocaleDateString('pt-PT')}</span>
                      )}
                    </div>
                    {inv.notes && (
                      <p className="mt-1.5 text-xs text-slate-500 line-clamp-1">{inv.notes}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detail View */}
          <div className="lg:col-span-3">
            {selectedInventory ? (
              <div className="bg-white rounded-xl border border-slate-200">
                {/* Detail Header */}
                <div className="px-5 py-4 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-lg font-bold text-slate-900">{selectedInventory.code}</h2>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[selectedInventory.type]}`}>
                          {TYPE_LABELS[selectedInventory.type]}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[selectedInventory.status]}`}>
                          {STATUS_LABELS[selectedInventory.status]}
                        </span>
                      </div>
                      {selectedInventory.notes && (
                        <p className="text-sm text-slate-500">{selectedInventory.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span>Criado: {new Date(selectedInventory.createdAt).toLocaleDateString('pt-PT')}</span>
                    {selectedInventory.startedAt && <span>Iniciado: {new Date(selectedInventory.startedAt).toLocaleDateString('pt-PT')}</span>}
                    {selectedInventory.approvedAt && <span>Aprovado: {new Date(selectedInventory.approvedAt).toLocaleDateString('pt-PT')}</span>}
                    <span>{inventoryItems.length} itens</span>
                    <span>{inventoryItems.filter(i => i.difference !== undefined && i.difference !== 0).length} divergências</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-1.5 text-sm">
                    <span className="text-slate-600 font-medium">Progresso da Contagem</span>
                    <span className="font-bold text-slate-800">{countedCount}/{inventoryItems.length} ({progress}%)</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3">
                  <button
                    onClick={handleSimulateCount}
                    className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                    Simular Contagem
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={progress < 100}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Aprovar Ajustes
                  </button>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Produto</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Sistema</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contagem Física</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Diferença</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inventoryItems.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-800">{item.product?.name}</div>
                            <div className="text-xs text-slate-400">{item.product?.code}</div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-700">{item.systemQty}</td>
                          <td className="px-4 py-3 text-right font-mono">
                            {item.countedQty !== undefined ? (
                              <span className="text-slate-700">{item.countedQty}</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold">
                            {item.difference !== undefined ? (
                              <span className={item.difference > 0 ? 'text-green-600' : item.difference < 0 ? 'text-red-600' : 'text-slate-500'}>
                                {item.difference > 0 ? '+' : ''}{item.difference}
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 h-64 flex items-center justify-center">
                <div className="text-center">
                  <svg className="h-12 w-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-slate-400 text-sm">Selecione um inventário para ver detalhes</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Inventory Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Novo Inventário</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de Inventário</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as InventoryType)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Notas</label>
                <textarea
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  rows={3}
                  placeholder="Observações sobre o inventário..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateInventory}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Criar Inventário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
