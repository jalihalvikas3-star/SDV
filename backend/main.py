from fastapi import FastAPI, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import time

from database import SessionLocal
from models import Vehicle, Firmware, OTAUpdate, EventLog
from firmware_data import get_firmware_checksum


class OTARequest(BaseModel):
    vehicle_id: str
    firmware_version: str
    checksum: str
    failure_scenario: str = "none"


SCENARIOS = {
    "none", "network", "low_battery", "storage",
    "checksum", "compatibility", "installation",
}
SCENARIO_MESSAGES = {
    "network": "Network connection lost during firmware download.",
    "low_battery": "Update blocked: simulated battery level is below the required threshold.",
    "storage": "Update failed: insufficient storage space for the firmware package.",
    "checksum": "SHA-256 checksum mismatch. Firmware installation blocked.",
    "compatibility": "Update blocked: firmware is incompatible with this vehicle.",
    "installation": "Firmware installation failed. Previous firmware was preserved.",
}

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def log_event(db, event, status):
    db.add(EventLog(event=event, status=status))
    db.commit()


def process_ota(ota_id, vehicle_id, firmware_version, scenario="none"):
    db = SessionLocal()
    try:
        ota = db.query(OTAUpdate).filter(OTAUpdate.id == ota_id).first()
        vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
        firmware = db.query(Firmware).filter(Firmware.version == firmware_version).first()
        if not ota or not vehicle or not firmware:
            return

        # Preflight checks: simulated conditions, without changing the DB schema.
        if scenario in {"low_battery", "compatibility"}:
            ota.status = "Failed"
            db.commit()
            log_event(db, SCENARIO_MESSAGES[scenario], "Failed")
            log_event(db, "Firmware installation blocked", "Failed")
            return

        ota.status = "Downloading"
        db.commit()
        log_event(db, "Firmware download started", "Info")
        time.sleep(2)
        if scenario == "network":
            ota.status = "Failed"
            db.commit()
            log_event(db, SCENARIO_MESSAGES[scenario], "Failed")
            log_event(db, "OTA update aborted", "Failed")
            return

        log_event(db, "Firmware download completed", "Success")
        if scenario == "storage":
            ota.status = "Failed"
            db.commit()
            log_event(db, SCENARIO_MESSAGES[scenario], "Failed")
            log_event(db, "Firmware installation blocked", "Failed")
            return

        ota.status = "Verifying"
        db.commit()
        log_event(db, f"Checksum verification started for {firmware_version}", "Info")
        time.sleep(1)
        actual_checksum = get_firmware_checksum()
        if scenario == "checksum" or firmware.checksum != actual_checksum:
            ota.status = "Checksum Failed"
            db.commit()
            log_event(db, SCENARIO_MESSAGES.get(scenario, "SHA-256 checksum mismatch"), "Failed")
            log_event(db, "Firmware installation blocked", "Failed")
            return

        log_event(db, "SHA-256 checksum verified", "Success")
        ota.status = "Installing"
        db.commit()
        log_event(db, f"Firmware {firmware_version} installation started", "Info")
        time.sleep(2)
        if scenario == "installation":
            ota.status = "Failed"
            db.commit()
            log_event(db, SCENARIO_MESSAGES[scenario], "Failed")
            log_event(db, "Previous firmware retained", "Info")
            return

        vehicle.current_firmware = firmware.version
        ota.status = "Installed"
        db.commit()
        log_event(db, f"Firmware {firmware_version} installed successfully", "Success")
    except Exception as error:
        db.rollback()
        ota = db.query(OTAUpdate).filter(OTAUpdate.id == ota_id).first()
        if ota:
            ota.status = "Failed"
            db.commit()
        log_event(db, f"OTA update failed: {error}", "Failed")
    finally:
        db.close()


@app.get("/")
def home():
    return {"message": "SDV OTA Backend is running"}


@app.get("/api/vehicle/{vehicle_id}")
def get_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not vehicle:
        return {"error": "Vehicle not found"}
    return {"vehicle_id": vehicle.vehicle_id, "current_firmware": vehicle.current_firmware}


@app.get("/api/firmware/latest")
def get_latest_firmware(db: Session = Depends(get_db)):
    firmware = db.query(Firmware).order_by(Firmware.id.desc()).first()
    if not firmware:
        return {"error": "No firmware available"}
    return {"version": firmware.version, "checksum": firmware.checksum}


@app.post("/api/ota/update")
def ota_update(request: OTARequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    log_event(db, f"OTA update requested for {request.vehicle_id}", "Info")
    if request.failure_scenario not in SCENARIOS:
        return {"status": "Failed", "message": "Unknown failure scenario."}

    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == request.vehicle_id).first()
    if not vehicle:
        log_event(db, "Vehicle not found", "Failed")
        return {"status": "Failed", "message": "Vehicle not found"}
    firmware = db.query(Firmware).filter(Firmware.version == request.firmware_version).first()
    if not firmware:
        log_event(db, "Firmware not found", "Failed")
        return {"status": "Failed", "message": "Firmware not found"}

    # Check the client-provided checksum except for the deliberate checksum demo.
    if request.failure_scenario != "checksum" and request.checksum != firmware.checksum:
        log_event(db, "Request checksum does not match firmware record", "Failed")
        return {"status": "Failed", "message": "Request checksum mismatch."}
    if request.failure_scenario != "checksum" and firmware.checksum != get_firmware_checksum():
        log_event(db, "Stored firmware checksum validation failed", "Failed")
        return {"status": "Failed", "message": "Firmware checksum validation failed."}

    ota = OTAUpdate(vehicle_id=request.vehicle_id, firmware_version=request.firmware_version, status="Downloading")
    db.add(ota)
    db.commit()
    db.refresh(ota)
    background_tasks.add_task(process_ota, ota.id, request.vehicle_id, request.firmware_version, request.failure_scenario)
    return {"status": "In Progress", "message": "OTA update started.", "ota_id": ota.id}


@app.get("/api/ota/status/{vehicle_id}")
def get_ota_status(vehicle_id: str, db: Session = Depends(get_db)):
    ota = db.query(OTAUpdate).filter(OTAUpdate.vehicle_id == vehicle_id).order_by(OTAUpdate.id.desc()).first()
    if not ota:
        return {"status": "No update found"}
    return {"vehicle_id": ota.vehicle_id, "firmware_version": ota.firmware_version, "status": ota.status}


@app.get("/api/events")
def get_events(db: Session = Depends(get_db)):
    events = db.query(EventLog).order_by(EventLog.id.desc()).all()
    return [{"id": event.id, "event": event.event, "status": event.status, "timestamp": event.timestamp} for event in events]

