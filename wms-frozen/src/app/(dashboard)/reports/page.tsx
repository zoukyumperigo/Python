'use client'

import { useState } from 'react'
import { dashboardStats, stockLots, products } from '@/lib/mockData'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4']

const kpis = [
  { label: 'Taxa de Erro de Picking', value: '2.3%', trend: '-0.4%', up: false, icon: '🎯' },
  { label: 'Tempo Médio Receção', value: '2.4h', trend: '-15min', up: false, icon: '⏱️' },
  { label: 'Tempo Médio Expedição', value: '1.8h', trend: '+5min', up: true, icon: '🚚' },
  { label: 'Ocupação Armazém', value: '67%', trend: '+3%', up: true, icon: '🏭' },
  { label: 'Receções Este Mês', value: '47', trend: '+8', up: true, icon: '📥' },
  { label: 'Expedições Este Mês', value: '112', trend: '+15', up: true, icon: '📤' },
]

const stockOverTime = [
  { day: '05 Mai', stock: 2250 }, { day: '06 Mai', stock: 2180 }, { day: '07 Mai', stock: 2320 },
  { day: '08 Mai', stock: 2100 }, { day: '09 Mai', stock: 2400 }, { day: '10 Mai', stock: 2280 }, { day: '11 Mai', stock: 2100 },
]

const weeklyActivity = [
  { week: 'Sem 1', recepcoes: 12, expedicoes: 28 }, { week: 'Sem 2', recepcoes: 8, expedicoes: 22 },
  { week: 'Sem 3', recepcoes: 15, expedicoes: 31 }, { week: 'Sem 4', recepcoes: 12, expedicoes: 31 },
]

const divergenceTypes = [
  { name: 'Div. Receção', value: 8 }, { name: 'Lote Vencido', value: 5 },
  { name: 'Pick. Incompleto', value: 4 }, { name: 'Stock Negativo', value: 2 }, { name: 'Outros', value: 3 },
]

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('month')
  const handleExport = (type: string) => alert(`Exportar "${type}" em CSV — disponível com integração ERP.`)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios e Indicadores</h1>
          <p className="text-sm text-gray-500 mt-1">KPIs operacionais e análise de desempenho</p>
        </div>
        <div className="flex gap-3">
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
            <option value="quarter">Último trimestre</option>
          </select>
          <button onClick={() => handleExport('Completo')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            ↓ Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-2xl mb-1">{kpi.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
            <div className={`text-xs font-medium mt-1 ${kpi.up ? 'text-orange-500' : 'text-green-600'}`}>{kpi.trend} vs mês anterior</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Stock Total (7 dias)</h3>
            <button onClick={() => handleExport('Stock')} className="text-xs text-blue-600 hover:underline">CSV</button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stockOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="stock" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} name="Caixas" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Receções vs Expedições (mensal)</h3>
            <button onClick={() => handleExport('Movimentos')} className="text-xs text-blue-600 hover:underline">CSV</button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="recepcoes" fill="#10B981" name="Receções" radius={[3,3,0,0]} />
              <Bar dataKey="expedicoes" fill="#3B82F6" name="Expedições" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Produtos com Mais Rotação</h3>
            <button onClick={() => handleExport('Rotação')} className="text-xs text-blue-600 hover:underline">CSV</button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dashboardStats.topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
              <Tooltip />
              <Bar dataKey="rotacao" fill="#3B82F6" radius={[0,4,4,0]} name="Caixas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Divergências por Tipo</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={divergenceTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ percent }: { percent?: number }) => `${((percent ?? 0)*100).toFixed(0)}%`}>
                {divergenceTypes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Produtividade por Operador</h3>
          <button onClick={() => handleExport('Produtividade')} className="text-xs text-blue-600 hover:underline">CSV</button>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={dashboardStats.operatorProductivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="picking" fill="#3B82F6" name="Picking" radius={[3,3,0,0]} />
            <Bar dataKey="recepcao" fill="#10B981" name="Receção" radius={[3,3,0,0]} />
            <Bar dataKey="transferencia" fill="#F59E0B" name="Transferência" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Validades Próximas (30 dias)</h3>
          <button onClick={() => handleExport('Validades')} className="text-xs text-blue-600 hover:underline">Exportar CSV</button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Produto', 'Lote', 'Validade', 'Dias Restantes', 'Qtd (cx)', 'Estado'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stockLots.filter(lot => lot.daysUntilExpiry !== undefined && lot.daysUntilExpiry <= 30)
              .sort((a, b) => (a.daysUntilExpiry ?? 999) - (b.daysUntilExpiry ?? 999))
              .map(lot => {
                const product = products.find(p => p.id === lot.productId)
                const days = lot.daysUntilExpiry ?? 0
                const badge = days < 0 ? 'bg-red-100 text-red-700' : days <= 7 ? 'bg-red-50 text-red-600' : days <= 15 ? 'bg-orange-50 text-orange-600' : 'bg-yellow-50 text-yellow-600'
                return (
                  <tr key={lot.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{product?.name ?? lot.productId}</td>
                    <td className="px-4 py-3 text-gray-600">{lot.lotNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{lot.expiryDate?.split('T')[0] ?? '—'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${badge}`}>{days < 0 ? `Vencido ${Math.abs(days)}d` : `${days} dias`}</span></td>
                    <td className="px-4 py-3">{lot.quantity}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${lot.status === 'BLOCKED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{lot.status === 'BLOCKED' ? 'Bloqueado' : 'Disponível'}</span></td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
