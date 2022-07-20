import functools
import logging
from enum import Enum
from subprocess import CalledProcessError

from pitop.common.command_runner import run_command

logger = logging.getLogger(__name__)


class PtWebVncDisplayId(Enum):
    WpaGui = 99
    Desktop = 0


def vnc_url(display_id: int) -> str:
    url = ""
    try:
        # 'run_command' raises when a vnc session isn't active
        url = run_command(
            f"/usr/bin/pt-web-vnc url --display-id {display_id}", check=True, timeout=10
        )
    except CalledProcessError:
        pass
    finally:
        return url.strip()


def vnc_clients(display_id: int) -> int:
    try:
        clients = run_command(
            f"/usr/bin/pt-web-vnc clients --display-id {display_id}",
            check=True,
            timeout=10,
            log_errors=False,
        ).strip()
        clients = int(clients)
    except Exception:
        clients = 0
    finally:
        return clients


vnc_wpa_gui_url = functools.partial(vnc_url, PtWebVncDisplayId.WpaGui.value)
vnc_desktop_url = functools.partial(vnc_url, PtWebVncDisplayId.Desktop.value)
vnc_wpa_gui_clients = functools.partial(vnc_clients, PtWebVncDisplayId.WpaGui.value)
vnc_desktop_clients = functools.partial(vnc_clients, PtWebVncDisplayId.Desktop.value)
