from os import remove
from pathlib import Path

from pitopcommon.command_runner import run_command_background
from pitopcommon.current_session_info import get_user_using_display
from pitopcommon.logger import PTLogger

from .about import device_serial_number
from .command_runner import run_command


def disable_tour():
    PTLogger.info("Function: disable_tour()")
    try:
        remove("/etc/xdg/autostart/pt-tour.desktop")
    except FileNotFoundError:
        PTLogger.debug("Tour already disabled.")


def close_pt_browser():
    PTLogger.info("Function: close_pt_browser()")
    pids = run_command("pgrep web-renderer", timeout=5, check=False).split()
    for pid in pids:
        try:
            run_command(f"kill -9 {pid}", timeout=5)
        except Exception as e:
            PTLogger.error(f"Error killing PID {pid}: {e}")


def python_sdk_docs_url():
    PTLogger.info("Function: python_sdk_docs_url()")
    return run_command("pi-top support links docs -p", timeout=10, check=False).strip()


def onboarding_completed():
    PTLogger.info("Function: onboarding_completed()")
    try:
        return not Path("/etc/xdg/autostart/pt-os-setup.desktop").exists()
    except Exception:
        return False


def further_url():
    PTLogger.info("Function: get_further_url()")

    def get_serial_number_string():
        try:
            serial_number = device_serial_number()
            return f"serial_number={serial_number}" if serial_number != "" else ""
        except Exception:
            return ""

    def get_device_id_string():
        try:
            device_str = str(run_command("cat /etc/pi-top/pt-device-manager/device_version", 1000)).strip()
            return f"device={device_str}" if device_str != "" else ""
        except Exception:
            return ""

    def further_url_query_string():
        query_string = ""
        serial_string = get_serial_number_string()
        device_string = get_device_id_string()
        if serial_string != "":
            query_string += f"?{serial_string}"
        if device_string != "":
            separator = "?" if serial_string == "" else "&"
            query_string += f"{separator}{device_string}"
        return query_string

    base_further_url = "https://further.pi-top.com/start"
    return base_further_url + further_url_query_string()


def open_further():
    PTLogger.info("Function: open_further()")
    run_command_background(get_chromium_command(further_url()))


def open_python_sdk_docs():
    PTLogger.info("Function: open_python_sdk_docs()")
    run_command_background(get_chromium_command(python_sdk_docs_url()))


def open_knowledge_base():
    PTLogger.info("Function: open_knowledge_base()")
    run_command_background(get_chromium_command("https://knowledgebase.pi-top.com"))


def open_forum():
    PTLogger.info("Function: open_forum()")
    run_command_background(get_chromium_command("https://forum.pi-top.com"))


def get_chromium_command(url):
    return f"su {get_user_using_display(':0')} -c \"chromium-browser --new-window --start-maximized {url}\""
