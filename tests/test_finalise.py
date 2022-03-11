from os import path

from flask import json

from tests.data.finalise_data import available_space, available_space_out


def test_available_space(app, mocker):
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.finalise.run_command",
        return_value=available_space_out,
    )

    response = app.get("/available-space")
    body = json.loads(response.data)

    run_mock.assert_called_once_with(
        "df --block-size=1 --output=avail '/'",
        timeout=2,
    )
    assert response.status_code == 200
    assert body == str(available_space)


def test_configure_landing_success(app, mocker):
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.finalise.run_command", return_value=""
    )

    response = app.post("/configure-landing")
    desktop_file_path = path.abspath(
        path.dirname(path.realpath(__file__))
        + "/../pt_os_web_portal/resources/pt-os-landing.desktop"
    )
    run_mock.assert_called_once_with(
        f"ln -s {desktop_file_path} /etc/xdg/autostart",
        timeout=60,
        lower_priority=True,
    )
    assert response.status_code == 200
    assert response.data == b"OK"


def test_deprioritise_openbox_session_success(app, mocker):
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.finalise.run_command", return_value=""
    )

    response = app.post("/deprioritise-openbox-session")

    run_mock.assert_called_once_with(
        "update-alternatives --install /usr/bin/x-session-manager x-session-manager /usr/bin/openbox-session 40",
        lower_priority=True,
        timeout=30,
    )
    assert response.status_code == 200
    assert response.data == b"OK"


def test_stop_onboarding_autostart_success(app, mocker):
    remove_mock = mocker.patch("pt_os_web_portal.backend.helpers.finalise.remove")
    response = app.post("/stop-onboarding-autostart")

    remove_mock.assert_called_once_with("/etc/xdg/autostart/pt-os-setup.desktop")
    assert response.status_code == 200
    assert response.data == b"OK"


def test_enable_firmware_updater_service_success(app, mocker):
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.finalise.run_command", return_value=""
    )

    response = app.post("/enable-firmware-updater-service")
    run_mock.assert_called_once_with(
        "systemctl enable pt-firmware-updater",
        lower_priority=True,
        timeout=30,
    )
    assert response.status_code == 200
    assert response.data == b"OK"


def test_enable_further_link_service_success(app, mocker):
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.finalise.run_command", return_value=""
    )

    response = app.post("/enable-further-link-service")
    run_mock.assert_called_once_with(
        "systemctl enable further-link",
        lower_priority=True,
        timeout=30,
    )
    assert response.status_code == 200
    assert response.data == b"OK"


def test_reboot_success(app, mocker):
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.finalise.run_command_background",
        return_value=0,
    )

    response = app.post("/reboot")
    run_mock.assert_called_once_with("reboot")
    assert response.status_code == 200
    assert response.data == b"OK"
