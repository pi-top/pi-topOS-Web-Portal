from os import path
from shlex import split

from flask import json
from tests.data.finalise_data import (
    available_space,
    available_space_out,
    cmd_line_after,
    cmd_line_before,
)
from tests.utils import assert_file_content, dotdict


def test_available_space(app, mocker):
    environ_mock = mocker.patch("backend.helpers.command_runner.environ")
    environ_mock.copy = dict
    run_mock = mocker.patch(
        "backend.helpers.command_runner.run",
        return_value=dotdict(
            {"stdout": available_space_out, "stderr": b"", "returncode": 0}
        ),
    )

    response = app.get("/available-space")
    body = json.loads(response.data)

    run_mock.assert_called_once_with(
        split("df --block-size=1 --output=avail '/'"),
        capture_output=True,
        check=True,
        env={"DISPLAY": ":0"},
        timeout=2,
    )
    assert response.status_code == 200
    assert body == str(available_space)


def test_configure_landing_success(app, mocker):
    environ_mock = mocker.patch("backend.helpers.command_runner.environ")
    environ_mock.copy = dict
    run_mock = mocker.patch(
        "backend.helpers.command_runner.run",
        return_value=dotdict({"stdout": b"", "stderr": b"", "returncode": 0}),
    )

    response = app.post("/configure-landing")

    run_mock.assert_called_once_with(
        [
            "nice",
            "-n",
            "10",
            "ln",
            "-s",
            path.dirname(path.realpath(__file__))
            + "/../pt_os_web_portal/resources/pt-os-landing.desktop",
            "/etc/xdg/autostart",
        ],
        capture_output=True,
        check=True,
        env={"DISPLAY": ":0"},
        timeout=60,
    )
    assert response.status_code == 200
    assert response.data == b"OK"


def test_deprioritise_openbox_session_success(app, mocker):
    environ_mock = mocker.patch("backend.helpers.command_runner.environ")
    environ_mock.copy = dict
    run_mock = mocker.patch(
        "backend.helpers.command_runner.run",
        return_value=dotdict({"stdout": b"", "stderr": b"", "returncode": 0}),
    )

    response = app.post("/deprioritise-openbox-session")

    run_mock.assert_called_once_with(
        [
            "nice",
            "-n",
            "10",
            "update-alternatives",
            "--install",
            "/usr/bin/x-session-manager",
            "x-session-manager",
            "/usr/bin/openbox-session",
            "40",
        ],
        capture_output=True,
        check=True,
        env={"DISPLAY": ":0"},
        timeout=30,
    )
    assert response.status_code == 200
    assert response.data == b"OK"


def test_stop_onboarding_autostart_success(app, mocker):
    remove_mock = mocker.patch("backend.helpers.finalise.remove")
    response = app.post("/stop-onboarding-autostart")

    remove_mock.assert_called_once_with("/etc/xdg/autostart/pt-os-setup.desktop")
    assert response.status_code == 200
    assert response.data == b"OK"


def test_enable_os_updater_service_success(app, mocker):
    environ_mock = mocker.patch("backend.helpers.command_runner.environ")
    environ_mock.copy = dict
    run_mock = mocker.patch(
        "backend.helpers.command_runner.run",
        return_value=dotdict({"stdout": b"", "stderr": b"", "returncode": 0}),
    )

    response = app.post("/enable-os-updater-service")
    run_mock.assert_called_once_with(
        ["nice", "-n", "10", "systemctl", "enable", "pt-os-updater"],
        capture_output=True,
        check=True,
        env={"DISPLAY": ":0"},
        timeout=30,
    )
    assert response.status_code == 200
    assert response.data == b"OK"


def test_enable_firmware_updater_service_success(app, mocker):
    environ_mock = mocker.patch("backend.helpers.command_runner.environ")
    environ_mock.copy = dict
    run_mock = mocker.patch(
        "backend.helpers.command_runner.run",
        return_value=dotdict({"stdout": b"", "stderr": b"", "returncode": 0}),
    )

    response = app.post("/enable-firmware-updater-service")
    run_mock.assert_called_once_with(
        ["nice", "-n", "10", "systemctl", "enable", "pt-firmware-updater"],
        capture_output=True,
        check=True,
        env={"DISPLAY": ":0"},
        timeout=30,
    )
    assert response.status_code == 200
    assert response.data == b"OK"


def test_enable_further_link_service_success(app, mocker):
    environ_mock = mocker.patch("backend.helpers.command_runner.environ")
    environ_mock.copy = dict
    run_mock = mocker.patch(
        "backend.helpers.command_runner.run",
        return_value=dotdict({"stdout": b"", "stderr": b"", "returncode": 0}),
    )

    response = app.post("/enable-further-link-service")
    run_mock.assert_called_once_with(
        ["nice", "-n", "10", "systemctl", "enable", "further-link"],
        capture_output=True,
        check=True,
        env={"DISPLAY": ":0"},
        timeout=30,
    )
    assert response.status_code == 200
    assert response.data == b"OK"


def test_reboot_success(app, mocker):
    run_mock = mocker.patch(
        "backend.helpers.finalise.run_command_background", return_value=0
    )

    response = app.post("/reboot")
    run_mock.assert_called_once_with("reboot")
    assert response.status_code == 200
    assert response.data == b"OK"


def test_unhide_all_boot_messages_success(app, restore_files):
    assert_file_content("tests/mocked_system_folder/cmdline.txt", cmd_line_before)

    response = app.post("/unhide-all-boot-messages")
    assert response.status_code == 200
    assert response.data == b"OK"
    assert_file_content("tests/mocked_system_folder/cmdline.txt", cmd_line_after)