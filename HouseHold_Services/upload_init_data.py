from main  import app
from application.sec import datastore
from application.models import db, Service
from flask_security.utils import hash_password
import uuid
household_services_with_prices = [
    {"name": "Plumbing", "description": "Fixing leaks, installing pipes, and maintaining water systems.", "price": 1500.0, "time_required": 2.5},
    {"name": "Electrician", "description": "Repairing electrical wiring, installing appliances, and ensuring electrical safety.", "price": 1200.0, "time_required": 2.0},
    {"name": "Cleaning", "description": "General cleaning tasks like dusting, mopping, and vacuuming.", "price": 1000.0, "time_required": 3.0},
    {"name": "Gardening", "description": "Maintaining gardens, mowing lawns, and caring for plants.", "price": 1200.0, "time_required": 2.5},
    {"name": "Pest Control", "description": "Removing pests like insects, rodents, and termites from the home.", "price": 2500.0, "time_required": 1.5},
    {"name": "Painting", "description": "Applying paint or wallpaper to walls, ceilings, or furniture.", "price": 20.0, "time_required": 5.0},  # Per 100 sq. ft.
    {"name": "Appliance Repair", "description": "Fixing broken household appliances like refrigerators and washing machines.", "price": 2000.0, "time_required": 1.5},
    {"name": "Carpentry", "description": "Building or repairing furniture, cabinets, and other wooden structures.", "price": 3000.0, "time_required": 4.0},
    {"name": "Home Security", "description": "Installing security cameras, alarms, and other safety systems.", "price": 6000.0, "time_required": 3.5},
    {"name": "HVAC Maintenance", "description": "Servicing heating, ventilation, and air conditioning systems.", "price": 3000.0, "time_required": 2.5}
]

# Example usage:


with app.app_context():
    db.create_all()
    datastore.create_role(name="admin", description="User is an Admin")
    datastore.create_role(name="professional", description="User is an Professional")
    datastore.create_role(name="user", description="User is a user")
    db.session.commit()
    if not datastore.find_user(email="admin@gmail.com"):
        datastore.create_user(
            fullname = "admin",
            pin_code = 124001,
            email="admin@email.com", 
            password=hash_password("admin"), 
            roles=["admin"],
            fs_uniquifier = str(uuid.uuid4()))
    for service in household_services_with_prices:
        new_service = Service(service_name = service.get("name"),description = service.get("description"),base_price = service.get("price"),time_required=service.get("time_required"))
        db.session.add(new_service)
    db.session.commit()