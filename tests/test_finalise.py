from enum import Enum
from unittest.mock import call

from flask import json

from tests.data.finalise_data import available_space, available_space_out


class DeviceNameMock(Enum):
    pi_top_4 = "pi-top [4]"


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
    remove_mock = mocker.patch("pt_os_web_portal.backend.helpers.landing.remove")
    response = app.post("/stop-onboarding-autostart")

    remove_mock.assert_has_calls(
        [
            call("/etc/xdg/autostart/pt-first-boot-app.desktop"),
            call("/etc/xdg/autostart/pt-os-setup.desktop"),
        ]
    )
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


def test_enable_pt_miniscreen_service_success(app, mocker):
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.finalise.run_command", return_value=""
    )

    response = app.post("/enable-pt-miniscreen")
    run_mock.assert_called_once_with(
        "systemctl enable pt-miniscreen",
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


def test_restore_files(app, mocker):
    run_mock = mocker.patch("pt_os_web_portal.backend.helpers.finalise.run_command")

    response = app.post("/restore-files")
    assert response.status_code == 200
    assert response.data == b"OK"
    run_mock.assert_any_call(
        "rm -r /usr/lib/pt-os-web-portal/bak", timeout=30, lower_priority=True
    )
    run_mock.assert_any_call(
        "rsync -av /usr/lib/pt-os-web-portal/bak/ /",
        timeout=30,
        lower_priority=True,
    )


def test_update_hub_firmware_is_skipped_if_not_pitop_4(app, mocker):
    mocker.patch(
        "pt_os_web_portal.backend.helpers.finalise.device_type",
        return_value="pi-top-ceed",
    )
    mocker.patch(
        "pt_os_web_portal.backend.helpers.finalise.DeviceName",
        side_effect=lambda: DeviceNameMock,
    )
    update_fw_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.finalise.update_firmware"
    )

    response = app.post("/update-hub-firmware")
    assert response.status_code == 200
    assert response.data == b"OK"
    update_fw_mock.assert_not_called()


def test_update_hub_firmware_if_device_is_pitop_4(app, mocker):
    mocker.patch(
        "pt_os_web_portal.backend.helpers.finalise.DeviceName.pi_top_4.value",
        DeviceNameMock.pi_top_4.value,
    )
    mocker.patch(
        "pt_os_web_portal.backend.helpers.finalise.device_type",
        side_effect=lambda: DeviceNameMock.pi_top_4.value,
    )
    update_fw_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.finalise.update_firmware", return_value=""
    )

    response = app.post("/update-hub-firmware")
    assert response.status_code == 200
    assert response.data == b"OK"

    update_fw_mock.assert_called_once_with("pt4_hub", force=False, notify_user=False)


def test_hupdate_hub_fw_response_on_failure(app, mocker):
    mocker.patch(
        "pt_os_web_portal.backend.helpers.finalise.DeviceName.pi_top_4.value",
        DeviceNameMock.pi_top_4.value,
    )
    mocker.patch(
        "pt_os_web_portal.backend.helpers.finalise.device_type",
        side_effect=lambda: DeviceNameMock.pi_top_4.value,
    )

    class PTInvalidFirmwareFile(Exception):
        pass

    mocker.patch(
        "pt_os_web_portal.backend.helpers.finalise.PTInvalidFirmwareFile",
        PTInvalidFirmwareFile,
    )

    response = app.post("/update-hub-firmware")
    assert response.status_code == 200
    assert response.data == b"OK"


def test_update_eeprom_command(app, mocker):
    run_mock = mocker.patch("pt_os_web_portal.backend.helpers.finalise.run_command")

    response = app.post("/update-eeprom")
    assert response.status_code == 200
    assert response.data == b"OK"
    run_mock.assert_called_once_with(
        "/usr/lib/pt-os-notify-services/pt-eeprom -f", timeout=10, check=False
    )


def test_update_eeprom_response_on_failure(app, mocker):
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.finalise.run_command",
        side_effect=Exception("Couldn't update EEPROM"),
    )

    response = app.post("/update-eeprom")
    assert response.status_code == 200
    assert response.data == b"OK"
    run_mock.assert_called_once_with(
        "/usr/lib/pt-os-notify-services/pt-eeprom -f", timeout=10, check=False
    )


def test_disable_ap_command(app, mocker):
    run_mock = mocker.patch("pt_os_web_portal.backend.helpers.finalise.run_command")

    response = app.post("/disable-ap-mode")
    assert response.status_code == 200
    assert response.data == b"OK"
    run_mock.assert_called_once_with(
        "/usr/bin/wifi-ap-sta disable", check=False, timeout=20
    )


def test_disable_ap_response_on_failure(app, mocker):
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.finalise.run_command",
        side_effect=Exception("Couldn't disable AP mode"),
    )

    response = app.post("/disable-ap-mode")
    assert response.status_code == 200
    assert response.data == b"OK"
    run_mock.assert_called_once_with(
        "/usr/bin/wifi-ap-sta disable", check=False, timeout=20
    )
