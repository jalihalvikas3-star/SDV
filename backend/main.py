from fastapi import FastAPI, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Vehicle, Firmware, OTAUpdate, EventLog
from firmware_data import get_firmware_checksum


class OTARequest(BaseModel):
    vehicle_id: str
    firmware_version: str
    checksum: str


app = FastAPI()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def log_event(db, event, status):
    log = EventLog(
        event=event,
        status=status,
    )

    db.add(log)
    db.commit()


@app.get("/")
def home():
    return {"message": "SDV OTA Backend is running"}


@app.get("/api/vehicle/{vehicle_id}")
def get_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    vehicle = (
        db.query(Vehicle)
        .filter(Vehicle.vehicle_id == vehicle_id)
        .first()
    )

    if not vehicle:
        return {"error": "Vehicle not found"}

    return {
        "vehicle_id": vehicle.vehicle_id,
        "current_firmware": vehicle.current_firmware,
    }


@app.get("/api/firmware/latest")
def get_latest_firmware(db: Session = Depends(get_db)):
    firmware = (
        db.query(Firmware)
        .order_by(Firmware.id.desc())
        .first()
    )

    if not firmware:
        return {"error": "No firmware available"}

    return {
        "version": firmware.version,
        "checksum": firmware.checksum,
    }


@app.post("/api/ota/update")
def ota_update(request: OTARequest, db: Session = Depends(get_db)):
    log_event(
        db,
        f"OTA update requested for {request.vehicle_id}",
        "Info",
    )

    vehicle = (
        db.query(Vehicle)
        .filter(Vehicle.vehicle_id == request.vehicle_id)
        .first()
    )

    if not vehicle:
        return {
            "status": "Failed",
            "message": "Vehicle not found",
        }

    firmware = (
        db.query(Firmware)
        .filter(Firmware.version == request.firmware_version)
        .first()
    )

    if not firmware:
        return {
            "status": "Failed",
            "message": "Firmware not found",
        }

    actual_checksum = get_firmware_checksum()

    log_event(
        db,
        f"Checksum verification started for {request.firmware_version}",
        "Info",
    )

    if request.checksum != actual_checksum:
        log_event(
            db,
            "SHA-256 checksum mismatch",
            "Failed",
        )

        log_event(
            db,
            "Firmware installation blocked",
            "Failed",
        )

        ota = OTAUpdate(
            vehicle_id=request.vehicle_id,
            firmware_version=request.firmware_version,
            status="Checksum Failed",
        )

        db.add(ota)
        db.commit()

        return {
            "status": "Failed",
            "message": "SHA-256 checksum mismatch. Installation blocked.",
        }

    log_event(
        db,
        f"Firmware {firmware.version} installation started",
        "Info",
    )

    vehicle.current_firmware = firmware.version

    log_event(
        db,
        f"Firmware {firmware.version} installed successfully",
        "Success",
    )

    ota = OTAUpdate(
        vehicle_id=request.vehicle_id,
        firmware_version=firmware.version,
        status="Installed",
    )

    db.add(ota)
    db.commit()

    return {
        "status": "Success",
        "message": "Firmware installed successfully.",
        "vehicle_id": vehicle.vehicle_id,
        "current_firmware": vehicle.current_firmware,
    }
@app.get("/api/events")
def get_events(db: Session = Depends(get_db)):
    events = (
        db.query(EventLog)
        .order_by(EventLog.id.desc())
        .all()
    )

    return [
        {
            "id": event.id,
            "event": event.event,
            "status": event.status,
            "timestamp": event.timestamp,
        }
        for event in events
    ]