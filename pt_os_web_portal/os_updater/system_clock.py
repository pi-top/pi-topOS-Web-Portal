import logging
from time import sleep

from pitop.common.command_runner import run_command
from pitop.common.sys_info import is_connected_to_internet

logger = logging.getLogger(__name__)


def sync_clock() -> None:
    logger.info("Syncing date and time")
    logger.info("Restarting systemd-timesyncd service")
    try:
        run_command(
            "systemctl restart systemd-timesyncd.service", check=False, timeout=2
        )
    except Exception as e:
        logger.error(f"sync_clock(): {e}")


def is_system_clock_synchronized() -> bool:
    response = run_command(
        "bash -c timedatectl | grep 'System clock synchronized'",
        capture_output=True,
        check=False,
        timeout=1,
    ).strip()
    return "yes" in response


def wait_until_clock_is_synchronized() -> None:
    logger.info("Waiting up to 15 seconds to synchronize system clock")
    check_sync_attempts = 75
    while check_sync_attempts:
        if is_system_clock_synchronized():
            logger.info("Clock is synchronized")
            break
        logger.info("Clock not synchronized. Sleeping for 0.2 seconds")
        sleep(0.2)
        check_sync_attempts = check_sync_attempts - 1


def synchronize_system_clock() -> None:
    logger.info("Checking for internet connection for up to 15 seconds")
    attempts = 75
    while not is_connected_to_internet() and attempts > 0:
        logger.info("Not connected to internet... sleeping for 0.2 seconds")
        sleep(0.2)
        attempts = attempts - 1

    if not is_system_clock_synchronized():
        sync_clock()
        wait_until_clock_is_synchronized()

    logger.info(
        f"System clock is{'' if is_system_clock_synchronized() else 'not'} synchronized"
    )
