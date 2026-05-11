'use client'

import { useState, useMemo } from 'react'
import { zones, aisles, shelves, locations } from '@/lib/mockData'
import type { LocationType } from '@/types'

// ── helpers ────────────────────────────────────────────────────────────────

function occupancyColor(pct?: number): string {
  if (!pct || pct === 0) return 'bg-slate-200'
  if (pct >= 90) return 'bg-red-500'
  if (pct >= 70) return 'bg-amber-400'
  return 'bg-emerald-500'
}

function occupancyTextColor(pct?: number): string {
  if (!pct || pct === 0) return 'text-slate-400'
  if (pct >= 90) return 'text-red-600'
  if (pct >= 70) return 'text-amber-600'
  return 'text-emerald-600'
}

function occupancyBg(pct?: number): string {
  if (!pct || pct === 0) return 'bg-slate-50 border-slate-200'
  if (pct >= 90) return 'bg-red-50 border-red-200'
  if (pct >= 70) return 'bg-amber-50 border-amber-200'
  return 'bg-emerald-50 border-emerald-200'
}

function locTypeBadge(type: LocationType): string {
  const map: Record<LocationType, string> = {
    PICKING: 'bg-blue-50 text-blue-700',
    RESERVE: 'bg-slate-100 text-slate-700',
    RECEIVING: 'bg-emerald-50 text-emerald-700',
    SHIPPING: 'bg-purple-50 text-purple-700',
    QUARANTINE: 'bg-red-50 text-red-700',
    STAGING: 'bg-amber-50 text-amber-700',
  }
  return map[type] ?? 'bg-slate-100 text-slate-500'
}

function locTypeLabel(type: LocationType): string {
  const map: Record<LocationType, string> = {
    PICKING: 'Picking', RESERVE: 'Reserva', RECEIVING: 'Receção',
    SHIPPING: 'Expedição', QUARANTINE: 'Quarentena', STAGING: 'Staging',
  }
  return map[type] ?? type
}

// ── SVG icons ──────────────────────────────────────────────────────────────

function IconThermometer() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6.75A2.75 2.75 0 0 1 14.5 6.75v12.25a4 4 0 1 1-5.5 0z" />
    </svg>
  )
}

function IconWarehouse() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 22V12h6v10" />
    </svg>
  )
}

function IconChevronDown() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function IconChevronRight() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function IconMapPin() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  )
}

function IconGrid() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  )
}

// ── Nested data ────────────────────────────────────────────────────────────

function buildNested() {
  return zones.map((zone) => {
    const zoneAisles = aisles
      .filter((a) => a.zoneId === zone.id)
      .map((aisle) => {
        const aisleShelves = shelves
          .filter((s) => s.aisleId === aisle.id)
          .map((shelf) => ({
            ...shelf,
            locations: locations.filter((l) => l.shelfId === shelf.id),
          }))
        return { ...aisle, shelves: aisleShelves }
      })

    // also count locations not in aisles (like RECEIVING / SHIPPING that reference shelf s1 directly)
    return { ...zone, aisles: zoneAisles }
  })
}

// ── Zone card ──────────────────────────────────────────────────────────────

