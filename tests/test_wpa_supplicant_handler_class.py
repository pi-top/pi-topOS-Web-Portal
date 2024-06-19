import pytest

from .data.wpa_supplicant_handler_data import network_profiles, wpa_cli_status


def test_constructor_excepts_when_interface_doesnt_exist(wpa_supplicant_handler):
    with pytest.raises(Exception):
        wpa_supplicant_handler.WpaSupplicantHandler("not-a-valid-iface")


def test_constructor_success_on_default_interface(wpa_supplicant_handler):
    wifi_manager = wpa_supplicant_handler.WpaSupplicantHandler()
    assert wifi_manager.wifi_interface.name() == "wlan0"


def test_get_status_responds_an_ifacestatus_enum(wpa_supplicant_handler):
    wifi_manager = wpa_supplicant_handler.WpaSupplicantHandler()
    assert type(wifi_manager.get_status()) == wpa_supplicant_handler.IfaceStatus


def test_interface_is_inactive_on_instantiation(wpa_supplicant_handler):
    wifi_manager = wpa_supplicant_handler.WpaSupplicantHandler()
    assert wifi_manager.is_inactive() is True
    assert wifi_manager.is_connecting() is False
    assert wifi_manager.is_connected() is False
    assert wifi_manager.is_scanning() is False


def test_scan_and_get_results_output(wpa_supplicant_handler):
    wifi_manager = wpa_supplicant_handler.WpaSupplicantHandler()
    networks = wifi_manager.scan_and_get_results()

    assert wifi_manager.is_inactive() is True
    assert isinstance(networks, list)
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


def test_reported_5G_networks_have_5G_suffix(wpa_supplicant_handler):
    reported_networks = (
        wpa_supplicant_handler.WpaSupplicantHandler().get_formatted_ssids()
    )

    def find_reported_network_by_bssid(bssid):
        for network in reported_networks:
            if network.get("bssid") == bssid:
                return network

    for network_profile in network_profiles:
        reported_network = find_reported_network_by_bssid(network_profile.get("bssid"))
        if reported_network:
            assert expected_name_for_network_profile(
                network_profile
            ) == reported_network.get("ssid")


def expected_name_for_network_profile(network_profile):
    expected_name = network_profile.get("ssid")
    if network_profile.get("freq") >= 5000:
        expected_name += " [5G]"
    return expected_name


def test_reported_ssids_dont_include_repeaters(wpa_supplicant_handler):
    reported_networks = (
        wpa_supplicant_handler.WpaSupplicantHandler().get_formatted_ssids()
    )

    def find_reported_network_by_key_value(key, value):
        for network in reported_networks:
            if network.get(key) == value:
                return network

    for network_profile in network_profiles:
        reported_network = find_reported_network_by_key_value(
            key="bssid", value=network_profile.get("bssid")
        )
        if not reported_network:
            # a network detected by the low level backend wasn't reported to the frontend
            reported_ssid = expected_name_for_network_profile(network_profile)
            reported_network = find_reported_network_by_key_value(
                key="ssid", value=reported_ssid
            )
            # but another one with the same SSID was reported - it's okay
            assert reported_network is not None


def test_on_connection_success_state_is_updated(wpa_supplicant_handler):
    wifi_manager = wpa_supplicant_handler.WpaSupplicantHandler()
    assert wifi_manager.is_inactive() is True
    wifi_manager.connect(
        bssid="e0:cc:7a:fd:84:4c", password="this-is-not-my-real-password"
    )
    assert wifi_manager.is_connected() is True


def test_connect_verifies_data_with_scan_and_get_results(
    wpa_supplicant_handler, mocker
):
    wifi_manager = wpa_supplicant_handler.WpaSupplicantHandler()
    mocker.spy(wifi_manager, "scan_and_get_results")
    wifi_manager.connect(
        bssid="e0:cc:7a:fd:84:4c", password="this-is-not-my-real-password"
    )
    assert wifi_manager.scan_and_get_results.call_count == 1


def test_disconnect_is_called_before_connecting_on_valid_bssid(
    wpa_supplicant_handler, mocker
):
    wifi_manager = wpa_supplicant_handler.WpaSupplicantHandler()
    mocker.spy(wifi_manager, "disconnect")
    wifi_manager.connect(
        bssid="e0:cc:7a:fd:84:4c", password="this-is-not-my-real-password"
    )
    assert wifi_manager.disconnect.call_count == 1


def test_connect_raises_exception_on_unexistant_bssid(wpa_supplicant_handler, mocker):
    wifi_manager = wpa_supplicant_handler.WpaSupplicantHandler()
    mocker.spy(wifi_manager, "disconnect")

    with pytest.raises(Exception):
        wifi_manager.connect(
            bssid="invalid bssid", password="this-is-not-my-real-password"
        )

    assert wifi_manager.disconnect.call_count == 0


def test_connect_fix_on_networks_without_security(wpa_supplicant_handler):
    wifi_manager = wpa_supplicant_handler.WpaSupplicantHandler()
    assert wifi_manager.is_inactive() is True
    wifi_manager.connect(bssid="18:35:d1:20:98:5f", password=None)
    assert wifi_manager.is_connected() is True


