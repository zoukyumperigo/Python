import { type NextRequest } from 'next/server'
import { products, categories } from '@/lib/mockData'
import type { Product } from '@/types'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get('search')?.toLowerCase()
  const categoryId = searchParams.get('category')
  const activeParam = searchParams.get('active')

  let filtered = products.map((p) => ({
    ...p,
    category: categories.find((c) => c.id === p.categoryId),
  }))

  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.code.toLowerCase().includes(search) ||
        (p.barcode && p.barcode.includes(search)) ||
        p.aliases.some((a) => a.toLowerCase().includes(search))
    )
  }

  if (categoryId) {
    filtered = filtered.filter((p) => p.categoryId === categoryId)
  }

  if (activeParam !== null) {
    const isActive = activeParam === 'true'
    filtered = filtered.filter((p) => p.active === isActive)
  }

  return Response.json({
    data: filtered,
    total: filtered.length,
    categories: categories,
  })
}

export async function POST(request: Request) {
  const body = await request.json()

  const newProduct: Product = {
    id: `p${Date.now()}`,
    code: body.code || `PROD${Date.now()}`,
    name: body.name || '',
    nameZh: body.nameZh,
    categoryId: body.categoryId || '',
    brand: body.brand,
    unit: body.unit || 'BOX',
    weightPerBox: body.weightPerBox ? Number(body.weightPerBox) : undefined,
    barcode: body.barcode,
    temperature: body.temperature ? Number(body.temperature) : undefined,
    minStock: Number(body.minStock) || 0,
    idealStock: Number(body.idealStock) || 0,
    active: body.active !== undefined ? Boolean(body.active) : true,
    requiresLot: body.requiresLot !== undefined ? Boolean(body.requiresLot) : true,
    requiresExpiry: body.requiresExpiry !== undefined ? Boolean(body.requiresExpiry) : true,
    shelfLifeDays: body.shelfLifeDays ? Number(body.shelfLifeDays) : undefined,
    aliases: Array.isArray(body.aliases) ? body.aliases : [],
    notes: body.notes,
    currentStock: 0,
    createdAt: new Date().toISOString(),
  }

  return Response.json({ data: newProduct, success: true }, { status: 201 })
}
