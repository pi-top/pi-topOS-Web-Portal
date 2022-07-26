import os
from subprocess import Popen
from sys import modules
from time import sleep
from unittest.mock import Mock

import pytest

from tests.data.keyboard_data import keyboard_file_before


def _patch_modules():
    modules_to_patch = [
        "further_link.start_further",
        "pitop",
        "pitop.battery",
        "pitop.common.command_runner",
        "pitop.common.common_ids",
        "pitop.common.common_names",
        "pitop.common.current_session_info",
        "pitop.common.firmware_device",
        "pitop.common.formatting",
        "pitop.common.notifications",
        "pitop.common.pt_os",
        "pitop.common.sys_info",
        "pitop.miniscreen.oled.assistant",
        "pitop.system",
        "pt_fw_updater.update",
        "pt_fw_updater.core.firmware_updater",
        "pt_web_vnc",
        "pt_web_vnc.vnc",
    ]
    for module in modules_to_patch:
        modules[module] = Mock()


@pytest.fixture(scope="session")
def patch_modules():
    _patch_modules()


@pytest.fixture(scope="session")
def app():
    _patch_modules()
    from pt_os_web_portal.backend import create_app

    app = create_app(test_mode=True, os_updater=None)
    testing_client = app.test_client()
    ctx = app.app_context()
    ctx.push()
    yield testing_client
    ctx.pop()


@pytest.fixture(scope="session")
def socket_app():
    p = Popen(["python", "__main__.py", "--test-mode"])
    sleep(1)
    yield
    p.kill()


@pytest.fixture(scope="function")
def cleanup_files():
    yield
    cleanup_files = [
        "tests/mocked_system_folder/.silentBoot",
        "tests/mocked_system_folder/.licenceAgreed",
    ]

    for file in cleanup_files:
        if os.path.isfile(file):
            os.remove(file)


@pytest.fixture(scope="function")
def restore_files():
    yield
    file_data = [
        ("tests/mocked_system_folder/keyboard", keyboard_file_before),
    ]

    for file_to_restore, original_data in file_data:
        if os.path.isfile(file_to_restore):
            with open(file_to_restore, "w") as f:
                f.write(original_data)


@pytest.fixture(scope="function")
def wifi_manager_module():
    import pt_os_web_portal.backend.helpers.wifi_manager
    from pt_os_web_portal.backend import create_app

    create_app(test_mode=True, os_updater=None)
    yield pt_os_web_portal.backend.helpers.wifi_manager

    if "pt_os_web_portal.backend.helpers.wifi_manager" in modules:
        del modules["pt_os_web_portal.backend.helpers.wifi_manager"]
    del pt_os_web_portal.backend.helpers.wifi_manager
