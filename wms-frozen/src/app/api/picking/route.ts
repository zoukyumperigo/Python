import type { NextRequest } from 'next/server'
import { pickingTasks } from '@/lib/mockData'
import type { PickingTask, TaskStatus } from '@/types'

const store: PickingTask[] = [...pickingTasks]
let counter = store.length + 1

function pad(n: number) {
  return String(n).padStart(4, '0')
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const status = searchParams.get('status') as TaskStatus | null

  const result = status
    ? store.filter((t) => t.status === status)
    : [...store]

  return Response.json({ data: result, total: result.length })
}

export async function POST(request: Request) {
  const body = await request.json()

  const now = new Date().toISOString()
  const newTask: PickingTask = {
    id: `pt-new-${counter}`,
    code: `PICK-${pad(counter++)}`,
    shippingOrderId: body.shippingOrderId ?? undefined,
    assignedToId: body.assignedToId ?? undefined,
    status: 'PENDING',
    priority: body.priority ?? 'NORMAL',
    notes: body.notes ?? undefined,
    items: body.items ?? [],
    createdAt: now,
    updatedAt: now,
  }

  store.push(newTask)

  return Response.json({ data: newTask }, { status: 201 })
}
