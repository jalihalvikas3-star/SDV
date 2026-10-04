from database import SessionLocal
from models import Vehicle, Firmware

db = SessionLocal()

vehicle = Vehicle(
    vehicle_id="CAR-001",
    current_firmware="v1.0.0",
)

firmware = Firmware(
    version="v1.1.0",
    checksum="demo-checksum-123",
)

db.add(vehicle)
db.add(firmware)

db.commit()
db.close()

print("Initial vehicle and firmware data added successfully.")