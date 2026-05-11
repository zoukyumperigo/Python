import { NextRequest, NextResponse } from 'next/server'
import { divergences } from '@/lib/mockData'
import type { Divergence, DivergenceType, DivergencePriority, DivergenceStatus } from '@/types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const type = searchParams.get('type') as DivergenceType | null
  const priority = searchParams.get('priority') as DivergencePriority | null
  const status = searchParams.get('status') as DivergenceStatus | null
  const assignedToId = searchParams.get('assignedToId')

  let filtered = [...divergences]

  if (type) filtered = filtered.filter(d => d.type === type)
  if (priority) filtered = filtered.filter(d => d.priority === priority)
  if (status) filtered = filtered.filter(d => d.status === status)
  if (assignedToId) filtered = filtered.filter(d => d.assignedToId === assignedToId)

  return NextResponse.json({
    data: filtered,
    total: filtered.length,
    open: filtered.filter(d => d.status === 'OPEN').length,
    critical: filtered.filter(d => d.priority === 'CRITICAL').length,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.type || !body.priority || !body.description) {
      return NextResponse.json(
        { error: 'Campos obrigatórios em falta: type, priority, description' },
        { status: 400 }
      )
    }

    const newDivergence: Divergence = {
      id: `div-${Date.now()}`,
      code: `DIV-${new Date().getFullYear()}-${String(divergences.length + 1).padStart(3, '0')}`,
      type: body.type as DivergenceType,
      priority: body.priority as DivergencePriority,
      status: 'OPEN',
      description: body.description,
      assignedToId: body.assignedToId,
      receivingId: body.receivingId,
      shippingOrderId: body.shippingOrderId,
      inventoryId: body.inventoryId,
      correctiveAction: body.correctiveAction,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ data: newDivergence }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao processar pedido' }, { status: 500 })
  }
}
