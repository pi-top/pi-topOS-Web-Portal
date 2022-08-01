from ipaddress import ip_network

import pytest
from flask import json

from tests.data.wifi_manager_data import wifi_ssids, wpa_cli_status


def test_get_wifi_ssids_response_on_success(app):
    response = app.get("/wifi-ssids")
    assert json.loads(response.data) == wifi_ssids
    assert response.status_code == 200


def test_post_wifi_credentials_response_on_connection_success(mocker, app):
    connect_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.wifi_manager.wifi_manager.connect"
    )

    response = app.post(
        "/wifi-credentials", json={"bssid": "test-ssid", "password": "123"}
    )

    connect_mock.assert_called_once_with("test-ssid", "123")

    assert response.status_code == 200
    assert response.data == b"OK"


def test_post_wifi_credentials_aborts_on_connection_failure(app, mocker):
    connect_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.wifi_manager.wifi_manager.connect",
        side_effect=Exception("Waited too long..."),
    )

    response = app.post(
        "/wifi-credentials",
        json={"bssid": "an-invalid-bssid", "password": "not-a-password"},
    )

    connect_mock.assert_called_once_with("an-invalid-bssid", "not-a-password")
    assert response.status_code == 401


def test_post_wifi_credentials_aborts_on_unexistant_bssid(app, mocker):
    connect_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.wifi_manager.wifi_manager.connect",
        side_effect=Exception("Waited too long..."),
    )

    response = app.post(
        "/wifi-credentials",
        json={"bssid": "this-bssid-doesnt-exist", "password": "not-a-password"},
    )

    connect_mock.assert_called_once_with("this-bssid-doesnt-exist", "not-a-password")
    assert response.status_code == 401


def test_post_wifi_credentials_failure_on_wrong_ssid_type(app, mocker):
    connect_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.wifi_manager.wifi_manager.connect"
    )

    response = app.post("/wifi-credentials", json={"bssid": True, "password": "123"})

    connect_mock.assert_not_called()
    assert response.status_code == 422


def test_post_wifi_credentials_failure_on_wrong_password_type(app, mocker):
    connect_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.wifi_manager.wifi_manager.connect"
    )

    response = app.post(
        "/wifi-credentials", json={"bssid": "test-ssid", "password": True}
    )

    connect_mock.assert_not_called()
    assert response.status_code == 422


def test_get_is_connected_response_if_connected(app, mocker):
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.routes.is_connected_to_internet",
        return_value=True,
    )

    response = app.get("/is-connected")

    run_mock.assert_called_once()
    assert response.status_code == 200
    assert json.loads(response.data)["connected"] is True


def test_get_is_connected_response_if_disconnected(app, mocker):
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.routes.is_connected_to_internet", return_value=False
    )

    response = app.get("/is-connected")

    run_mock.assert_called_once()
    assert response.status_code == 200
    assert json.loads(response.data)["connected"] is False


def get_is_connected_to_ssid_response_when_connected_to_network(
    app, mocker, wifi_manager_module
):
    mocker.patch(
        "pt_os_web_portal.backend.helpers.mocks.pywifi_mock.PyWiFiUtil._send_cmd_to_wpas",
        return_value=wpa_cli_status,
    )
    mocker.patch(
        "pt_os_web_portal.backend.helpers.wifi_manager.WifiManager.get_status",
        return_value=wifi_manager_module.IfaceStatus.CONNECTED,  # noqa: F821
    )

    response = app.get("/current-wifi-ssid")

    assert response.status_code == 200
    assert json.loads(response.data) == "my_network"


def get_is_connected_to_ssid_response_when_not_connected_to_network(
    app, mocker, wifi_manager_module
):
    mocker.patch(
        "pt_os_web_portal.backend.helpers.wifi_manager.WifiManager.get_status",
        return_value=wifi_manager_module.IfaceStatus.INACTIVE,  # noqa: F821
    )

    response = app.get("/current-wifi-ssid")

    assert response.status_code == 200
    assert json.loads(response.data) == ""


def get_is_connected_to_ssid_response_on_internal_failure(app, mocker):
    mocker.patch(
        "pt_os_web_portal.backend.helpers.wifi_manager.WifiManager.get_status",
        side_effect=Exception("Internal failure..."),
    )
    response = app.get("/current-wifi-ssid")

    assert response.status_code == 200
    assert json.loads(response.data) == ""


@pytest.mark.parametrize(
    "iface_is_up,ip_in_network,result",
    [
        (False, False, False),
        (True, False, False),
        (True, True, True),
    ],
)
def test_is_connected_through_ap_route(app, mocker, iface_is_up, ip_in_network, result):
    class InterfaceNetworkDataMock:
        network = ip_network("127.0.0.1/24", strict=False) if ip_in_network else []

    mocker.patch(
        "pt_os_web_portal.backend.routes.interface_is_up", return_value=iface_is_up
    )
    mocker.patch(
        "pt_os_web_portal.backend.routes.InterfaceNetworkData",
        return_value=InterfaceNetworkDataMock,
    )
    response = app.get("/is-connected-through-ap")

    assert response.status_code == 200
    assert json.loads(response.data) == {"isUsingAp": result}


def test_is_connected_through_ap_route_on_error(app, mocker):
    mocker.patch(
        "pt_os_web_portal.backend.routes.interface_is_up",
        side_effect=Exception("oh oh..."),
    )
    response = app.get("/is-connected-through-ap")

    assert response.status_code == 200
    assert json.loads(response.data) == {"isUsingAp": False}
