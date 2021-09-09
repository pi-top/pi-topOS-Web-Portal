from pitop.common.command_runner import run_command
from pitop.common.logger import PTLogger

from .paths import use_test_path, zone_tab


def get_all_timezones() -> list:
    PTLogger.info("Function: get_all_timezones()")
    with open(zone_tab()) as file:
        timezone_rows = [
            line.rstrip().split() for line in file if not line.startswith("#")
        ]

        timezones = list()
        for timezone_row in timezone_rows:
            timezones.append(
                {"countryCode": timezone_row[0], "timezone": timezone_row[2]}
            )

        if not use_test_path():
            command = "timedatectl list-timezones"
            available_timezones = run_command(command, timeout=2).split("\n")
            timezones = [t for t in timezones if t["timezone"] in available_timezones]

        return timezones


def get_current_timezone() -> str:
    PTLogger.info("Function: get_current_timezone()")
    tz_string = ""

    if use_test_path():
        return "Europe/London"

    for line in run_command("timedatectl", timeout=2).split("\n"):
        if "Time zone:" in line:
            tz_string = line.split(":")[1].split("(")[0].strip()
            break

    PTLogger.info("Current timezone: '%s'" % tz_string)
    return tz_string


def set_timezone(tz_string):
    PTLogger.info("Function: set_timezone(tz_string='%s')" % tz_string)

    timezones = get_all_timezones()
    if not any(tz_string == timezone["timezone"] for timezone in timezones):
        PTLogger.error("Unable to set timezone - Not available: %s" % tz_string)
        return None

    command = "raspi-config nonint do_change_timezone %s" % tz_string
    return run_command(command, timeout=5)
