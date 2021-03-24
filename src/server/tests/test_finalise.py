import os
from flask import json
from shlex import split

from tests.utils import dotdict, assert_file_content
from helpers.finalise import startup_noise_breadcrumb, eula_agreed_breadcrumb
from tests.data.finalise_data import cmd_line_before, cmd_line_after, available_space_out, available_space


def test_available_space(app, mocker):
    environ_mock = mocker.patch('onboarding.helpers.command_runner.environ')
    environ_mock.copy = dict
    run_mock = mocker.patch('onboarding.helpers.command_runner.run',
                            return_value=dotdict({'stdout': available_space_out, 'stderr': b'', 'returncode': 0}))

    response = app.get('/available-space')
    body = json.loads(response.data)

    run_mock.assert_called_once_with(
        split("df --block-size=1 --output=avail '/'"),
        capture_output=True, check=True, env={'DISPLAY': ':0'}, timeout=2)
    assert response.status_code == 200
    assert body == str(available_space)


def test_expand_fs_success(app, mocker):
    environ_mock = mocker.patch('onboarding.helpers.command_runner.environ')
    environ_mock.copy = dict
    run_mock = mocker.patch('onboarding.helpers.command_runner.run',
                            return_value=dotdict({'stdout': b'', 'stderr': b'', 'returncode': 0}))

    response = app.post('/expand-fs')

    run_mock.assert_any_call(['nice', '-n', '10', '/usr/lib/pt-web-portal/expand-fs.sh'],
                             capture_output=True, check=True, env={'DISPLAY': ':0'}, timeout=120)
    assert response.status_code == 200
    assert response.data == b'OK'


def test_configure_tour_success(app, mocker):
    environ_mock = mocker.patch('onboarding.helpers.command_runner.environ')
    environ_mock.copy = dict
    run_mock = mocker.patch('onboarding.helpers.command_runner.run',
                            return_value=dotdict({'stdout': b'', 'stderr': b'', 'returncode': 0}))

    response = app.post('/configure-tour')

    run_mock.assert_called_once_with(
        ['nice', '-n', '10', 'ln', '-s',
            '/usr/lib/pt-tour/pt-tour.desktop', '/etc/xdg/autostart'],
        capture_output=True, check=True, env={'DISPLAY': ':0'}, timeout=60)
    assert response.status_code == 200
    assert response.data == b'OK'


def test_update_mime_db_success(app, mocker):
    environ_mock = mocker.patch('onboarding.helpers.command_runner.environ')
    environ_mock.copy = dict
    run_mock = mocker.patch('onboarding.helpers.command_runner.run',
                            return_value=dotdict({'stdout': b'', 'stderr': b'', 'returncode': 0}))

    response = app.post('/update-mime-database')

    run_mock.assert_called_once_with(['nice', '-n', '10', 'update-mime-database', '/usr/share/mime'],
                                     capture_output=True, check=True, env={'DISPLAY': ':0'}, timeout=90)
    assert response.status_code == 200
    assert response.data == b'OK'


def test_deprioritise_openbox_session_success(app, mocker):
    environ_mock = mocker.patch('onboarding.helpers.command_runner.environ')
    environ_mock.copy = dict
    run_mock = mocker.patch('onboarding.helpers.command_runner.run',
                            return_value=dotdict({'stdout': b'', 'stderr': b'', 'returncode': 0}))

    response = app.post('/deprioritise-openbox-session')

    run_mock.assert_called_once_with(
        ['nice', '-n', '10', 'update-alternatives', '--install', '/usr/bin/x-session-manager',
            'x-session-manager', '/usr/bin/openbox-session', '40'],
        capture_output=True, check=True, env={'DISPLAY': ':0'}, timeout=30)
    assert response.status_code == 200
    assert response.data == b'OK'


def test_stop_onboarding_autostart_success(app, mocker):
    remove_mock = mocker.patch('onboarding.helpers.finalise.remove')

    response = app.post('/stop-onboarding-autostart')

    remove_mock.assert_called_once_with(
        '/etc/xdg/autostart/pt-web-portal.desktop')
    assert response.status_code == 200
    assert response.data == b'OK'


