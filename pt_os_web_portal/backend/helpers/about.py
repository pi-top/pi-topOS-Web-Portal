from pitop.common.common_names import DeviceName
from pitop.common.pt_os import get_pitopOS_info
from pitop.system import device_type

from .device import serial_number


def about_device():
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
