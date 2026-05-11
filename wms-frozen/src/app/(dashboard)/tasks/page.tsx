'use client'

import { useState, useMemo } from 'react'
import { tasks as mockTasks, users, locations } from '@/lib/mockData'
import type { Task, TaskType, TaskStatus, TaskPriority } from '@/types'

const TYPE_CONFIG: Record<TaskType, { label: string; icon: string; color: string }> = {
  RECEIVE: {
    label: 'Receção', color: 'bg-blue-100 text-blue-800',
    icon: 'M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8.414a1 1 0 00-.293-.707l-4.414-4.414A1 1 0 0014.586 3H8zm2 10a1 1 0 11-2 0 1 1 0 012 0zm5 0a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h6a1 1 0 100-2H9z',
  },
  INSPECT: {
    label: 'Inspeção', color: 'bg-purple-100 text-purple-800',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  },
  PUTAWAY: {
    label: 'Armazenamento', color: 'bg-teal-100 text-teal-800',
    icon: 'M19 14l-7 7m0 0l-7-7m7 7V3',
  },
  REPLENISH: {
    label: 'Reposição', color: 'bg-cyan-100 text-cyan-800',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  },
  PICK: {
    label: 'Picking', color: 'bg-amber-100 text-amber-800',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  TRANSFER: {
    label: 'Transferência', color: 'bg-indigo-100 text-indigo-800',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  },
  INVENTORY: {
    label: 'Inventário', color: 'bg-green-100 text-green-800',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  SHIP: {
    label: 'Expedição', color: 'bg-orange-100 text-orange-800',
    icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
  },
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; dot: string }> = {
  LOW: { label: 'Baixa', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  NORMAL: { label: 'Normal', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
  HIGH: { label: 'Alta', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  URGENT: { label: 'Urgente', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; column: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-slate-100 text-slate-700', column: 'PENDING' },
  ASSIGNED: { label: 'Atribuída', color: 'bg-indigo-100 text-indigo-700', column: 'PENDING' },
  IN_PROGRESS: { label: 'Em Curso', color: 'bg-blue-100 text-blue-700', column: 'IN_PROGRESS' },
  COMPLETED: { label: 'Concluída', color: 'bg-green-100 text-green-700', column: 'COMPLETED' },
  CANCELLED: { label: 'Cancelada', color: 'bg-slate-100 text-slate-500', column: 'COMPLETED' },
  BLOCKED: { label: 'Bloqueada', color: 'bg-red-100 text-red-700', column: 'PENDING' },
}

function TaskCard({ task, onAction }: { task: Task; onAction: (id: string, action: string) => void }) {
  const assignedUser = users.find(u => u.id === task.assignedToId)
  const location = locations.find(l => l.id === task.locationId)
  const typeConf = TYPE_CONFIG[task.type]
  const prioConf = PRIORITY_CONFIG[task.priority]
  const statusConf = STATUS_CONFIG[task.status]

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${typeConf.color}`}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={typeConf.icon} />
            </svg>
          </div>
          <div>
            <div className="font-mono text-xs text-slate-400">{task.code}</div>
            <div className="text-xs font-medium text-slate-600">{typeConf.label}</div>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${prioConf.color}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${prioConf.dot}`} />
          {prioConf.label}
        </span>
      </div>

      {task.description && (
        <p className="text-sm text-slate-700 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-3">
        {assignedUser && (
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {assignedUser.name.split(' ')[0]}
          </span>
        )}
        {location && (
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {location.code}
          </span>
        )}
        {task.dueAt && (
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {new Date(task.dueAt).toLocaleDateString('pt-PT')}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConf.color}`}>
          {statusConf.label}
        </span>
        <div className="flex gap-1">
          {task.status === 'PENDING' && (
            <button onClick={() => onAction(task.id, 'assign')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors">
              Atribuir
            </button>
          )}
          {(task.status === 'PENDING' || task.status === 'ASSIGNED') && (
            <button onClick={() => onAction(task.id, 'start')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors">
              Iniciar
            </button>
          )}
          {task.status === 'IN_PROGRESS' && (
            <>
              <button onClick={() => onAction(task.id, 'complete')}
                className="text-xs text-green-600 hover:text-green-800 font-medium px-2 py-1 rounded hover:bg-green-50 transition-colors">
                Concluir
              </button>
              <button onClick={() => onAction(task.id, 'block')}
                className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors">
                Bloquear
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TasksPage() {
  const [localTasks, setLocalTasks] = useState<Task[]>(mockTasks)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [showNewModal, setShowNewModal] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterOperator, setFilterOperator] = useState('')

  const [newTask, setNewTask] = useState({
    type: 'PICK' as TaskType,
    description: '',
    priority: 'NORMAL' as TaskPriority,
    assignedToId: '',
    locationId: '',
    dueAt: '',
  })

  const stats = useMemo(() => ({
    pending: localTasks.filter(t => t.status === 'PENDING').length,
    assigned: localTasks.filter(t => t.status === 'ASSIGNED').length,
    inProgress: localTasks.filter(t => t.status === 'IN_PROGRESS').length,
    completedToday: localTasks.filter(t => t.status === 'COMPLETED').length,
  }), [localTasks])

  const filtered = useMemo(() => {
    return localTasks.filter(t => {
      if (filterType && t.type !== filterType) return false
      if (filterPriority && t.priority !== filterPriority) return false
      if (filterStatus && t.status !== filterStatus) return false
      if (filterOperator && t.assignedToId !== filterOperator) return false
      return true
    })
  }, [localTasks, filterType, filterPriority, filterStatus, filterOperator])

  const kanbanColumns = useMemo(() => ({
    pending: filtered.filter(t => ['PENDING', 'ASSIGNED', 'BLOCKED'].includes(t.status)),
    inProgress: filtered.filter(t => t.status === 'IN_PROGRESS'),
    completed: filtered.filter(t => ['COMPLETED', 'CANCELLED'].includes(t.status)),
  }), [filtered])

  const handleAction = (id: string, action: string) => {
    setLocalTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const now = new Date().toISOString()
      switch (action) {
        case 'assign': {
          const leastBusy = users.find(u => u.role === 'OPERATOR')
          return { ...t, status: 'ASSIGNED', assignedToId: leastBusy?.id ?? t.assignedToId, updatedAt: now }
        }
        case 'start':
          return { ...t, status: 'IN_PROGRESS', startedAt: now, updatedAt: now }
        case 'complete':
          return { ...t, status: 'COMPLETED', completedAt: now, updatedAt: now }
        case 'block':
          return { ...t, status: 'BLOCKED', updatedAt: now }
        default:
          return t
      }
    }))
  }

  const handleSuggestOperator = () => {
    const taskCounts = users
      .filter(u => u.role === 'OPERATOR')
      .map(u => ({
        ...u,
        count: localTasks.filter(t => t.assignedToId === u.id && t.status === 'IN_PROGRESS').length,
      }))
      .sort((a, b) => a.count - b.count)
    const suggested = taskCounts[0]
    if (suggested) setNewTask(prev => ({ ...prev, assignedToId: suggested.id }))
  }

  const handleCreateTask = () => {
    const task: Task = {
      id: `t-${Date.now()}`,
      code: `TSK-${String(localTasks.length + 1).padStart(3, '0')}`,
      type: newTask.type,
      status: newTask.assignedToId ? 'ASSIGNED' : 'PENDING',
      priority: newTask.priority,
      assignedToId: newTask.assignedToId || undefined,
      locationId: newTask.locationId || undefined,
      description: newTask.description,
      dueAt: newTask.dueAt || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setLocalTasks(prev => [task, ...prev])
    setShowNewModal(false)
    setNewTask({ type: 'PICK', description: '', priority: 'NORMAL', assignedToId: '', locationId: '', dueAt: '' })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tarefas Operacionais (WES)</h1>
            <p className="text-slate-500 text-sm mt-0.5">Gestão e acompanhamento de tarefas de armazém</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Lista
              </button>
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nova Tarefa
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pendentes', value: stats.pending, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
            { label: 'Atribuídas', value: stats.assigned, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
            { label: 'Em Curso', value: stats.inProgress, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
            { label: 'Concluídas Hoje', value: stats.completedToday, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
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
              {Object.entries(TYPE_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todas prioridades</option>
              {Object.entries(PRIORITY_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos os estados</option>
              {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
            </select>
            <select value={filterOperator} onChange={e => setFilterOperator(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos os operadores</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {([
              { key: 'pending', label: 'Pendentes', tasks: kanbanColumns.pending, color: 'border-t-slate-400' },
              { key: 'inProgress', label: 'Em Curso', tasks: kanbanColumns.inProgress, color: 'border-t-blue-500' },
              { key: 'completed', label: 'Concluídas', tasks: kanbanColumns.completed, color: 'border-t-green-500' },
            ] as const).map(col => (
              <div key={col.key}>
                <div className={`bg-white rounded-xl border border-slate-200 border-t-4 ${col.color}`}>
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">{col.label}</h3>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                      {col.tasks.length}
                    </span>
                  </div>
                  <div className="p-3 space-y-3 min-h-40 max-h-[60vh] overflow-y-auto">
                    {col.tasks.map(task => (
                      <TaskCard key={task.id} task={task} onAction={handleAction} />
                    ))}
                    {col.tasks.length === 0 && (
                      <div className="text-center py-8 text-slate-300 text-sm">
                        Sem tarefas
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Código</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prioridade</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Operador</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prazo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(task => {
                  const assignedUser = users.find(u => u.id === task.assignedToId)
                  const typeConf = TYPE_CONFIG[task.type]
                  const prioConf = PRIORITY_CONFIG[task.priority]
                  const statusConf = STATUS_CONFIG[task.status]
                  return (
                    <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{task.code}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeConf.color}`}>{typeConf.label}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-xs">
                        <p className="line-clamp-1">{task.description ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${prioConf.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${prioConf.dot}`} />
                          {prioConf.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{assignedUser?.name.split(' ')[0] ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusConf.color}`}>{statusConf.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {task.dueAt ? new Date(task.dueAt).toLocaleDateString('pt-PT') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {task.status === 'PENDING' && (
                            <button onClick={() => handleAction(task.id, 'start')} className="text-xs text-blue-600 hover:underline font-medium">Iniciar</button>
                          )}
                          {task.status === 'IN_PROGRESS' && (
                            <button onClick={() => handleAction(task.id, 'complete')} className="text-xs text-green-600 hover:underline font-medium">Concluir</button>
                          )}
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

      {/* New Task Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Nova Tarefa</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo</label>
                  <select value={newTask.type} onChange={e => setNewTask(p => ({ ...p, type: e.target.value as TaskType }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {Object.entries(TYPE_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Prioridade</label>
                  <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value as TaskPriority }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {Object.entries(PRIORITY_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição</label>
                <textarea value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                  rows={3} placeholder="Descreva a tarefa..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-slate-700">Atribuir a</label>
                  <button onClick={handleSuggestOperator}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Sugerir Operador
                  </button>
                </div>
                <select value={newTask.assignedToId} onChange={e => setNewTask(p => ({ ...p, assignedToId: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Sem atribuição</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Localização</label>
                  <select value={newTask.locationId} onChange={e => setNewTask(p => ({ ...p, locationId: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Sem localização</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.code}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Prazo</label>
                  <input type="date" value={newTask.dueAt} onChange={e => setNewTask(p => ({ ...p, dueAt: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowNewModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancelar</button>
              <button onClick={handleCreateTask}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                Criar Tarefa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
