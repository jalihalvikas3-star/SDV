from database import SessionLocal
from models import Firmware
from firmware_data import get_firmware_checksum

db = SessionLocal()

firmware = db.query(Firmware).filter(
    Firmware.version == "v1.1.0"
).first()

if firmware:
    firmware.checksum = get_firmware_checksum()
    db.commit()
    print("Firmware checksum updated successfully.")
else:
    print("Firmware not found.")

db.close()