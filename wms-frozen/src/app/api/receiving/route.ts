import type { NextRequest } from 'next/server'
import { receivings } from '@/lib/mockData'
import type { Receiving, ReceivingStatus } from '@/types'

// In-memory store seeded from mockData (per-process, resets on cold start)
const store: Receiving[] = [...receivings]
let counter = store.length + 1

function pad(n: number) {
  return String(n).padStart(4, '0')
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const status = searchParams.get('status') as ReceivingStatus | null

  const result = status
    ? store.filter((r) => r.status === status)
    : [...store]

  return Response.json({ data: result, total: result.length })
}

export async function POST(request: Request) {
  const body = await request.json()

  const now = new Date().toISOString()
  const newReceiving: Receiving = {
    id: `rec-new-${counter}`,
    code: `REC-${pad(counter++)}`,
    supplierId: body.supplierId ?? '',
    documentNumber: body.documentNumber ?? undefined,
    expectedDate: body.expectedDate ?? undefined,
    status: 'PENDING',
    hasDivergence: false,
    notes: body.notes ?? undefined,
    createdById: body.createdById ?? undefined,
    items: body.items ?? [],
    createdAt: now,
    updatedAt: now,
  }

  store.push(newReceiving)

  return Response.json({ data: newReceiving }, { status: 201 })
}
