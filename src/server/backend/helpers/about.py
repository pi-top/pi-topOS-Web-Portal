from json import load as jload

from pitop.common.common_names import DeviceName
from pitop.common.pt_os import get_pitopOS_info
from pitop.system.device import device_type


def device_serial_number():
    try:
        with open("/etc/pi-top/device_serial_numbers.json") as fp:
            return jload(fp).get("primary")
    except Exception:
        return ""


def device_data():
    data = get_pitopOS_info()
    data.update({"device": device_type()})
    if data.get("device") == DeviceName.pi_top_4.value:
        data.update({"serial_number": device_serial_number()})
    return data