function ZoneCard({ zone }: { zone: ReturnType<typeof buildNested>[0] }) {
  const [expanded, setExpanded] = useState(false)
  const [expandedAisle, setExpandedAisle] = useState<string | null>(null)

  // Collect all locations for this zone's aisles
  const allZoneLocs = zone.aisles.flatMap((a) => a.shelves.flatMap((s) => s.locations))
  const avgOcc = allZoneLocs.length > 0
    ? Math.round(allZoneLocs.reduce((acc, l) => acc + (l.occupancy ?? 0), 0) / allZoneLocs.length)
    : 0
  const occupied = allZoneLocs.filter((l) => (l.currentStock ?? 0) > 0).length

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Zone header */}
      <button
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50/60 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
            {zone.code}
          </div>
          <div className="text-left">
            <p className="font-semibold text-slate-800">{zone.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{zone.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {zone.temperature !== undefined && (
            <div className="flex items-center gap-1.5 text-blue-600 text-sm font-medium">
              <IconThermometer />
              {zone.temperature}°C
            </div>
          )}
          <div className="text-right">
            <p className="text-xs text-slate-400">Corredores</p>
            <p className="font-semibold text-slate-700">{zone.aisles.length}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Localizações</p>
            <p className="font-semibold text-slate-700">{allZoneLocs.length}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Ocup. média</p>
            <p className={`font-semibold ${occupancyTextColor(avgOcc)}`}>{avgOcc}%</p>
          </div>
          <span className={`text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-0' : '-rotate-90'}`}>
            <IconChevronDown />
          </span>
        </div>
      </button>

      {/* Aisles */}
      {expanded && (
        <div className="border-t border-slate-100">
          {zone.aisles.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">Sem corredores nesta zona</p>
          ) : (
            zone.aisles.map((aisle) => {
              const aisleLocs = aisle.shelves.flatMap((s) => s.locations)
              const isAisleOpen = expandedAisle === aisle.id
              return (
                <div key={aisle.id} className="border-b border-slate-50 last:border-0">
                  <button
                    className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50/60 transition-colors"
                    onClick={() => setExpandedAisle(isAisleOpen ? null : aisle.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{isAisleOpen ? <IconChevronDown /> : <IconChevronRight />}</span>
                      <span className="text-sm font-semibold text-slate-700">{aisle.name}</span>
                      <span className="text-xs text-slate-400">({aisle.shelves.length} prateleiras · {aisleLocs.length} locs)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">
                        {aisleLocs.filter((l) => (l.currentStock ?? 0) > 0).length}/{aisleLocs.length} ocupadas
                      </span>
                    </div>
                  </button>

                  {isAisleOpen && (
                    <div className="px-5 pb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                      {aisle.shelves.flatMap((shelf) =>
                        shelf.locations.map((loc) => {
                          const occ = loc.occupancy ?? 0
                          return (
                            <div
                              key={loc.id}
                              className={`border rounded-lg p-2.5 ${occupancyBg(occ)}`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-mono text-xs font-semibold text-slate-700 truncate">{loc.code}</span>
                                <span className={`text-xs font-bold ${occupancyTextColor(occ)}`}>{occ}%</span>
                              </div>
                              <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${locTypeBadge(loc.type)}`}>
                                {locTypeLabel(loc.type)}
                              </span>
                              <div className="mt-1.5">
                                <div className="w-full bg-white/60 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full ${occupancyColor(occ)}`}
                                    style={{ width: `${occ}%` }}
                                  />
                                </div>
                              </div>
                              <div className="mt-1 flex justify-between text-xs text-slate-500">
                                <span>{loc.currentStock ?? 0} cx</span>
                                <span>/ {loc.capacity ?? '?'}</span>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function WarehousePage() {
  const [zoneFilter, setZoneFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [view, setView] = useState<'map' | 'table'>('map')

  const nested = useMemo(() => buildNested(), [])

  // Stats
  const totalLocations = locations.length
  const occupiedLocations = locations.filter((l) => (l.currentStock ?? 0) > 0).length
  const fullLocations = locations.filter(
    (l) => l.capacity && l.currentStock && l.currentStock >= l.capacity
  ).length
  const avgOccupancy =
    totalLocations > 0
      ? Math.round(locations.reduce((acc, l) => acc + (l.occupancy ?? 0), 0) / totalLocations)
      : 0

  // Filtered for table view
  const filteredLocations = useMemo(() => {
    return locations
      .map((l) => {
        const shelf = shelves.find((s) => s.id === l.shelfId)
        const aisle = aisles.find((a) => a.id === shelf?.aisleId)
        const zone = zones.find((z) => z.id === aisle?.zoneId)
        return { ...l, shelf, aisle, zone }
      })
      .filter((l) => {
        const matchZone = !zoneFilter || l.zone?.id === zoneFilter
        const matchType = !typeFilter || l.type === typeFilter
        return matchZone && matchType
      })
  }, [zoneFilter, typeFilter])

  // Filtered zones for map
  const filteredZones = useMemo(() =>
    nested.filter((z) => !zoneFilter || z.id === zoneFilter),
    [nested, zoneFilter]
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mapa de Armazém</h1>
            <p className="text-sm text-slate-500 mt-0.5">Visão geral das zonas e localizações</p>
          </div>
          <div className="flex rounded-xl border border-slate-200 overflow-hidden text-sm bg-white shadow-sm">
            <button
              onClick={() => setView('map')}
              className={`flex items-center gap-1.5 px-4 py-2 font-medium transition-colors ${
                view === 'map' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <IconWarehouse />
              Mapa
            </button>
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-1.5 px-4 py-2 font-medium transition-colors ${
                view === 'table' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <IconGrid />
              Tabela
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Localizações', value: totalLocations, color: 'text-slate-700', bg: 'bg-slate-50', bar: 'bg-slate-400' },
            { label: 'Ocupadas', value: occupiedLocations, color: 'text-blue-700', bg: 'bg-blue-50', bar: 'bg-blue-500' },
            { label: 'Ocupação Média', value: `${avgOccupancy}%`, color: 'text-emerald-700', bg: 'bg-emerald-50', bar: 'bg-emerald-500' },
            { label: 'Localizações Cheias', value: fullLocations, color: 'text-red-700', bg: 'bg-red-50', bar: 'bg-red-500' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${s.bar}`} />
                <span className="text-xs font-medium text-slate-500">{s.label}</span>
              </div>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <IconMapPin />
            <span className="font-medium">Filtrar:</span>
          </div>
          <select
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
          >
            <option value="">Todas as zonas</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
          <select
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Todos os tipos</option>
            {(['PICKING', 'RESERVE', 'RECEIVING', 'SHIPPING', 'QUARANTINE', 'STAGING'] as LocationType[]).map((t) => (
              <option key={t} value={t}>{locTypeLabel(t)}</option>
            ))}
          </select>

          {/* Occupancy legend */}
          <div className="ml-auto flex items-center gap-4 text-xs">
            {[
              { label: '>90% (cheio)', dot: 'bg-red-500' },
              { label: '70-90%', dot: 'bg-amber-400' },
              { label: '<70%', dot: 'bg-emerald-500' },
              { label: 'Vazio', dot: 'bg-slate-300' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-slate-500">
                <span className={`w-2.5 h-2.5 rounded-full ${l.dot}`} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Map view */}
        {view === 'map' && (
          <div className="space-y-4">
            {filteredZones.map((zone) => (
              <ZoneCard key={zone.id} zone={zone} />
            ))}
          </div>
        )}

        {/* Table view */}
        {view === 'table' && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Todas as localizações</span>
              <span className="text-xs text-slate-400">{filteredLocations.length} localizações</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Código', 'Zona', 'Corredor', 'Prateleira', 'Tipo', 'Nível', 'Pos.', 'Cap.', 'Stock', 'Ocupação', 'Estado'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLocations.length === 0 ? (
                    <tr><td colSpan={11} className="text-center py-12 text-slate-400">Nenhuma localização encontrada</td></tr>
                  ) : (
                    filteredLocations.map((loc) => {
                      const occ = loc.occupancy ?? 0
                      return (
                        <tr key={loc.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              {loc.code}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">{loc.zone?.name ?? '—'}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">{loc.aisle?.name ?? '—'}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{loc.shelf?.code ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${locTypeBadge(loc.type)}`}>
                              {locTypeLabel(loc.type)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 text-center">{loc.level}</td>
                          <td className="px-4 py-3 text-slate-600 text-center">{loc.position}</td>
                          <td className="px-4 py-3 text-slate-600 text-center">{loc.capacity ?? '—'}</td>
                          <td className="px-4 py-3 text-slate-700 font-medium text-center">{loc.currentStock ?? 0}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 min-w-[80px]">
                              <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${occupancyColor(occ)}`}
                                  style={{ width: `${occ}%` }}
                                />
                              </div>
                              <span className={`text-xs font-semibold w-9 text-right ${occupancyTextColor(occ)}`}>{occ}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                !loc.active ? 'bg-slate-100 text-slate-500' :
                                occ >= 100 ? 'bg-red-50 text-red-700' :
                                'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {!loc.active ? 'Inactivo' : occ >= 100 ? 'Cheio' : 'Activo'}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
