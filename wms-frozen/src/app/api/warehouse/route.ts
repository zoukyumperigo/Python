import { zones, aisles, shelves, locations } from '@/lib/mockData'

export async function GET() {
  const zonesWithNested = zones.map((zone) => {
    const zoneAisles = aisles
      .filter((a) => a.zoneId === zone.id)
      .map((aisle) => {
        const aisleShelves = shelves
          .filter((s) => s.aisleId === aisle.id)
          .map((shelf) => {
            const shelfLocations = locations.filter((l) => l.shelfId === shelf.id)
            return { ...shelf, locations: shelfLocations }
          })
        return { ...aisle, shelves: aisleShelves }
      })
    return { ...zone, aisles: zoneAisles }
  })

  const locationStats = {
    total: locations.length,
    occupied: locations.filter((l) => (l.currentStock || 0) > 0).length,
    full: locations.filter(
      (l) => l.capacity && l.currentStock && l.currentStock >= l.capacity
    ).length,
    avgOccupancy:
      locations.length > 0
        ? Math.round(
            locations.reduce((acc, l) => acc + (l.occupancy || 0), 0) / locations.length
          )
        : 0,
  }

  return Response.json({
    data: zonesWithNested,
    locationStats,
    total: zones.length,
  })
}
