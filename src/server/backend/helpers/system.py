from pitop.common.command_runner import run_command
from pitop.common.logger import PTLogger


def restart_web_portal_service() -> None:
    PTLogger.info("Function restart_web_portal_service()")
    try:
        run_command(
            "systemctl restart pt-os-web-portal.service", check=False, timeout=10
        )
    except Exception as e:
        PTLogger.error(f"restart_web_portal_service(): {e}")


def enable_ap_mode() -> None:
    PTLogger.info("Function enable_ap_mode()")
    try:
        run_command("wifi-ap-sta enable", check=False, timeout=20)
    except Exception as e:
        PTLogger.error(f"enable_ap_mode(): {e}")
