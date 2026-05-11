from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit
from datetime import datetime
import json
import random
import math

app = Flask(__name__)
app.config["SECRET_KEY"] = "spoke-dispatch-secret-2026"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///dispatch.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class Driver(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(30))
    vehicle_type = db.Column(db.String(50), default="Van")
    capacity = db.Column(db.Float, default=100.0)
    status = db.Column(db.String(20), default="available")  # available | on_route | offline
    current_lat = db.Column(db.Float, default=40.7128)
    current_lon = db.Column(db.Float, default=-74.0060)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "vehicle_type": self.vehicle_type,
            "capacity": self.capacity,
            "status": self.status,
            "lat": self.current_lat,
            "lon": self.current_lon,
        }


class Delivery(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    recipient_name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    lat = db.Column(db.Float, nullable=False)
    lon = db.Column(db.Float, nullable=False)
    load = db.Column(db.Float, default=1.0)
    time_window_start = db.Column(db.String(10))
    time_window_end = db.Column(db.String(10))
    status = db.Column(db.String(20), default="pending")  # pending | assigned | delivered | failed
    notes = db.Column(db.Text)
    driver_id = db.Column(db.Integer, db.ForeignKey("driver.id"), nullable=True)
    route_id = db.Column(db.Integer, db.ForeignKey("route.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "recipient_name": self.recipient_name,
            "address": self.address,
            "lat": self.lat,
            "lon": self.lon,
            "load": self.load,
            "time_window_start": self.time_window_start,
            "time_window_end": self.time_window_end,
            "status": self.status,
            "notes": self.notes,
            "driver_id": self.driver_id,
            "route_id": self.route_id,
        }


class Route(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    driver_id = db.Column(db.Integer, db.ForeignKey("driver.id"), nullable=True)
    status = db.Column(db.String(20), default="draft")  # draft | active | completed
    total_distance_km = db.Column(db.Float, default=0.0)
    estimated_duration_min = db.Column(db.Float, default=0.0)
    stops_order = db.Column(db.Text, default="[]")  # JSON list of delivery IDs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "driver_id": self.driver_id,
            "status": self.status,
            "total_distance_km": self.total_distance_km,
            "estimated_duration_min": self.estimated_duration_min,
            "stops_order": json.loads(self.stops_order or "[]"),
            "created_at": self.created_at.isoformat(),
        }


# ---------------------------------------------------------------------------
# Page routes
# ---------------------------------------------------------------------------

@app.route("/")
def landing():
    return render_template("landing.html")


@app.route("/dashboard")
def dashboard():
    total_drivers = Driver.query.count()
    active_drivers = Driver.query.filter_by(status="on_route").count()
    total_deliveries = Delivery.query.count()
    pending_deliveries = Delivery.query.filter_by(status="pending").count()
    delivered_today = Delivery.query.filter_by(status="delivered").count()
    active_routes = Route.query.filter_by(status="active").count()
    stats = {
        "total_drivers": total_drivers,
        "active_drivers": active_drivers,
        "total_deliveries": total_deliveries,
        "pending_deliveries": pending_deliveries,
        "delivered_today": delivered_today,
        "active_routes": active_routes,
    }
    return render_template("dashboard.html", stats=stats)


@app.route("/routes")
def routes_page():
    routes = Route.query.order_by(Route.created_at.desc()).all()
    drivers = Driver.query.filter(Driver.status != "offline").all()
    return render_template("routes.html", routes=routes, drivers=drivers)


@app.route("/drivers")
def drivers_page():
    drivers = Driver.query.order_by(Driver.name).all()
    return render_template("drivers.html", drivers=drivers)


@app.route("/deliveries")
def deliveries_page():
    deliveries = Delivery.query.order_by(Delivery.created_at.desc()).all()
    drivers = Driver.query.all()
    return render_template("deliveries.html", deliveries=deliveries, drivers=drivers)


@app.route("/tracking")
def tracking_page():
    drivers = Driver.query.filter(Driver.status != "offline").all()
    routes = Route.query.filter_by(status="active").all()
    return render_template("tracking.html", drivers=drivers, routes=routes)


# ---------------------------------------------------------------------------
# Driver API
# ---------------------------------------------------------------------------

@app.route("/api/drivers", methods=["GET"])
def get_drivers():
    return jsonify([d.to_dict() for d in Driver.query.all()])


@app.route("/api/drivers", methods=["POST"])
def create_driver():
    data = request.json
    driver = Driver(
        name=data["name"],
        email=data["email"],
        phone=data.get("phone", ""),
        vehicle_type=data.get("vehicle_type", "Van"),
        capacity=float(data.get("capacity", 100)),
    )
    db.session.add(driver)
    db.session.commit()
    return jsonify(driver.to_dict()), 201


@app.route("/api/drivers/<int:driver_id>", methods=["PUT"])
def update_driver(driver_id):
    driver = Driver.query.get_or_404(driver_id)
    data = request.json
    for field in ["name", "email", "phone", "vehicle_type", "capacity", "status"]:
        if field in data:
            setattr(driver, field, data[field])
    db.session.commit()
    return jsonify(driver.to_dict())


@app.route("/api/drivers/<int:driver_id>", methods=["DELETE"])
def delete_driver(driver_id):
    driver = Driver.query.get_or_404(driver_id)
    db.session.delete(driver)
    db.session.commit()
    return jsonify({"deleted": True})


# ---------------------------------------------------------------------------
# Delivery API
# ---------------------------------------------------------------------------

@app.route("/api/deliveries", methods=["GET"])
def get_deliveries():
    return jsonify([d.to_dict() for d in Delivery.query.all()])


@app.route("/api/deliveries", methods=["POST"])
def create_delivery():
    data = request.json
    delivery = Delivery(
        recipient_name=data["recipient_name"],
        address=data["address"],
        lat=float(data["lat"]),
        lon=float(data["lon"]),
        load=float(data.get("load", 1.0)),
        time_window_start=data.get("time_window_start"),
        time_window_end=data.get("time_window_end"),
        notes=data.get("notes", ""),
    )
    db.session.add(delivery)
    db.session.commit()
    return jsonify(delivery.to_dict()), 201


@app.route("/api/deliveries/<int:delivery_id>", methods=["PUT"])
def update_delivery(delivery_id):
    delivery = Delivery.query.get_or_404(delivery_id)
    data = request.json
    for field in ["status", "driver_id", "notes", "time_window_start", "time_window_end"]:
        if field in data:
            setattr(delivery, field, data[field])
    db.session.commit()
    return jsonify(delivery.to_dict())


@app.route("/api/deliveries/<int:delivery_id>", methods=["DELETE"])
def delete_delivery(delivery_id):
    delivery = Delivery.query.get_or_404(delivery_id)
    db.session.delete(delivery)
    db.session.commit()
    return jsonify({"deleted": True})


# ---------------------------------------------------------------------------
# Route optimization API
# ---------------------------------------------------------------------------

@app.route("/api/optimize", methods=["POST"])
def optimize():
    from optimizer.algorithm import optimize_routes
    data = request.json
    result = optimize_routes(data)
    return jsonify(result)


@app.route("/api/routes", methods=["GET"])
def get_routes():
    return jsonify([r.to_dict() for r in Route.query.all()])


@app.route("/api/routes", methods=["POST"])
def create_route():
    data = request.json
    route = Route(
        name=data.get("name", f"Route {datetime.utcnow().strftime('%m/%d %H:%M')}"),
        driver_id=data.get("driver_id"),
        total_distance_km=data.get("total_distance_km", 0),
        estimated_duration_min=data.get("estimated_duration_min", 0),
        stops_order=json.dumps(data.get("stops_order", [])),
    )
    db.session.add(route)
    db.session.flush()

    # Mark deliveries as assigned
    for delivery_id in data.get("stops_order", []):
        delivery = Delivery.query.get(delivery_id)
        if delivery:
            delivery.status = "assigned"
            delivery.route_id = route.id
            delivery.driver_id = data.get("driver_id")

    # Mark driver as on_route
    if data.get("driver_id"):
        driver = Driver.query.get(data["driver_id"])
        if driver:
            driver.status = "on_route"

    db.session.commit()
    return jsonify(route.to_dict()), 201


@app.route("/api/routes/<int:route_id>", methods=["PUT"])
def update_route(route_id):
    route = Route.query.get_or_404(route_id)
    data = request.json
    for field in ["name", "status", "driver_id"]:
        if field in data:
            setattr(route, field, data[field])
    db.session.commit()
    return jsonify(route.to_dict())


@app.route("/api/routes/<int:route_id>", methods=["DELETE"])
def delete_route(route_id):
    route = Route.query.get_or_404(route_id)
    db.session.delete(route)
    db.session.commit()
    return jsonify({"deleted": True})


# ---------------------------------------------------------------------------
# Live tracking – simulated driver position updates
# ---------------------------------------------------------------------------

@socketio.on("request_positions")
def handle_positions():
    drivers = Driver.query.filter(Driver.status != "offline").all()
    positions = []
    for d in drivers:
        # Simulate slight movement for on_route drivers
        if d.status == "on_route":
            d.current_lat += random.uniform(-0.001, 0.001)
            d.current_lon += random.uniform(-0.001, 0.001)
            db.session.commit()
        positions.append(d.to_dict())
    emit("positions_update", positions)


@socketio.on("connect")
def handle_connect():
    emit("connected", {"msg": "Connected to Dispatch"})


# ---------------------------------------------------------------------------
# Seed demo data
# ---------------------------------------------------------------------------

def seed_demo_data():
    if Driver.query.count() > 0:
        return

    drivers_data = [
        {"name": "Marcus Johnson", "email": "marcus@dispatch.demo", "phone": "+1-555-0101",
         "vehicle_type": "Van", "capacity": 120, "status": "on_route",
         "current_lat": 40.7282, "current_lon": -73.7949},
        {"name": "Elena Rodriguez", "email": "elena@dispatch.demo", "phone": "+1-555-0102",
         "vehicle_type": "Truck", "capacity": 300, "status": "available",
         "current_lat": 40.6501, "current_lon": -73.9496},
        {"name": "Yuki Tanaka", "email": "yuki@dispatch.demo", "phone": "+1-555-0103",
         "vehicle_type": "Cargo Bike", "capacity": 30, "status": "on_route",
         "current_lat": 40.7589, "current_lon": -73.9851},
        {"name": "David Osei", "email": "david@dispatch.demo", "phone": "+1-555-0104",
         "vehicle_type": "Van", "capacity": 100, "status": "available",
         "current_lat": 40.7831, "current_lon": -73.9712},
    ]

    for dd in drivers_data:
        d = Driver(**dd)
        db.session.add(d)
    db.session.flush()

    deliveries_data = [
        {"recipient_name": "Alice Mercer", "address": "Empire State Building, NYC",
         "lat": 40.7484, "lon": -73.9967, "load": 5, "status": "delivered",
         "time_window_start": "09:00", "time_window_end": "12:00"},
        {"recipient_name": "Bob Chen", "address": "Times Square, NYC",
         "lat": 40.7580, "lon": -73.9855, "load": 3, "status": "assigned",
         "time_window_start": "10:00", "time_window_end": "14:00"},
        {"recipient_name": "Carol Davis", "address": "Central Park West, NYC",
         "lat": 40.7851, "lon": -73.9683, "load": 8, "status": "pending",
         "time_window_start": "13:00", "time_window_end": "17:00"},
        {"recipient_name": "Diana Park", "address": "Brooklyn Bridge, NYC",
         "lat": 40.7061, "lon": -73.9969, "load": 2, "status": "pending",
         "time_window_start": "08:00", "time_window_end": "12:00"},
        {"recipient_name": "Ethan Brooks", "address": "Yankee Stadium, Bronx",
         "lat": 40.8296, "lon": -73.9262, "load": 15, "status": "delivered",
         "time_window_start": "09:00", "time_window_end": "11:00"},
        {"recipient_name": "Fiona Walsh", "address": "Coney Island, Brooklyn",
         "lat": 40.5755, "lon": -73.9707, "load": 4, "status": "pending",
         "time_window_start": "14:00", "time_window_end": "18:00"},
        {"recipient_name": "George Kim", "address": "Flushing, Queens",
         "lat": 40.7678, "lon": -73.8330, "load": 6, "status": "pending"},
        {"recipient_name": "Hannah Lee", "address": "Staten Island Ferry Terminal",
         "lat": 40.6437, "lon": -74.0731, "load": 10, "status": "assigned"},
        {"recipient_name": "Ivan Petrov", "address": "Long Island City, Queens",
         "lat": 40.7447, "lon": -73.9485, "load": 7, "status": "pending"},
        {"recipient_name": "Julia Santos", "address": "Astoria, Queens",
         "lat": 40.7721, "lon": -73.9302, "load": 3, "status": "delivered"},
    ]

    for dd in deliveries_data:
        d = Delivery(**dd)
        db.session.add(d)

    # Create an active route
    route = Route(
        name="NYC Morning Run",
        driver_id=1,
        status="active",
        total_distance_km=42.3,
        estimated_duration_min=98,
        stops_order=json.dumps([1, 2, 5, 10]),
    )
    db.session.add(route)
    db.session.commit()


with app.app_context():
    db.create_all()
    seed_demo_data()


if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5000, allow_unsafe_werkzeug=True)
