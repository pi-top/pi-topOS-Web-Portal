from time import sleep

from pitop.common.command_runner import run_command
from pitop.common.logger import PTLogger
from pitop.common.sys_info import is_connected_to_internet


def sync_clock() -> None:
    PTLogger.info("Syncing date and time")
    PTLogger.info("Restarting systemd-timesyncd service")
    try:
        run_command(
            "systemctl restart systemd-timesyncd.service", check=False, timeout=2
        )
    except Exception as e:
        PTLogger.error(f"sync_clock(): {e}")


def is_system_clock_synchronized() -> bool:
    response = run_command(
        "bash -c timedatectl | grep 'System clock synchronized'",
        capture_output=True,
        check=False,
        timeout=1,
    ).strip()
    return "yes" in response


def wait_until_clock_is_synchronized() -> None:
    PTLogger.info("Waiting up to 15 seconds to synchronize system clock")
    check_sync_attempts = 75
    while check_sync_attempts:
        if is_system_clock_synchronized():
            PTLogger.info("Clock is synchronized")
            break
        PTLogger.info("Clock not synchronized. Sleeping for 0.2 seconds")
        sleep(0.2)
        check_sync_attempts = check_sync_attempts - 1


def synchronize_system_clock() -> None:
    PTLogger.info("Checking for internet connection for up to 15 seconds")
    attempts = 75
    while not is_connected_to_internet() and attempts > 0:
        PTLogger.info("Not connected to internet... sleeping for 0.2 seconds")
        sleep(0.2)
        attempts = attempts - 1

    if not is_system_clock_synchronized():
        sync_clock()
        wait_until_clock_is_synchronized()

    PTLogger.info(
        f"System clock is{'' if is_system_clock_synchronized() else 'not'} synchronized"
    )
