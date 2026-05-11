'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  onMenuToggle: () => void
  title?: string
}

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Produtos',
  '/stock': 'Stock',
  '/warehouse': 'Armazém',
  '/receiving': 'Receção',
  '/shipping': 'Expedição',
  '/picking': 'Picking',
  '/inventory': 'Inventário',
  '/divergences': 'Divergências',
  '/tasks': 'Tarefas WES',
  '/copilot': 'Copiloto IA',
  '/reports': 'Relatórios',
  '/settings': 'Definições',
}

export default function Header({ onMenuToggle, title }: HeaderProps) {
  const pathname = usePathname()
  const [darkMode, setDarkMode] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const pageTitle = title ?? (pathname ? routeTitles[pathname] ?? 'FrostWMS' : 'FrostWMS')

  useEffect(() => {
    const stored = localStorage.getItem('darkMode')
    if (stored === 'true') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const next = !darkMode
    setDarkMode(next)
    localStorage.setItem('darkMode', String(next))
    document.documentElement.classList.toggle('dark', next)
  }

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const notifications = [
    { id: 1, text: 'Lote L2024-060 vence em 3 dias', time: 'Agora', type: 'warning' },
    { id: 2, text: 'Divergência DIV-2024-002 crítica aberta', time: '5m', type: 'danger' },
    { id: 3, text: 'Receção REC-2024-003 em progresso', time: '22m', type: 'info' },
  ]

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0 shadow-sm">
      {/* Hamburger */}
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Page title */}
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-lg font-semibold text-gray-900 truncate">{pageTitle}</h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 gap-2 w-64">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Pesquisar..."
          className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none w-full"
          readOnly
        />
        <span className="text-xs text-gray-300 font-medium hidden lg:block">⌘K</span>
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      {/* Notification bell */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">3</span>
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Notificações</span>
              <span className="text-xs text-blue-600 cursor-pointer hover:underline">Marcar todas lidas</span>
            </div>
            <div className="divide-y divide-gray-50">
              {notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 cursor-pointer">
                  <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${n.type === 'danger' ? 'bg-red-500' : n.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-snug">{n.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.time} atrás</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 bg-gray-50 text-center">
              <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">Ver todas as notificações</span>
            </div>
          </div>
        )}
      </div>

      {/* User menu */}
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">JG</span>
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-medium text-gray-900 leading-tight">João Gestor</div>
            <div className="text-xs text-gray-500 leading-tight">Warehouse Manager</div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {userMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">João Gestor</p>
              <p className="text-xs text-gray-500">joao@wmsfrozen.pt</p>
            </div>
            <div className="py-1">
              {[
                { label: 'O Meu Perfil', icon: '👤' },
                { label: 'Definições', icon: '⚙️' },
                { label: 'Ajuda', icon: '❓' },
              ].map((item) => (
                <button key={item.label} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            <div className="py-1 border-t border-gray-100">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1" />
                </svg>
                <span>Terminar Sessão</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
