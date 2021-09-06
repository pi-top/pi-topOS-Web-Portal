import pytest

from tests.data.wifi_manager_data import network_profiles, wpa_cli_status


def test_constructor_excepts_when_interface_doesnt_exist(wifi_manager_module):
    wifi_manager_module.WifiManager.RPI_WLAN_INTERFACE = "not-a-valid-iface"
    with pytest.raises(Exception):
        wifi_manager_module.WifiManager()


def test_constructor_success_on_default_interface(wifi_manager_module):
    wifi_manager = wifi_manager_module.WifiManager()
    assert wifi_manager.wifi_interface.name() == "wlan0"


def test_get_status_responds_an_ifacestatus_enum(wifi_manager_module):
    wifi_manager = wifi_manager_module.WifiManager()
    assert type(wifi_manager.get_status()) == wifi_manager_module.IfaceStatus


def test_interface_is_inactive_on_instantiation(wifi_manager_module):
    wifi_manager = wifi_manager_module.WifiManager()
    assert wifi_manager.is_inactive() is True
    assert wifi_manager.is_connecting() is False
    assert wifi_manager.is_connected() is False
    assert wifi_manager.is_scanning() is False


def test_scan_and_get_results_output(wifi_manager_module):
    wifi_manager = wifi_manager_module.WifiManager()
    networks = wifi_manager.scan_and_get_results()

    assert wifi_manager.is_inactive() is True
    assert type(networks) == list
    assert len(networks) == len(network_profiles)
    network_profile_keys = list(networks[0].__dict__.keys())
    assert network_profile_keys == [
        "id",
        "auth",
        "akm",
        "cipher",
        "ssid",
        "bssid",
        "key",
        "freq",
        "signal",
    ]


def test_connect_success_updates_state(wifi_manager_module):
    wifi_manager = wifi_manager_module.WifiManager()
    assert wifi_manager.is_inactive() is True
    wifi_manager.connect(ssid="Depto 606", password="this-is-not-my-real-password")
    assert wifi_manager.is_connected() is True


def test_connect_verifies_data_with_scan_and_get_results(wifi_manager_module, mocker):
    wifi_manager = wifi_manager_module.WifiManager()
    mocker.spy(wifi_manager, "scan_and_get_results")
    wifi_manager.connect(ssid="Depto 606", password="this-is-not-my-real-password")
    assert wifi_manager.scan_and_get_results.call_count == 1


def test_disconnect_is_called_before_connecting(wifi_manager_module, mocker):
    wifi_manager = wifi_manager_module.WifiManager()
    mocker.spy(wifi_manager, "disconnect")
    wifi_manager.connect(ssid="Depto 606", password="this-is-not-my-real-password")
    assert wifi_manager.disconnect.call_count == 1


def test_disconnect_is_not_called_on_invalid_ssids(wifi_manager_module, mocker):
    wifi_manager = wifi_manager_module.WifiManager()
    mocker.spy(wifi_manager, "disconnect")
    wifi_manager.connect(ssid="invalid ssid", password="this-is-not-my-real-password")
    assert wifi_manager.disconnect.call_count == 0


def test_connect_fix_on_networks_without_security(wifi_manager_module):
    wifi_manager = wifi_manager_module.WifiManager()
    assert wifi_manager.is_inactive() is True
    wifi_manager.connect(ssid="Free internet!", password=None)
    assert wifi_manager.is_connected() is True


def test_connect_failure_on_invalid_ssid(wifi_manager_module):
    wifi_manager = wifi_manager_module.WifiManager()
    assert wifi_manager.is_inactive() is True
    assert wifi_manager.is_connected() is False
    connect_output = wifi_manager.connect(
        ssid="unexistant network", password="this-is-a-password"
    )
    assert connect_output is None
    assert wifi_manager.is_inactive() is True
    assert wifi_manager.is_connected() is False


def test_connect_excepts_on_failure(wifi_manager_module, mocker):
    mocker.patch(
        "backend.helpers.mocks.pywifi_mock.PyWiFiInterfaceMock.connect",
        side_effect=Exception("Waited too long..."),
    )
    wifi_manager = wifi_manager_module.WifiManager()

    with pytest.raises(Exception):
        wifi_manager.connect(ssid="Depto 606", password="this-is-not-my-real-password")


def test_ssid_connected_success(wifi_manager_module, mocker):
    mocker.patch(
        "backend.helpers.mocks.pywifi_mock.PyWiFiUtil._send_cmd_to_wpas",
        return_value=wpa_cli_status,
    )
    mocker.patch(
        "backend.helpers.wifi_manager.WifiManager.get_status",
        return_value=wifi_manager_module.IfaceStatus.CONNECTED,
    )

    wifi_manager = wifi_manager_module.WifiManager()
    assert wifi_manager.ssid_connected() == "Depto 606-5G"


def test_ssid_connected_returns_empty_if_disconnected(wifi_manager_module, mocker):
    mocker.patch(
        "backend.helpers.wifi_manager.WifiManager.get_status",
        return_value=wifi_manager_module.IfaceStatus.INACTIVE,
    )

    wifi_manager = wifi_manager_module.WifiManager()
    assert wifi_manager.ssid_connected() == ""


def test_ssid_connected_returns_empty_on_exception(wifi_manager_module, mocker):
    mocker.patch(
        "backend.helpers.wifi_manager.WifiManager.get_status",
        side_effect=Exception("Internal failure..."),
    )

    wifi_manager = wifi_manager_module.WifiManager()
    assert wifi_manager.ssid_connected() == ""


def test_disconnect_waits_until_inactive_to_return(wifi_manager_module, mocker):
    def set_status_to_inactive():
        mocker.patch(
            "backend.helpers.wifi_manager.WifiManager.is_inactive", return_value=True
        )

    mocker.patch(
        "backend.helpers.wifi_manager.WifiManager.is_inactive", return_value=False
    )
    mocker.patch(
        "backend.helpers.mocks.pywifi_mock.PyWiFiInterfaceMock.disconnect",
        side_effect=set_status_to_inactive,
    )

    wifi_manager = wifi_manager_module.WifiManager()
    mocker.spy(wifi_manager, "wait_for")

    wifi_manager.disconnect()
    assert wifi_manager.wait_for.call_count == 1


def test_disconnect_calls_interface_disconnect(wifi_manager_module, mocker):
    def set_status_to_inactive():
        mocker.patch(
            "backend.helpers.wifi_manager.WifiManager.is_inactive", return_value=True
        )

    mocker.patch(
        "backend.helpers.wifi_manager.WifiManager.is_inactive", return_value=False
    )
    mocker.patch(
        "backend.helpers.mocks.pywifi_mock.PyWiFiInterfaceMock.disconnect",
        side_effect=set_status_to_inactive,
    )

    wifi_manager = wifi_manager_module.WifiManager()
    mocker.spy(wifi_manager.wifi_interface, "disconnect")

    wifi_manager.disconnect()
    assert wifi_manager.wifi_interface.disconnect.call_count == 1
