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
    build_info = get_pitopOS_info()
    data = {
        "build_repo": build_info.build_type,
        "build_date": build_info.date,
        "build_number": build_info.build_run_number,
        "build_commit": build_info.commit,
    }
    data.update({"device": device_type()})
    if data.get("device") == DeviceName.pi_top_4.value:
        data.update({"serial_number": device_serial_number()})
    return data
