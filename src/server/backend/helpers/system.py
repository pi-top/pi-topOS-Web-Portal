from pitopcommon.command_runner import run_command
from pitopcommon.logger import PTLogger


def restart_web_portal_service() -> None:
    PTLogger.info("Function restart_web_portal_service()")
    try:
        run_command("systemctl restart pt-web-portal.service", check=False, timeout=10)
    except Exception as e:
        PTLogger.error(f"restart_web_portal_service(): {e}")
