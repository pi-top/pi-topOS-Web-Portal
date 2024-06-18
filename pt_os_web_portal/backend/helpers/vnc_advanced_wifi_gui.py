import logging

import click
from pitop.common.command_runner import run_command
from pitop.common.formatting import is_url
from pt_web_vnc import clients, connection_details, start, stop

from pt_os_web_portal.backend.helpers.vnc import PtWebVncDisplayId

logger = logging.getLogger(__name__)


def stop_advanced_wifi_gui():
    connected_clients = clients(PtWebVncDisplayId.AdvancedWifiGui.value)
    should_stop_service = connected_clients == 0

    logger.info(
        f"{'' if should_stop_service else 'Not'} stopping advanced wifi GUI, it has {clients} connected clients."
    )
    if should_stop_service:
        stop(display_id=PtWebVncDisplayId.AdvancedWifiGui.value)


def start_advanced_wifi_gui():
    connection_details = _advanced_wifi_gui_vnc_details()
    if connection_details and is_url(connection_details.url):
        logging.info("Advanced wifi GUI is already running, skipping start...")
        return

    # Determine which advanced wifi connection app to run
    cmd = "systemctl is-active dhcpcd"
    if run_command(cmd, check=False, timeout=5).strip() == "active":
        app = "wpa_gui"
    else:
        app = "nm-connection-editor"

    # Start pt-web-vnc
    logging.info(f"Starting advanced wifi GUI with '{app}'")
    start(
        display_id=PtWebVncDisplayId.AdvancedWifiGui.value,
        height=800,
        width=1000,
        background_colour="white",
        run=app,
        with_window_manager=True,
    )


def _advanced_wifi_gui_vnc_details():
    try:
        details = connection_details(PtWebVncDisplayId.AdvancedWifiGui.value)
    except Exception:
        details = None
    return details


def get_advanced_wifi_gui_url(host_url: str):
    url = ""
    try:
        details = _advanced_wifi_gui_vnc_details()
        if is_url(details.url):
            url = f"{details.scheme}://{host_url}:{details.port}{details.path}"
    except Exception:
        pass
    return url


@click.command()
@click.argument("command", type=click.Choice(["start", "stop"]))
def main(command):
    if command == "start":
        start_advanced_wifi_gui()
    elif command == "stop":
        stop_advanced_wifi_gui()


if __name__ == "__main__":
    main(prog_name="pt-os-web-portal-vnc-advanced-wifi")  # pragma: no cover
