'use client'

import { useState } from 'react'
import { users } from '@/lib/mockData'
import type { UserRole } from '@/types'

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrador', WAREHOUSE_MANAGER: 'Gestor de Armazém', OPERATOR: 'Operador',
  PURCHASING: 'Compras', COMMERCIAL: 'Comercial', SHIPPING: 'Expedição',
}
const roleColors: Record<UserRole, string> = {
  ADMIN: 'bg-purple-100 text-purple-700', WAREHOUSE_MANAGER: 'bg-blue-100 text-blue-700',
  OPERATOR: 'bg-green-100 text-green-700', PURCHASING: 'bg-yellow-100 text-yellow-700',
  COMMERCIAL: 'bg-orange-100 text-orange-700', SHIPPING: 'bg-cyan-100 text-cyan-700',
}
const perms = [
  { label: 'Dashboard', key: 'dashboard' }, { label: 'Produtos', key: 'products' },
  { label: 'Stock', key: 'stock' }, { label: 'Armazém', key: 'warehouse' },
  { label: 'Receção', key: 'receiving' }, { label: 'Expedição', key: 'shipping' },
  { label: 'Picking', key: 'picking' }, { label: 'Inventário', key: 'inventory' },
  { label: 'Divergências', key: 'divergences' }, { label: 'Tarefas WES', key: 'tasks' },
  { label: 'Relatórios', key: 'reports' }, { label: 'Definições', key: 'settings' },
]
const permMatrix: Record<string, Record<string, boolean>> = {
  ADMIN: Object.fromEntries(perms.map(p => [p.key, true])),
  WAREHOUSE_MANAGER: Object.fromEntries(perms.filter(p => p.key !== 'settings').map(p => [p.key, true])),
  OPERATOR: Object.fromEntries(perms.filter(p => ['dashboard','stock','receiving','picking','tasks','warehouse'].includes(p.key)).map(p => [p.key, true])),
  PURCHASING: Object.fromEntries(perms.filter(p => ['dashboard','products','stock','receiving','reports'].includes(p.key)).map(p => [p.key, true])),
  COMMERCIAL: Object.fromEntries(perms.filter(p => ['dashboard','stock','shipping','reports'].includes(p.key)).map(p => [p.key, true])),
  SHIPPING: Object.fromEntries(perms.filter(p => ['dashboard','stock','shipping','picking','tasks'].includes(p.key)).map(p => [p.key, true])),
}
const integrations = [
  { name: 'ERP / Bettertech', icon: '🔗', status: 'disconnected', desc: 'Sincronização bidirecional de ordens e stock' },
  { name: 'Sage 50', icon: '💼', status: 'disconnected', desc: 'Exportação de faturas e movimentos contabilísticos' },
  { name: 'WhatsApp Business', icon: '💬', status: 'connected', desc: 'Notificações e alertas de validade' },
  { name: 'Power BI', icon: '📊', status: 'disconnected', desc: 'Relatórios avançados e dashboards dinâmicos' },
  { name: 'Scanner Barcode', icon: '📱', status: 'connected', desc: 'Leitores Zebra/Honeywell via WebUSB' },
  { name: 'Impressora Etiquetas', icon: '🖨️', status: 'disconnected', desc: 'ZPL para etiquetas de lote e localização' },
]

