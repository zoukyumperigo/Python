import { NextRequest, NextResponse } from 'next/server'
import { tasks } from '@/lib/mockData'
import type { Task, TaskType, TaskStatus, TaskPriority } from '@/types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const type = searchParams.get('type') as TaskType | null
  const status = searchParams.get('status') as TaskStatus | null
  const priority = searchParams.get('priority') as TaskPriority | null
  const assignedToId = searchParams.get('assignedToId')

  let filtered = [...tasks]

  if (type) filtered = filtered.filter(t => t.type === type)
  if (status) filtered = filtered.filter(t => t.status === status)
  if (priority) filtered = filtered.filter(t => t.priority === priority)
  if (assignedToId) filtered = filtered.filter(t => t.assignedToId === assignedToId)

  return NextResponse.json({
    data: filtered,
    total: filtered.length,
    pending: filtered.filter(t => t.status === 'PENDING').length,
    inProgress: filtered.filter(t => t.status === 'IN_PROGRESS').length,
    completed: filtered.filter(t => t.status === 'COMPLETED').length,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.type || !body.priority) {
      return NextResponse.json(
        { error: 'Campos obrigatórios em falta: type, priority' },
        { status: 400 }
      )
    }

    const newTask: Task = {
      id: `t-${Date.now()}`,
      code: `TSK-${String(tasks.length + 1).padStart(3, '0')}`,
      type: body.type as TaskType,
      status: body.assignedToId ? 'ASSIGNED' : 'PENDING',
      priority: body.priority as TaskPriority,
      assignedToId: body.assignedToId,
      locationId: body.locationId,
      reference: body.reference,
      description: body.description,
      dueAt: body.dueAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ data: newTask }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao processar pedido' }, { status: 500 })
  }
}
