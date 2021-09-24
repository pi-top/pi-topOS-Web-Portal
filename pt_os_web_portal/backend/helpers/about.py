import json
import os

from pitop.common.common_names import DeviceName
from pitop.common.logger import PTLogger
from pitop.common.pt_os import get_pitopOS_info

DEVICE_SERIALS_FILE = "/etc/pi-top/device_serial_numbers.json"
DEVICE_INFO_FILE = "/run/pt_device_type"
OS_INFO_FILE = "/etc/pt-issue"


def serial_number():

    if os.path.exists(DEVICE_SERIALS_FILE):
        with open(DEVICE_SERIALS_FILE, "r") as f:
            PTLogger.debug("Reading device serial number from file")
            serial_numbers_json = json.load(f)

            def field_is_in_json(json, fieldToFind):
                keyExists = fieldToFind in json
                valueExists = json.get(fieldToFind) is not None
                return keyExists and valueExists

            if field_is_in_json(serial_numbers_json, "primary"):
                serial_number = str(serial_numbers_json["primary"])
                serial_number = serial_number.strip()
                PTLogger.debug("Successfully read serial number")
                return serial_number
            else:
                PTLogger.debug("primary serial number could not be read from file")
    else:
        PTLogger.debug("Device serial number not found")

    return "unknown"


def device_type():

    if os.path.exists(DEVICE_INFO_FILE):
        with open(DEVICE_INFO_FILE, "r") as f:
            device_type = f.readline()
            device_type = device_type.strip()
            PTLogger.debug("Successfully read device type")
            return device_type

    return ""


def os_version():

    os_name = ""
    os_build_number = ""
    update_repo = ""

    if os.path.exists(OS_INFO_FILE):
        with open(OS_INFO_FILE, "r") as f:
            for line in f:
                if "Build Name:" in line:
                    parts = line.split(": ")
                    if len(parts) > 1:
                        os_name = parts[1].strip()
                elif "Build Number:" in line:
                    parts = line.split(": ")
                    if len(parts) > 1:
                        os_build_number = parts[1].strip()
                elif "Final Apt Repo:" in line:
                    parts = line.split(": ")
                    if len(parts) > 1:
                        update_repo = parts[1].strip()

    if os_name != "":
        PTLogger.debug("Successfully read OS name")

    if os_build_number != "":
        PTLogger.debug("Successfully read OS build number")

    if update_repo != "":
        PTLogger.debug("Successfully read OS update repo")

    return os_name, os_build_number, update_repo


def device_data():
    build_info = get_pitopOS_info()
    data = {
        "build_repo": build_info.build_type,
        "build_date": build_info.build_date,
        "build_number": build_info.build_run_number,
    }
    data.update({"device": device_type()})
    if data.get("device") == DeviceName.pi_top_4.value:
        data.update({"serial_number": serial_number()})
    return data
