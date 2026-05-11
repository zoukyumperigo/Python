import type { NextRequest } from 'next/server'
import { shippingOrders } from '@/lib/mockData'
import type { ShippingOrder, ShippingOrderStatus } from '@/types'

const store: ShippingOrder[] = [...shippingOrders]
let counter = store.length + 1

function pad(n: number) {
  return String(n).padStart(4, '0')
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const status = searchParams.get('status') as ShippingOrderStatus | null
  const customer = searchParams.get('customer')

  let result = [...store]
  if (status) result = result.filter((o) => o.status === status)
  if (customer) result = result.filter((o) => o.customerId === customer)

  return Response.json({ data: result, total: result.length })
}

export async function POST(request: Request) {
  const body = await request.json()

  const now = new Date().toISOString()
  const newOrder: ShippingOrder = {
    id: `ship-new-${counter}`,
    code: `EXP-${pad(counter++)}`,
    customerId: body.customerId ?? '',
    route: body.route ?? undefined,
    requestedDate: body.requestedDate ?? undefined,
    status: 'PENDING',
    notes: body.notes ?? undefined,
    items: body.items ?? [],
    createdAt: now,
    updatedAt: now,
  }

  store.push(newOrder)

  return Response.json({ data: newOrder }, { status: 201 })
}
