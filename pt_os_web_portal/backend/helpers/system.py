import logging

from pitop.common.command_runner import run_command

logger = logging.getLogger(__name__)


def restart_web_portal_service() -> None:
    logger.info("Function restart_web_portal_service()")
    try:
        run_command(
            "systemctl restart pt-os-web-portal.service", check=False, timeout=10
        )
    except Exception as e:
        logger.error(f"restart_web_portal_service(): {e}")
