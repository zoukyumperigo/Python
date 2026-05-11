'use client'

import { useState, useMemo } from 'react'
import { products as allProducts, categories } from '@/lib/mockData'
import type { Product, ProductCategory, Unit } from '@/types'

// ── helpers ────────────────────────────────────────────────────────────────

function stockColor(product: Product) {
  const stock = product.currentStock ?? 0
  if (stock <= product.minStock) return 'red'
  if (stock < product.idealStock) return 'yellow'
  return 'green'
}

function unitLabel(u: Unit) {
  const map: Record<Unit, string> = { BOX: 'Cx', KG: 'Kg', UNIT: 'Un', PALLET: 'Plt' }
  return map[u]
}

const ITEMS_PER_PAGE = 10

// ── SVG icons ──────────────────────────────────────────────────────────────

function IconSearch() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}

function IconEdit() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.5-6.5a2 2 0 0 1 2.828 2.828L11.828 15.828a4 4 0 0 1-2.828 1.172H7v-2a4 4 0 0 1 1.172-2.828z" />
    </svg>
  )
}

function IconEye() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function IconToggle() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
    </svg>
  )
}

function IconX() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function IconChevronLeft() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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

// ── Modal ──────────────────────────────────────────────────────────────────

interface ProductModalProps {
  product: Product | null
  onClose: () => void
  onSave: (p: Partial<Product>) => void
}