def test_enable_device_registration_service_success(app, mocker):
    environ_mock = mocker.patch('onboarding.helpers.command_runner.environ')
    environ_mock.copy = dict
    run_mock = mocker.patch('onboarding.helpers.command_runner.run',
                            return_value=dotdict({'stdout': b'', 'stderr': b'', 'returncode': 0}))

    response = app.post('/enable-device-registration-service')
    run_mock.assert_called_once_with(['nice', '-n', '10', 'systemctl', 'enable', 'pt-device-registration'],
                                     capture_output=True, check=True, env={'DISPLAY': ':0'}, timeout=30)
    assert response.status_code == 200
    assert response.data == b'OK'


def test_enable_os_updater_service_success(app, mocker):
    environ_mock = mocker.patch('onboarding.helpers.command_runner.environ')
    environ_mock.copy = dict
    run_mock = mocker.patch('onboarding.helpers.command_runner.run',
                            return_value=dotdict({'stdout': b'', 'stderr': b'', 'returncode': 0}))

    response = app.post('/enable-os-updater-service')
    run_mock.assert_called_once_with(['nice', '-n', '10', 'systemctl', 'enable', 'pt-os-updater'],
                                     capture_output=True, check=True, env={'DISPLAY': ':0'}, timeout=30)
    assert response.status_code == 200
    assert response.data == b'OK'


def test_enable_firmware_updater_service_success(app, mocker):
    environ_mock = mocker.patch('onboarding.helpers.command_runner.environ')
    environ_mock.copy = dict
    run_mock = mocker.patch('onboarding.helpers.command_runner.run',
                            return_value=dotdict({'stdout': b'', 'stderr': b'', 'returncode': 0}))

    response = app.post('/enable-firmware-updater-service')
    run_mock.assert_called_once_with(['nice', '-n', '10', 'systemctl', 'enable', 'pt-firmware-updater'],
                                     capture_output=True, check=True, env={'DISPLAY': ':0'}, timeout=30)
    assert response.status_code == 200
    assert response.data == b'OK'


def test_enable_further_link_service_success(app, mocker):
    environ_mock = mocker.patch('onboarding.helpers.command_runner.environ')
    environ_mock.copy = dict
    run_mock = mocker.patch('onboarding.helpers.command_runner.run',
                            return_value=dotdict({'stdout': b'', 'stderr': b'', 'returncode': 0}))

    response = app.post('/enable-further-link-service')
    run_mock.assert_called_once_with(['nice', '-n', '10', 'systemctl', 'enable', 'pt-further-link'],
                                     capture_output=True, check=True, env={'DISPLAY': ':0'}, timeout=30)
    assert response.status_code == 200
    assert response.data == b'OK'


def test_disable_startup_noise_success(app, cleanup_files):
    response = app.post('/disable-startup-noise')

    assert os.path.isfile(startup_noise_breadcrumb()) is True
    assert response.status_code == 200
    assert response.data == b'OK'


def test_mark_eula_agreed_success(app):
    response = app.post('/mark-eula-agreed')

    assert os.path.isfile(eula_agreed_breadcrumb()) is True
    assert response.status_code == 200
    assert response.data == b'OK'


def test_reboot_success(app, mocker):
    environ_mock = mocker.patch('onboarding.helpers.command_runner.environ')
    environ_mock.copy = dict
    run_mock = mocker.patch('onboarding.helpers.command_runner.run',
                            return_value=dotdict({'stdout': b'', 'stderr': b'', 'returncode': 0}))

    response = app.post('/reboot')
    run_mock.assert_called_once_with(['nice', '-n', '10', 'reboot'], capture_output=True, check=True,
                                     env={'DISPLAY': ':0'}, timeout=30)
    assert response.status_code == 200
    assert response.data == b'OK'


def test_unhide_all_boot_messages_success(app, restore_files):
    assert_file_content('onboarding/test/cmdline.txt', cmd_line_before)

    response = app.post('/unhide-all-boot-messages')
    assert response.status_code == 200
    assert response.data == b'OK'
    assert_file_content('onboarding/test/cmdline.txt', cmd_line_after)
