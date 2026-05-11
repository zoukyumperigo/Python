import math
from typing import List, Dict, Tuple, Optional


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in km between two lat/lon points."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def build_distance_matrix(stops: List[Dict]) -> List[List[float]]:
    n = len(stops)
    matrix = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                matrix[i][j] = haversine(
                    stops[i]["lat"], stops[i]["lon"],
                    stops[j]["lat"], stops[j]["lon"],
                )
    return matrix


def nearest_neighbor(stops: List[Dict], depot_idx: int = 0) -> List[int]:
    """Greedy nearest-neighbor tour starting and ending at depot."""
    n = len(stops)
    if n <= 1:
        return list(range(n))
    matrix = build_distance_matrix(stops)
    visited = [False] * n
    tour = [depot_idx]
    visited[depot_idx] = True
    current = depot_idx
    for _ in range(n - 1):
        best_dist = float("inf")
        best_next = -1
        for j in range(n):
            if not visited[j] and matrix[current][j] < best_dist:
                best_dist = matrix[current][j]
                best_next = j
        tour.append(best_next)
        visited[best_next] = True
        current = best_next
    tour.append(depot_idx)
    return tour


def two_opt(tour: List[int], matrix: List[List[float]], max_iter: int = 500) -> List[int]:
    """Improve tour with 2-opt swaps."""
    best = tour[:]
    improved = True
    iterations = 0
    while improved and iterations < max_iter:
        improved = False
        iterations += 1
        for i in range(1, len(best) - 2):
            for j in range(i + 1, len(best) - 1):
                new_tour = best[:i] + best[i:j + 1][::-1] + best[j + 1:]
                if _tour_length(new_tour, matrix) < _tour_length(best, matrix) - 1e-10:
                    best = new_tour
                    improved = True
    return best


def _tour_length(tour: List[int], matrix: List[List[float]]) -> float:
    return sum(matrix[tour[i]][tour[i + 1]] for i in range(len(tour) - 1))


def split_into_routes(
    stops: List[Dict],
    num_vehicles: int,
    depot_idx: int = 0,
    max_capacity: Optional[float] = None,
) -> List[List[int]]:
    """Split optimized tour into vehicle sub-routes respecting capacity."""
    if not stops or num_vehicles < 1:
        return []

    delivery_stops = [s for i, s in enumerate(stops) if i != depot_idx]
    if not delivery_stops:
        return [[] for _ in range(num_vehicles)]

    # Build full stop list with depot first
    all_stops = [stops[depot_idx]] + delivery_stops
    tour = nearest_neighbor(all_stops, depot_idx=0)
    matrix = build_distance_matrix(all_stops)
    tour = two_opt(tour, matrix)

    # Strip repeated depot at end
    delivery_indices = [t for t in tour if t != 0]

    # Split evenly across vehicles (or by capacity)
    per_vehicle = math.ceil(len(delivery_indices) / num_vehicles)
    routes = []
    for v in range(num_vehicles):
        chunk = delivery_indices[v * per_vehicle: (v + 1) * per_vehicle]
        if chunk:
            routes.append(chunk)

    return routes


def optimize_routes(payload: Dict) -> Dict:
    """
    Main entry point called from the API.

    payload = {
        "depot": {"lat": float, "lon": float, "address": str},
        "stops": [{"id": int, "lat": float, "lon": float, "address": str, "load": float}, ...],
        "vehicles": [{"id": int, "capacity": float}, ...],
    }
    Returns optimised route assignments per vehicle.
    """
    depot = payload["depot"]
    raw_stops = payload["stops"]
    vehicles = payload.get("vehicles", [{"id": 1, "capacity": 9999}])

    if not raw_stops:
        return {"routes": [], "total_distance_km": 0}

    # Build unified stop list: depot first
    all_stops = [{"lat": depot["lat"], "lon": depot["lon"]}] + [
        {"lat": s["lat"], "lon": s["lon"]} for s in raw_stops
    ]

    num_vehicles = len(vehicles)
    raw_routes = split_into_routes(all_stops, num_vehicles)

    matrix = build_distance_matrix(all_stops)
    result_routes = []
    total_dist = 0.0

    for v_idx, chunk in enumerate(raw_routes):
        vehicle = vehicles[v_idx] if v_idx < len(vehicles) else vehicles[-1]
        # Map indices back to original stop ids
        assigned_stops = []
        for stop_idx in chunk:
            # stop_idx references all_stops (1-based for deliveries)
            orig = raw_stops[stop_idx - 1]
            assigned_stops.append(orig)

        # Compute distance for this sub-route
        route_indices = [0] + chunk + [0]
        dist = _tour_length(route_indices, matrix)
        total_dist += dist

        result_routes.append({
            "vehicle_id": vehicle["id"],
            "stops": assigned_stops,
            "distance_km": round(dist, 2),
            "estimated_duration_min": round(dist / 0.5, 0),  # ~30 km/h average
        })

    return {
        "routes": result_routes,
        "total_distance_km": round(total_dist, 2),
    }