function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const [form, setForm] = useState<Partial<Product>>(
    product ?? {
      code: '',
      name: '',
      nameZh: '',
      categoryId: categories[0]?.id ?? '',
      brand: '',
      unit: 'BOX',
      weightPerBox: undefined,
      barcode: '',
      temperature: -18,
      minStock: 0,
      idealStock: 0,
      active: true,
      requiresLot: true,
      requiresExpiry: true,
      shelfLifeDays: undefined,
      notes: '',
    }
  )

  function set<K extends keyof Product>(key: K, value: Product[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const isEdit = Boolean(product)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEdit ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <IconX />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Código *</label>
              <input
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.code ?? ''}
                onChange={(e) => set('code', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Barcode EAN</label>
              <input
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.barcode ?? ''}
                onChange={(e) => set('barcode', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nome *</label>
            <input
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.name ?? ''}
              onChange={(e) => set('name', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nome Chinês</label>
            <input
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.nameZh ?? ''}
              onChange={(e) => set('nameZh', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Categoria *</label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={form.categoryId ?? ''}
                onChange={(e) => set('categoryId', e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Marca</label>
              <input
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.brand ?? ''}
                onChange={(e) => set('brand', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Unidade *</label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={form.unit ?? 'BOX'}
                onChange={(e) => set('unit', e.target.value as Unit)}
              >
                <option value="BOX">Caixa</option>
                <option value="KG">Kg</option>
                <option value="UNIT">Unidade</option>
                <option value="PALLET">Palete</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Peso/cx (kg)</label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.weightPerBox ?? ''}
                onChange={(e) => set('weightPerBox', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Temperatura (°C)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.temperature ?? ''}
                onChange={(e) => set('temperature', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Stock Mínimo</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.minStock ?? 0}
                onChange={(e) => set('minStock', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Stock Ideal</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.idealStock ?? 0}
                onChange={(e) => set('idealStock', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Vida útil (dias)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.shelfLifeDays ?? ''}
                onChange={(e) => set('shelfLifeDays', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-blue-600"
                checked={form.requiresLot ?? true}
                onChange={(e) => set('requiresLot', e.target.checked)}
              />
              <span className="text-sm text-slate-700">Requer Lote</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-blue-600"
                checked={form.requiresExpiry ?? true}
                onChange={(e) => set('requiresExpiry', e.target.checked)}
              />
              <span className="text-sm text-slate-700">Requer Validade</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-blue-600"
                checked={form.active ?? true}
                onChange={(e) => set('active', e.target.checked)}
              />
              <span className="text-sm text-slate-700">Activo</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notas</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              value={form.notes ?? ''}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {isEdit ? 'Guardar Alterações' : 'Criar Produto'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [localProducts, setLocalProducts] = useState<Product[]>(allProducts)

  // Enrich products with category
  const enriched = useMemo(
    () =>
      localProducts.map((p) => ({
        ...p,
        category: categories.find((c) => c.id === p.categoryId),
      })),
    [localProducts]
  )

  // Filtered
  const filtered = useMemo(() => {
    return enriched.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.includes(search))
      const matchCat = !categoryFilter || p.categoryId === categoryFilter
      const matchActive =
        activeFilter === 'all' ||
        (activeFilter === 'active' && p.active) ||
        (activeFilter === 'inactive' && !p.active)
      return matchSearch && matchCat && matchActive
    })
  }, [enriched, search, categoryFilter, activeFilter])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  // Stats
  const totalActive = localProducts.filter((p) => p.active).length
  const totalInactive = localProducts.filter((p) => !p.active).length
  const totalCritical = localProducts.filter(
    (p) => p.active && (p.currentStock ?? 0) <= p.minStock
  ).length

  function openCreate() {
    setEditProduct(null)
    setModalOpen(true)
  }

  function openEdit(p: Product) {
    setEditProduct(p)
    setModalOpen(true)
  }

  function handleSave(form: Partial<Product>) {
    if (editProduct) {
      setLocalProducts((prev) =>
        prev.map((p) => (p.id === editProduct.id ? { ...p, ...form } : p))
      )
    } else {
      const newP: Product = {
        id: `p${Date.now()}`,
        code: form.code ?? '',
        name: form.name ?? '',
        nameZh: form.nameZh,
        categoryId: form.categoryId ?? '',
        brand: form.brand,
        unit: form.unit ?? 'BOX',
        weightPerBox: form.weightPerBox,
        barcode: form.barcode,
        temperature: form.temperature,
        minStock: form.minStock ?? 0,
        idealStock: form.idealStock ?? 0,
        active: form.active ?? true,
        requiresLot: form.requiresLot ?? true,
        requiresExpiry: form.requiresExpiry ?? true,
        shelfLifeDays: form.shelfLifeDays,
        aliases: form.aliases ?? [],
        notes: form.notes,
        currentStock: 0,
        createdAt: new Date().toISOString(),
      }
      setLocalProducts((prev) => [newP, ...prev])
    }
    setModalOpen(false)
  }

  function toggleActive(id: string) {
    setLocalProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    )
  }

  const categoryCount = useMemo(() => {
    const map: Record<string, number> = {}
    localProducts.forEach((p) => {
      map[p.categoryId] = (map[p.categoryId] ?? 0) + 1
    })
    return map
  }, [localProducts])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestão de Produtos</h1>
            <p className="text-sm text-slate-500 mt-0.5">Catálogo de produtos do armazém</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors"
          >
            <IconPlus />
            Novo Produto
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Produtos', value: localProducts.length, color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
            { label: 'Activos', value: totalActive, color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
            { label: 'Inactivos', value: totalInactive, color: 'bg-slate-50 text-slate-600', dot: 'bg-slate-400' },
            { label: 'Stock Crítico', value: totalCritical, color: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span className="text-xs text-slate-500 font-medium">{s.label}</span>
              </div>
              <p className={`text-3xl font-bold ${s.color.split(' ')[1]}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 flex-1 min-w-[220px] bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <span className="text-slate-400"><IconSearch /></span>
              <input
                className="bg-transparent text-sm flex-1 focus:outline-none placeholder:text-slate-400"
                placeholder="Pesquisar por nome, código ou barcode…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>

            {/* Category */}
            <select
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
            >
              <option value="">Todas as categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({categoryCount[c.id] ?? 0})
                </option>
              ))}
            </select>

            {/* Active */}
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
              {(['all', 'active', 'inactive'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => { setActiveFilter(v); setPage(1) }}
                  className={`px-3 py-2 font-medium transition-colors ${
                    activeFilter === v
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {v === 'all' ? 'Todos' : v === 'active' ? 'Activos' : 'Inactivos'}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400 ml-auto">{filtered.length} resultados</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Código', 'Nome', 'Categoria', 'Unid.', 'Peso/cx', 'Temp.', 'Stock Actual vs Mín', 'Barcode', 'Estado', 'Acções'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-slate-400">Nenhum produto encontrado</td>
                  </tr>
                ) : (
                  paginated.map((product) => {
                    const sc = stockColor(product)
                    const stock = product.currentStock ?? 0
                    const cat = product.category
                    return (
                      <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {product.code}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[220px]">
                          <p className="font-medium text-slate-800 truncate">{product.name}</p>
                          {product.nameZh && (
                            <p className="text-xs text-slate-400 truncate">{product.nameZh}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {cat ? (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                            >
                              {cat.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{unitLabel(product.unit)}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {product.weightPerBox ? `${product.weightPerBox} kg` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {product.temperature !== undefined ? (
                            <span className="text-blue-600 font-medium">{product.temperature}°C</span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold ${
                                sc === 'red' ? 'text-red-600' : sc === 'yellow' ? 'text-amber-600' : 'text-emerald-600'
                              }`}
                            >
                              {stock}
                            </span>
                            <span className="text-slate-400">/</span>
                            <span className="text-slate-500 text-xs">{product.minStock} mín</span>
                            <span
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                sc === 'red' ? 'bg-red-500' : sc === 'yellow' ? 'bg-amber-400' : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-slate-500">{product.barcode ?? '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              product.active
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {product.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(product)}
                              title="Editar"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <IconEdit />
                            </button>
                            <button
                              title="Ver stock"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <IconEye />
                            </button>
                            <button
                              onClick={() => toggleActive(product.id)}
                              title={product.active ? 'Desactivar' : 'Activar'}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <IconToggle />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs text-slate-500">
                Página {page} de {totalPages} · {filtered.length} produtos
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <IconChevronLeft />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                  const pageNum = start + i
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                        pageNum === page
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <IconChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <ProductModal
          product={editProduct}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
