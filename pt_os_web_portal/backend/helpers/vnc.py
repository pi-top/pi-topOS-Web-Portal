import logging
from subprocess import CalledProcessError

from pitop.common.command_runner import run_command

logger = logging.getLogger(__name__)


def vnc_wpa_gui_url() -> str:
    url = ""
    try:
        # 'run_command' raises when a vnc session isn't active
        url = run_command(
            "/usr/bin/pt-web-vnc url --display-id 99", check=True, timeout=10
        )
    except CalledProcessError:
        pass
    finally:
        return url.strip()


def vnc_wpa_gui_clients() -> int:
    try:
        clients = run_command(
            "/usr/bin/pt-web-vnc clients --display-id 99",
            check=True,
            timeout=10,
            log_errors=False,
        ).strip()
        clients = int(clients)
    except Exception:
        clients = 0
    finally:
        return clients
