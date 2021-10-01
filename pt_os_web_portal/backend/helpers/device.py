import os

DEVICE_TYPE_FILE = "/run/pt_device_type"
HUB_SERIAL_FILE = "/run/pt_hub_serial"


def _read_from_file(file_path):
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            return f.read().strip()

    return None


def serial_number():
    serial = _read_from_file(HUB_SERIAL_FILE)
    return "unknown" if serial is None else serial


def device_type():
    device = _read_from_file(DEVICE_TYPE_FILE)
    return "" if device is None else device
