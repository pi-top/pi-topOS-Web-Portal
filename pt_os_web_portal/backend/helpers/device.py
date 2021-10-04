from os.path import exists

from pitop.system import device_type

HUB_SERIAL_FILE = "/run/pt_hub_serial"


def _read_from_file(file_path):
    if exists(file_path):
        with open(file_path, "r") as f:
            return f.read().strip()

    return None


def serial_number():
    serial = _read_from_file(HUB_SERIAL_FILE)
    return "unknown" if serial is None else serial


def firmware_version():
    if device_type() == "pi_top_4":
        from pitop.common.firmware_device import FirmwareDevice

        return FirmwareDevice(
            FirmwareDevice.str_name_to_device_id("pt4_hub")
        ).get_fw_version()

    return None
