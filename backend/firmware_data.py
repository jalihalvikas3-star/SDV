import hashlib


FIRMWARE_CONTENT = b"SDV Firmware v1.1.0"


def get_firmware_checksum():
    return hashlib.sha256(FIRMWARE_CONTENT).hexdigest()