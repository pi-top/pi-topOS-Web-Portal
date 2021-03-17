from flask import json

from tests.data.wifi_manager_data import wifi_ssids, wpa_cli_status
from tests.utils import dotdict


def test_get_wifi_ssids_responds_correctly(app):
    response = app.get('/wifi-ssids')

    assert json.loads(response.data) == wifi_ssids
    assert response.status_code == 200


def test_post_wifi_credentials_responds_on_connect(app, mocker):
    connect_mock = mocker.patch(
        'onboarding.helpers.wifi_manager.wifi_manager.connect')

    response = app.post('/wifi-credentials', json={
        'ssid': 'test-ssid',
        'password': '123'
    })

    connect_mock.assert_called_once_with('test-ssid', '123')

    assert response.status_code == 200
    assert response.data == b'OK'


def test_post_wifi_credentials_aborts_on_connect_failure(app, mocker):
    connect_mock = mocker.patch(
        'onboarding.helpers.wifi_manager.wifi_manager.connect', side_effect=Exception('Waited too long...'))

    response = app.post('/wifi-credentials', json={
        'ssid': 'test-ssid',
        'password': '123'
    })

    connect_mock.assert_called_once_with('test-ssid', '123')

    assert response.status_code == 401


def test_post_wifi_credentials_failure_wrong_ssid_type(app, mocker):
    connect_mock = mocker.patch(
        'onboarding.helpers.wifi_manager.wifi_manager.connect')

    response = app.post('/wifi-credentials', json={
        'ssid': True,
        'password': '123'
    })

    connect_mock.assert_not_called()

    assert response.status_code == 422


def test_post_wifi_credentials_failure_wrong_password_type(app, mocker):
    connect_mock = mocker.patch(
        'onboarding.helpers.wifi_manager.wifi_manager.connect')

    response = app.post('/wifi-credentials', json={
        'ssid': 'test-ssid',
        'password': True
    })

    connect_mock.assert_not_called()

    assert response.status_code == 422


def test_get_is_connected_responds_with_correctly_when_connected(app, mocker):
    environ_mock = mocker.patch('onboarding.helpers.command_runner.environ')
    environ_mock.copy = dict

    run_mock = mocker.patch('onboarding.helpers.command_runner.run',
                            return_value=dotdict({'stdout': b'OK', 'stderr': b'', 'returncode': 0}))

    response = app.get('/is-connected')

    run_mock.assert_called_once_with(['ping', '-c1', '8.8.8.8'],
                                     capture_output=True, check=True, env={'DISPLAY': ':0'}, timeout=10)

    assert response.status_code == 200
    assert json.loads(response.data)["connected"] == True


def test_get_is_connected_responds_correctly_when_disconnected(app, mocker):
    environ_mock = mocker.patch('onboarding.helpers.command_runner.environ')
    environ_mock.copy = dict

    run_mock = mocker.patch(
        'onboarding.helpers.command_runner.run', side_effect=Exception('no connection'))

    response = app.get('/is-connected')

    run_mock.assert_called_once_with(['ping', '-c1', '8.8.8.8'],
                                     capture_output=True, check=True, env={'DISPLAY': ':0'}, timeout=10)

    assert response.status_code == 200
    assert json.loads(response.data)["connected"] == False


def get_is_connected_to_ssid_response_when_connected_to_network(app, mocker):
    mocker.patch('onboarding.helpers.mocks.pywifi_mock.PyWiFiUtil._send_cmd_to_wpas',
                 return_value=wpa_cli_status)
    mocker.patch('onboarding.helpers.wifi_manager.WifiManager.get_status',
                 return_value=wifi_manager_module.IfaceStatus.CONNECTED)
    response = app.get('/current-wifi-ssid')

    assert response.status_code == 200
    assert json.loads(response.data) == 'my_network'


def get_is_connected_to_ssid_response_when_not_connected_to_network(app, mocker):
    mocker.patch('onboarding.helpers.wifi_manager.WifiManager.get_status',
                 return_value=wifi_manager_module.IfaceStatus.INACTIVE)
    response = app.get('/current-wifi-ssid')

    assert response.status_code == 200
    assert json.loads(response.data) == ''


def get_is_connected_to_ssid_response_on_internal_failure(app, mocker):
    mocker.patch('onboarding.helpers.wifi_manager.WifiManager.get_status',
                 side_effect=Exception('Internal failure...'))
    response = app.get('/current-wifi-ssid')

    assert response.status_code == 200
    assert json.loads(response.data) == ''
