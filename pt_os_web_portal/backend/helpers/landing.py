import logging
from os import remove

from further_link.start_further import get_further_url
from pitop.common.command_runner import run_command, run_command_background
from pitop.common.current_session_info import get_user_using_display

logger = logging.getLogger(__name__)


def disable_landing():
    logger.info("Function: disable_landing()")
    try:
        remove("/etc/xdg/autostart/pt-os-landing.desktop")
    except FileNotFoundError:
        logger.debug("Landing already disabled.")


def disable_first_boot_app():
    logger.info("Function: disable_first_boot_app()")
    try:
        remove("/etc/xdg/autostart/pt-first-boot-app.desktop")
    except FileNotFoundError:
        logger.debug("First boot app already disabled.")

    # for backward compatibility:
    try:
        remove("/etc/xdg/autostart/pt-os-setup.desktop")
    except FileNotFoundError:
        logger.debug("pt-os-setup already disabled.")


def python_sdk_docs_url():
    logger.info("Function: python_sdk_docs_url()")
    return run_command("pi-top support links docs -p", timeout=10, check=False).strip()


def open_further():
    logger.info("Function: open_further()")
    run_command_background(get_chromium_command(get_further_url()))


def open_python_sdk_docs():
    logger.info("Function: open_python_sdk_docs()")
    run_command_background(get_chromium_command(python_sdk_docs_url()))


def open_knowledge_base():
    logger.info("Function: open_knowledge_base()")
    run_command_background(
        get_chromium_command("https://knowledgebase.pi-top.com/knowledge")
    )


def open_forum():
    logger.info("Function: open_forum()")
    run_command_background(get_chromium_command("https://forum.pi-top.com"))


def open_os_download():
    logger.info("Function: open_os_download()")
    run_command_background(
        get_chromium_command("https://www.pi-top.com/resources/download-os")
    )


def open_updater():
    logger.info("Function: open_updater()")
    run_command_background(
        get_webrenderer_command("http://127.0.0.1/updater", "pi-topOS Updater")
    )


def open_wifi():
    logger.info("Function: open_wifi()")
    run_command_background(
        get_webrenderer_command("http://127.0.0.1/wifi", "pi-topOS Wi-Fi")
    )


def get_webrenderer_command(url, title):
    return f"su {get_user_using_display(':0')} -c \"web-renderer --window-title=\\\"{title}\\\" {url}\""


def get_chromium_command(url):
    return f"su {get_user_using_display(':0')} -c \"chromium-browser --new-window --start-maximized {url}\""
