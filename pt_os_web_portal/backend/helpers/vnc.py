import logging

from pitop.common.command_runner import run_command

logger = logging.getLogger(__name__)


def vnc_wpa_gui_url():
    url = run_command("/usr/bin/web-vnc url --display_id 0", timeout=10)
    return url.strip()
