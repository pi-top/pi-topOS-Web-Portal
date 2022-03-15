from dataclasses import dataclass

from pitop.common.common_names import DeviceName
from pitop.common.pt_os import get_pitopOS_info
from pitop.system import device_type

from .device import serial_number


@dataclass
class BuildInfo:
    build_repo: str = ""
    build_date: str = ""
    build_number: str = ""
    device: str = ""
    serial_number: str = ""

    def to_dict(self):
        response = {
            "build_repo": self.build_repo,
            "build_date": self.build_date,
            "build_number": self.build_number,
            "device": self.device,
        }
        if len(self.serial_number) > 0:
            response["serial_number"] = self.serial_number
        return response


def about_device():
    data = BuildInfo()
    try:
        build_info = get_pitopOS_info()
        data.build_repo = (build_info.build_type,)
        data.build_date = (build_info.build_date,)
        data.build_number = (build_info.build_run_number,)
        data.device = device_type()

        if data.device == DeviceName.pi_top_4.value:
            data.serial_number = serial_number()
    except Exception:
        pass

    return data.to_dict()
