'use client'

import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  dashboardStats, shippingOrders, tasks, stockLots, divergences, customers, users
} from '@/lib/mockData'
import StatusBadge from '@/components/ui/StatusBadge'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import type { Task, ShippingOrder, StockLot, Divergence } from '@/types'

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  iconBg: string
  trend?: string
  trendUp?: boolean
  trendColor?: string
}

function KpiCard({ label, value, icon, iconBg, trend, trendUp, trendColor }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
      <div className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {trend && (
          <p className={`text-xs mt-1 font-medium ${trendColor ?? (trendUp ? 'text-emerald-600' : 'text-red-500')}`}>
            {trend}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Priority badge ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' }> = {
    LOW: { label: 'Baixa', variant: 'neutral' },
    NORMAL: { label: 'Normal', variant: 'info' },
    HIGH: { label: 'Alta', variant: 'warning' },
    URGENT: { label: 'Urgente', variant: 'danger' },
  }
  const cfg = map[priority] ?? { label: priority, variant: 'neutral' as const }
  return <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
}

// ─── Pie chart colors ─────────────────────────────────────────────────────────

const PIE_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#F97316']

// ─── Custom tooltip ───────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      {label && <p className="font-semibold text-gray-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  // Derived data
  const criticalLots: StockLot[] = stockLots.filter(
    (s) => s.daysUntilExpiry !== undefined && s.daysUntilExpiry <= 10
  )
  const openDivergences: Divergence[] = divergences.filter(
    (d) => ['OPEN', 'IN_PROGRESS'].includes(d.status)
  )
  const recentOrders: ShippingOrder[] = shippingOrders.slice(0, 5)
  const activeTasks: Task[] = tasks.filter((t) => ['PENDING', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status))

  const customerMap = Object.fromEntries(customers.map((c) => [c.id, c.name]))
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]))

  return (
    <div className="space-y-6">

      {/* ── KPI Row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          label="Total Stock"
          value={dashboardStats.totalStockValue.toLocaleString('pt-PT')}
          iconBg="bg-blue-100"
          trend="+3.2% esta semana"
          trendUp
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
            </svg>
          }
        />
        <KpiCard
          label="Produtos Críticos"
          value={dashboardStats.criticalProducts}
          iconBg="bg-red-100"
          trend="Abaixo do mínimo"
          trendColor="text-red-600"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
        />
        <KpiCard
          label="A Vencer ≤30 dias"
          value={dashboardStats.expiringProducts}
          iconBg="bg-amber-100"
          trend="Ação requerida"
          trendColor="text-amber-600"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <KpiCard
          label="Pedidos Pendentes"
          value={dashboardStats.pendingOrders}
          iconBg="bg-sky-100"
          trend="Para hoje/amanhã"
          trendColor="text-sky-600"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
            </svg>
          }
        />
        <KpiCard
          label="Tarefas Ativas"
          value={dashboardStats.activeTasks}
          iconBg="bg-purple-100"
          trend="Em execução"
          trendColor="text-purple-600"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          }
        />
        <KpiCard
          label="Divergências Abertas"
          value={dashboardStats.openDivergences}
          iconBg="bg-rose-100"
          trend="Requer resolução"
          trendColor="text-rose-600"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />
      </div>

      {/* ── Charts Row 1 ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Movements last 7 days */}
        <div className="lg:col-span-2">
          <Card title="Movimentos Últimos 7 Dias">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dashboardStats.movementsLast7Days} barGap={2} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="recepcoes" name="Receções" fill="#3B82F6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expedicoes" name="Expedições" fill="#10B981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="transferencias" name="Transferências" fill="#F59E0B" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Stock by category */}
        <Card title="Stock por Categoria">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={dashboardStats.stockByCategory}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
              >
                {dashboardStats.stockByCategory.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} cx`, '']} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Charts Row 2 ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Expiry by days */}
        <Card title="Validades Próximas por Prazo">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dashboardStats.expiringByDays} layout="vertical" barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="days" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" name="Lotes" radius={[0, 3, 3, 0]}>
                {dashboardStats.expiringByDays.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Operator productivity */}
        <Card title="Produtividade Operadores">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dashboardStats.operatorProductivity} barGap={2} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="picking" name="Picking" fill="#8B5CF6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="recepcao" name="Receção" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="transferencia" name="Transferência" fill="#10B981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Tables Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent shipping orders */}
        <Card title="Pedidos de Expedição Recentes" action={
          <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">Ver todos</span>
        }>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-2 px-1">Código</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-2 px-1">Cliente</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-2 px-1">Estado</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-2 px-1">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-1 font-mono text-xs text-gray-600 font-medium">{order.code}</td>
                    <td className="py-2.5 px-1 text-gray-800 text-xs max-w-[130px] truncate">
                      {customerMap[order.customerId] ?? order.customerId}
                    </td>
                    <td className="py-2.5 px-1">
                      <StatusBadge status={order.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-1 text-gray-500 text-xs whitespace-nowrap">
                      {(order.requestedDate ?? order.createdAt)?.slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Active tasks */}
        <Card title="Tarefas em Curso" action={
          <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">Ver todas</span>
        }>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-2 px-1">Código</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-2 px-1">Descrição</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-2 px-1">Prioridade</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-2 px-1">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-1 font-mono text-xs text-gray-600 font-medium">{task.code}</td>
                    <td className="py-2.5 px-1 text-gray-700 text-xs max-w-[140px] truncate" title={task.description}>
                      {task.description ?? '-'}
                    </td>
                    <td className="py-2.5 px-1">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="py-2.5 px-1">
                      <StatusBadge status={task.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ── Alerts Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Critical stock lots */}
        <Card title="Alertas de Validade Crítica">
          <div className="space-y-2.5">
            {criticalLots.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Sem lotes críticos</p>
            )}
            {criticalLots.map((lot) => {
              const expired = (lot.daysUntilExpiry ?? 0) < 0
              const days = lot.daysUntilExpiry ?? 0
              return (
                <div key={lot.id} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border ${expired ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${expired ? 'bg-red-100' : 'bg-amber-100'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${expired ? 'text-red-600' : 'text-amber-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">Lote {lot.lotNumber}</p>
                    <p className="text-xs text-gray-500">{lot.quantity} cx · {lot.expiryDate?.slice(0, 10)}</p>
                  </div>
                  <span className={`text-xs font-bold flex-shrink-0 ${expired ? 'text-red-600' : 'text-amber-600'}`}>
                    {expired ? `Vencido há ${Math.abs(days)}d` : `${days}d`}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Open divergences */}
        <Card title="Divergências Abertas">
          <div className="space-y-2.5">
            {openDivergences.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Sem divergências abertas</p>
            )}
            {openDivergences.map((div) => {
              const priorityColor: Record<string, string> = {
                LOW: 'bg-gray-100 text-gray-600',
                MEDIUM: 'bg-amber-100 text-amber-700',
                HIGH: 'bg-orange-100 text-orange-700',
                CRITICAL: 'bg-red-100 text-red-700',
              }
              return (
                <div key={div.id} className="flex items-start gap-3 rounded-lg px-3 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                  <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${priorityColor[div.priority] ?? 'bg-gray-100 text-gray-600'}`}>
                    !
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-medium text-gray-500">{div.code}</span>
                      <StatusBadge status={div.status} size="sm" />
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5 leading-snug line-clamp-2">{div.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {div.assignedToId ? `Atribuído a: ${userMap[div.assignedToId] ?? div.assignedToId}` : 'Sem responsável'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

    </div>
  )
}
