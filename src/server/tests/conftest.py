import os
from subprocess import Popen
from time import sleep

import pytest
from backend import create_app
from tests.data.finalise_data import cmd_line_before
from tests.data.keyboard_data import keyboard_file_before


@pytest.fixture(scope="session")
def app():
    app = create_app(test=True)
    testing_client = app.test_client()
    ctx = app.app_context()
    ctx.push()
    yield testing_client
    ctx.pop()


@pytest.fixture(scope="session")
def socket_app():
    p = Popen(["python", "run.py", "--test-mode"])
    sleep(1)
    yield
    p.kill()


@pytest.fixture(scope="session")
def cleanup_files():
    yield
    cleanup_files = [
        "tests/mocked_system_folder/.silentBoot",
        "tests/mocked_system_folder/.licenceAgreed",
    ]

    for file in cleanup_files:
        if os.path.isfile(file):
            os.remove(file)


@pytest.fixture(scope="session")
def restore_files():
    yield
    file_data = [
        ("tests/mocked_system_folder/cmdline.txt", cmd_line_before),
        ("tests/mocked_system_folder/keyboard", keyboard_file_before),
        ("tests/mocked_system_folder/registration.txt", ""),
    ]

    for file_to_restore, original_data in file_data:
        if os.path.isfile(file_to_restore):
            with open(file_to_restore, "w") as f:
                f.write(original_data)


@pytest.fixture(scope="function")
def wifi_manager_module():
    import sys

    import backend.helpers.wifi_manager

    create_app(test=True)
    yield backend.helpers.wifi_manager

    del sys.modules["backend.helpers.wifi_manager"]


@pytest.fixture(scope="function")
def os_updater_module():
    import sys

    import backend.helpers.os_updater

    create_app(test=True)
    yield backend.helpers.os_updater

    del sys.modules["backend.helpers.os_updater"]
