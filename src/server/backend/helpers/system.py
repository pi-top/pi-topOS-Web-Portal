from pitopcommon.command_runner import run_command_background
from pitopcommon.logger import PTLogger


def restart_web_portal_service() -> None:
    PTLogger.info("Function restart_web_portal_service()")
    try:
        run_command_background("systemctl restart pt-web-portal.service")
    except Exception as e:
        PTLogger.error(f"restart_web_portal_service(): {e}")
