from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String, unique=True, nullable=False)
    current_firmware = Column(String, nullable=False)


class Firmware(Base):
    __tablename__ = "firmware"

    id = Column(Integer, primary_key=True, index=True)
    version = Column(String, unique=True, nullable=False)
    checksum = Column(String, nullable=False)


class OTAUpdate(Base):
    __tablename__ = "ota_updates"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String, nullable=False)
    firmware_version = Column(String, nullable=False)
    status = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


class EventLog(Base):
    __tablename__ = "event_logs"

    id = Column(Integer, primary_key=True, index=True)
    event = Column(String, nullable=False)
    status = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)