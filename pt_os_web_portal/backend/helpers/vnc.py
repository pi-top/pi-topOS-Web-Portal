import logging
from subprocess import CalledProcessError

from pitop.common.command_runner import run_command

logger = logging.getLogger(__name__)


def vnc_wpa_gui_url():
    url = ""
    try:
        # Raises when a vnc session isn't active
        url = run_command(
            "/usr/bin/pt-web-vnc url --display_id 99", check=True, timeout=10
        )
    except CalledProcessError:
        pass
    finally:
        return url.strip()
