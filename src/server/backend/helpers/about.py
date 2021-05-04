from json import load as jload
from pitop.system.device import device_type


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
        if line.startswith("deb") and "apt.pi-top.com" in line:
            for channel_text, channel_data in channels.items():
                if channel_text in line:
                    return channel_data
        return {}
    most_unstable_source = {}
    for line in _get_file_lines("/etc/apt/sources.list.d/pi-top.list"):
        source_data = get_source_from_line(line)
        if source_data and source_data.get("priority") >= most_unstable_source.get("priority", 0):
            most_unstable_source = source_data
    return most_unstable_source.get("name")


def device_serial_number():
    try:
        with open("/etc/pi-top/device_serial_numbers.json") as fp:
            return jload(fp).get("primary")
    except Exception:
        return ""


def device_data():
    data = build_data()
    data.update({
        "device": device_type(),
        "serial_number": device_serial_number(),
        "update_source": device_update_channel(),
    })
    return data
