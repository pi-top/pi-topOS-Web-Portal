import functools
import logging
from enum import Enum
from typing import Optional

from pitop.common.command_runner import run_command

logger = logging.getLogger(__name__)


class SystemService(Enum):
    WebPortal = "pt-os-web-portal"
    RoverController = "pt-os-web-portal-rover-controller"


def systemctl(command: str, name: SystemService, timeout=10) -> Optional[str]:
    logger.info(f"Function systemctl(command={command}, name={name})")
    try:
        output = run_command(
            f"systemctl {command} {name.value}.service",
            timeout=timeout,
            check=False,
        )
        return output.strip(" \n")
    except Exception as e:
        logger.error(f"systemctl(command={command}, name={name}): {e}")
        return None


# commands
service_restart = functools.partial(systemctl, "restart")
service_start = functools.partial(systemctl, "start")
service_stop = functools.partial(systemctl, "stop")
service_enable = functools.partial(systemctl, "enable")
service_disable = functools.partial(systemctl, "disable")
service_status = functools.partial(systemctl, "status")
service_is_active = functools.partial(systemctl, "is-active")