def test_connect_failure_on_invalid_bssid(wpa_supplicant_handler):
    wifi_manager = wpa_supplicant_handler.WpaSupplicantHandler()
    assert wifi_manager.is_inactive() is True
    assert wifi_manager.is_connected() is False

    with pytest.raises(Exception):
        connect_output = wifi_manager.connect(
            bssid="a-non-existant-bssid", password="this-is-a-password"
        )
        assert connect_output is None
    assert wifi_manager.is_inactive() is True
    assert wifi_manager.is_connected() is False


def test_connect_excepts_on_failure(wpa_supplicant_handler, mocker):
    mocker.patch(
        "pt_os_web_portal.backend.helpers.mocks.pywifi_mock.PyWiFiInterfaceMock.connect",
        side_effect=Exception("Waited too long..."),
    )
    wifi_manager = wpa_supplicant_handler.WpaSupplicantHandler()

    with pytest.raises(Exception):
        wifi_manager.connect(
            bssid="e0:cc:7a:fd:84:4c", password="this-is-not-my-real-password"
        )


def test_bssid_connected_function_output(wpa_supplicant_handler, mocker):
    mocker.patch(
        "pt_os_web_portal.backend.helpers.mocks.pywifi_mock.PyWiFiUtil._send_cmd_to_wpas",
        return_value=wpa_cli_status,
    )
    mocker.patch(
        "pt_os_web_portal.backend.helpers.wifi_connection.wpa_supplicant_handler.WpaSupplicantHandler.get_status",
        return_value=wpa_supplicant_handler.IfaceStatus.CONNECTED,
    )

    wifi_manager = wpa_supplicant_handler.WpaSupplicantHandler()
    assert wifi_manager.bssid_connected() == "e0:cc:7a:fd:84:50"


def test_bssid_connected_function_returns_empty_string_if_disconnected(
    wpa_supplicant_handler, mocker
):
    mocker.patch(
        "pt_os_web_portal.backend.helpers.wifi_connection.wpa_supplicant_handler.WpaSupplicantHandler.get_status",
        return_value=wpa_supplicant_handler.IfaceStatus.INACTIVE,
    )

    wifi_manager = wpa_supplicant_handler.WpaSupplicantHandler()
    assert wifi_manager.is_inactive() is True
    assert wifi_manager.bssid_connected() == ""


def test_bssid_connected_function_returns_empty_string_on_exception(
    wpa_supplicant_handler, mocker
):
    mocker.patch(
        "pt_os_web_portal.backend.helpers.wifi_connection.wpa_supplicant_handler.WpaSupplicantHandler.get_status",
        side_effect=Exception("Internal failure..."),
    )

    wifi_manager = wpa_supplicant_handler.WpaSupplicantHandler()
    assert wifi_manager.bssid_connected() == ""


def test_disconnect_waits_until_inactive_to_return(wpa_supplicant_handler, mocker):
    def set_status_to_inactive():
        mocker.patch(
            "pt_os_web_portal.backend.helpers.wifi_connection.wpa_supplicant_handler.WpaSupplicantHandler.is_inactive",
            return_value=True,
        )

    mocker.patch(
        "pt_os_web_portal.backend.helpers.wifi_connection.wpa_supplicant_handler.WpaSupplicantHandler.is_inactive",
        return_value=False,
    )
    mocker.patch(
        "pt_os_web_portal.backend.helpers.mocks.pywifi_mock.PyWiFiInterfaceMock.disconnect",
        side_effect=set_status_to_inactive,
    )

    wifi_manager = wpa_supplicant_handler.WpaSupplicantHandler()
    mocker.spy(wifi_manager, "wait_for")

    wifi_manager.disconnect()
    assert wifi_manager.wait_for.call_count == 1


def test_disconnect_calls_interface_disconnect(wpa_supplicant_handler, mocker):
    def set_status_to_inactive():
        mocker.patch(
            "pt_os_web_portal.backend.helpers.wifi_connection.wpa_supplicant_handler.WpaSupplicantHandler.is_inactive",
            return_value=True,
        )

    mocker.patch(
        "pt_os_web_portal.backend.helpers.wifi_connection.wpa_supplicant_handler.WpaSupplicantHandler.is_inactive",
        return_value=False,
    )
    mocker.patch(
        "pt_os_web_portal.backend.helpers.mocks.pywifi_mock.PyWiFiInterfaceMock.disconnect",
        side_effect=set_status_to_inactive,
    )

    wifi_manager = wpa_supplicant_handler.WpaSupplicantHandler()
    mocker.spy(wifi_manager.wifi_interface, "disconnect")

    wifi_manager.disconnect()
    assert wifi_manager.wifi_interface.disconnect.call_count == 1


def displayed_ssid_for_network(wpa_supplicant_handler):
    from pt_os_web_portal.backend.helpers.mocks.pywifi_mock import PyWiFiProfile

    wifi_manager = wpa_supplicant_handler.WpaSupplicantHandler()

    test_data = [
        ({"ssid": "", "freq": 2400}, "[Hidden Network]"),
        ({"ssid": "", "freq": 5400}, "[Hidden Network] [5G]"),
        ({"ssid": "any ssid", "freq": 5400}, "any ssid [5G]"),
        ({"ssid": "any ssid", "freq": 2400}, "any ssid"),
    ]
    for profile, expected_ssid in test_data:
        assert wifi_manager.ssid_to_display(PyWiFiProfile(profile)) == expected_ssid