export default function SettingsPage() {
  const [tab, setTab] = useState<'users'|'roles'|'warehouse'|'integrations'|'system'>('users')
  const [modal, setModal] = useState(false)
  const tabs = [
    { id: 'users', label: 'Utilizadores' }, { id: 'roles', label: 'Perfis' },
    { id: 'warehouse', label: 'Armazém' }, { id: 'integrations', label: 'Integrações' },
    { id: 'system', label: 'Sistema' },
  ] as const

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Definições</h1>
        <p className="text-sm text-gray-500 mt-1">Configurações do sistema, utilizadores e integrações</p>
      </div>
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t.id ? 'bg-white border border-b-white border-gray-200 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Gestão de Utilizadores</h2>
            <button onClick={() => setModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ Novo Utilizador</button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>{['Nome','Email','Perfil','Estado','Ações'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">{u.name.charAt(0)}</div>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[u.role]}`}>{roleLabels[u.role]}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${u.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{u.active ? 'Ativo' : 'Inativo'}</span></td>
                    <td className="px-4 py-3"><div className="flex gap-2"><button className="text-xs text-blue-600 hover:underline">Editar</button><button className="text-xs text-red-500 hover:underline">Desativar</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {modal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-md p-6">
                <h3 className="text-lg font-semibold mb-4">Novo Utilizador</h3>
                <div className="space-y-3">
                  {[{l:'Nome',t:'text',p:'Nome completo'},{l:'Email',t:'email',p:'email@wmsfrozen.pt'},{l:'Password',t:'password',p:'••••••••'}].map(f => (
                    <div key={f.l}><label className="block text-sm font-medium text-gray-700 mb-1">{f.l}</label><input type={f.t} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder={f.p} /></div>
                  ))}
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">{Object.entries(roleLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
                  <button onClick={() => { alert('Utilizador criado! (simulação)'); setModal(false) }} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Criar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'roles' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Matriz de Permissões</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 min-w-32">Módulo</th>
                  {Object.entries(roleLabels).map(([role, label]) => (
                    <th key={role} className="text-center px-3 py-3 font-medium text-gray-600 min-w-28">
                      <span className={`px-2 py-1 rounded-full text-xs ${roleColors[role as UserRole]}`}>{label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {perms.map(p => (
                  <tr key={p.key} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">{p.label}</td>
                    {Object.keys(roleLabels).map(role => (
                      <td key={role} className="px-3 py-3 text-center">
                        <input type="checkbox" checked={permMatrix[role]?.[p.key] ?? false} onChange={() => {}} className="w-4 h-4 accent-blue-600" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'integrations' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Integrações Externas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integ, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3"><span className="text-2xl">{integ.icon}</span><h3 className="font-medium">{integ.name}</h3></div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${integ.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{integ.status === 'connected' ? '● Ligado' : '○ Desligado'}</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">{integ.desc}</p>
                <button onClick={() => alert(`Configurar ${integ.name} — disponível em versão enterprise.`)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Configurar</button>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-medium text-blue-900 mb-2">🔌 API para Integrações Personalizadas</h3>
            <div className="bg-white rounded-lg p-3 font-mono text-xs text-gray-700 space-y-1">
              <div>Base URL: <span className="text-blue-600">https://api.wmsfrozen.pt/v1</span></div>
              <div>Auth: <span className="text-blue-600">Bearer Token (JWT)</span></div>
              <div>Endpoints: /stock, /products, /orders, /receiving, /picking</div>
            </div>
          </div>
        </div>
      )}

      {tab === 'warehouse' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Configurações de Armazém</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h3 className="font-medium">Regras de Stock</h3>
              {[{l:'Regra de Saída',v:'FEFO'},{l:'Temp. Mínima',v:'-20°C'},{l:'Alerta Validade (dias)',v:'30'},{l:'Alerta Crítico (dias)',v:'7'}].map((s,i) => (
                <div key={i} className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">{s.l}</label>
                  <input type="text" defaultValue={s.v} className="px-2 py-1 border border-gray-300 rounded text-sm w-32 text-right" />
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h3 className="font-medium">Numeração Automática</h3>
              {[{l:'Receção',v:'REC-{YYYY}-{NNN}'},{l:'Expedição',v:'EXP-{YYYY}-{NNN}'},{l:'Picking',v:'PICK-{YYYY}-{NNN}'},{l:'Inventário',v:'INV-{YYYY}-{NNN}'}].map((s,i) => (
                <div key={i} className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">{s.l}</label>
                  <input type="text" defaultValue={s.v} className="px-2 py-1 border border-gray-300 rounded text-sm w-44 text-right font-mono text-xs" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end"><button onClick={() => alert('Guardado! (simulação)')} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Guardar</button></div>
        </div>
      )}

      {tab === 'system' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Configurações do Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h3 className="font-medium">Empresa</h3>
              {[{l:'Nome',v:'FrostDistrib Lda'},{l:'NIF',v:'509000001'},{l:'Morada',v:'Zona Industrial, Lisboa'},{l:'Email',v:'geral@frostdistrib.pt'}].map((f,i) => (
                <div key={i}><label className="block text-xs text-gray-500 mb-1">{f.l}</label><input type="text" defaultValue={f.v} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h3 className="font-medium">Sistema</h3>
              {[{l:'Fuso Horário',v:'Europe/Lisbon'},{l:'Idioma',v:'Português (PT)'},{l:'Moeda',v:'EUR (€)'},{l:'Formato Data',v:'DD/MM/YYYY'}].map((f,i) => (
                <div key={i}><label className="block text-xs text-gray-500 mb-1">{f.l}</label><input type="text" defaultValue={f.v} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              ))}
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2"><span className="text-green-600">✓</span><span className="text-sm font-medium text-green-700">Backup automático ativo</span></div>
                <p className="text-xs text-green-600 mt-1">Último backup: hoje às 03:00</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end"><button onClick={() => alert('Guardado! (simulação)')} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Guardar</button></div>
        </div>
      )}
    </div>
  )
}
