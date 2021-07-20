from json import load as jload
from re import match

from pitopcommon.common_names import DeviceName


def _get_file_lines(filename) -> list:
    lines = list()
    try:
        with open(filename) as fp:
            lines = fp.readlines()
    except Exception:
        pass
    return lines


def build_data() -> dict:
    headers = ("Build Number", "Build Date")
    data = {}
    for line in _get_file_lines("/etc/pt-issue"):
        try:
            title, value = line.strip().split(": ")
            if title in headers:
                data[title.replace(" ", "_").lower()] = value
        except Exception:
            continue
    return data


def device_update_channel() -> str:
    channels = {
        "sirius-experimental": {"name": "Experimental", "priority": 3},
        "sirius-unstable": {"name": "Unstable", "priority": 2},
        "sirius-testing": {"name": "Testing", "priority": 1},
        " sirius ": {"name": "Stable", "priority": 0},
    }

    def get_source_from_line(line):
        if match(
            "^deb (http[s]?://(www\\.)?)?apt\\.pi-top\\.com/pi-top-os/ sirius", line
        ):
            # Expecting similar to
            # `deb http://apt.pi-top.com/pi-top-os/ sirius main contrib non-free`
            for channel_text, channel_data in channels.items():
                if channel_text in line:
                    return channel_data

        return {}

    most_unstable_source = {}
    for line in _get_file_lines("/etc/apt/sources.list.d/pi-top.list"):
        source_data = get_source_from_line(line)
        if source_data and source_data.get("priority") >= most_unstable_source.get(
            "priority", 0
        ):
            most_unstable_source = source_data

    return most_unstable_source.get("name")


def device_serial_number():
    try:
        with open("/etc/pi-top/device_serial_numbers.json") as fp:
            return jload(fp).get("primary")
    except Exception:
        return ""


def device_data():
    from pitop.system.device import device_type

    data = build_data()
    data.update({"update_source": device_update_channel()})
    data.update({"device": device_type()})
    if data.get("device") == DeviceName.pi_top_4.value:
        data.update({"serial_number": device_serial_number()})
    return data
