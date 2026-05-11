import { type NextRequest } from 'next/server'
import { stockLots, products, locations, suppliers } from '@/lib/mockData'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const statusFilter = searchParams.get('status')
  const productFilter = searchParams.get('product')
  const expiryFilter = searchParams.get('expiry')

  let filtered = stockLots.map((lot) => ({
    ...lot,
    product: products.find((p) => p.id === lot.productId),
    location: locations.find((l) => l.id === lot.locationId),
    supplier: suppliers.find((s) => s.id === lot.supplierId),
  }))

  if (statusFilter) {
    filtered = filtered.filter((lot) => lot.status === statusFilter)
  }

  if (productFilter) {
    filtered = filtered.filter((lot) => lot.productId === productFilter)
  }

  if (expiryFilter === 'critical') {
    filtered = filtered.filter(
      (lot) => lot.daysUntilExpiry !== undefined && lot.daysUntilExpiry <= 7
    )
  } else if (expiryFilter === 'warning') {
    filtered = filtered.filter(
      (lot) => lot.daysUntilExpiry !== undefined && lot.daysUntilExpiry <= 30
    )
  }

  const summary = {
    totalBoxes: stockLots.reduce((acc, l) => acc + l.quantity, 0),
    totalReserved: stockLots.reduce((acc, l) => acc + l.reservedQty, 0),
    expiringIn30Days: stockLots.filter(
      (l) => l.daysUntilExpiry !== undefined && l.daysUntilExpiry > 0 && l.daysUntilExpiry <= 30
    ).length,
    blockedLots: stockLots.filter((l) => l.status === 'BLOCKED').length,
  }

  return Response.json({
    data: filtered,
    total: filtered.length,
    summary,
  })
}
