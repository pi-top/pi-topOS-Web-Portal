from os import remove

from further_link.start_further import get_further_url
from pitop.common.command_runner import run_command, run_command_background
from pitop.common.current_session_info import get_user_using_display
from pitop.common.logger import PTLogger


def disable_landing():
    PTLogger.info("Function: disable_landing()")
    try:
        remove("/etc/xdg/autostart/pt-os-landing.desktop")
    except FileNotFoundError:
        PTLogger.debug("Landing already disabled.")


def python_sdk_docs_url():
    PTLogger.info("Function: python_sdk_docs_url()")
    return run_command("pi-top support links docs -p", timeout=10, check=False).strip()


def open_further():
    PTLogger.info("Function: open_further()")
    run_command_background(get_chromium_command(get_further_url()))


def open_python_sdk_docs():
    PTLogger.info("Function: open_python_sdk_docs()")
    run_command_background(get_chromium_command(python_sdk_docs_url()))


def open_knowledge_base():
    PTLogger.info("Function: open_knowledge_base()")
    run_command_background(get_chromium_command("https://knowledgebase.pi-top.com"))


def open_forum():
    PTLogger.info("Function: open_forum()")
    run_command_background(get_chromium_command("https://forum.pi-top.com"))


def get_chromium_command(url):
    return f"su {get_user_using_display(':0')} -c \"chromium-browser --new-window --start-maximized {url}\""
