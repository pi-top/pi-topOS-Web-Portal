import pytest

from .data.wpa_supplicant_handler_data import network_profiles, wpa_cli_status


def test_scan_and_get_results_output(wifi_manager):
    networks = wifi_manager.get_ssids()
    assert isinstance(networks, list)
    assert len(networks) == len(network_profiles)

    network_profile_keys = list(networks[0].keys())
    assert network_profile_keys == [
        "ssid",
        "passwordRequired",
        "bssid",
    ]


def test_reported_5G_networks_have_5G_suffix(wifi_manager):
    reported_networks = wifi_manager.get_ssids()

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


def test_reported_ssids_dont_include_repeaters(wifi_manager):
    reported_networks = wifi_manager.get_ssids()

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


def test_connect_failure_on_invalid_bssid(wifi_manager):
    manager = wifi_manager.get_wifi_manager_instance()
    assert manager.is_connected() is False

    with pytest.raises(Exception):
        connect_output = wifi_manager.attempt_connection(
            bssid="a-non-existant-bssid", password="this-is-a-password"
        )
        assert connect_output is None
    assert manager.is_connected() is False


def test_connect_excepts_on_backend_failure(wifi_manager, mocker):
    mocker.patch(
        "pt_os_web_portal.backend.helpers.wifi.WifiManager.connect",
        side_effect=Exception("Waited too long..."),
    )
    with pytest.raises(Exception):
        wifi_manager.attempt_connection(
            bssid="e0:cc:7a:fd:84:4c", password="this-is-not-my-real-password"
        )


def test_current_wifi_bssid_function_output(wifi_manager, mocker):
    from pt_os_web_portal.backend.helpers.wifi_connection.wpa_supplicant_handler import (
        IfaceStatus,
    )

    mocker.patch(
        "pt_os_web_portal.backend.helpers.mocks.pywifi_mock.PyWiFiUtil._send_cmd_to_wpas",
        return_value=wpa_cli_status,
    )
    mocker.patch(
        "pt_os_web_portal.backend.helpers.wifi_connection.wpa_supplicant_handler.WpaSupplicantHandler.get_status",
        return_value=IfaceStatus.CONNECTED,
    )

    assert wifi_manager.current_wifi_bssid() == "e0:cc:7a:fd:84:50"


def test_current_wifi_bssid_function_returns_empty_string_if_disconnected(
    wifi_manager, mocker
):
    from pt_os_web_portal.backend.helpers.wifi_connection.wpa_supplicant_handler import (
        IfaceStatus,
    )

    mocker.patch(
        "pt_os_web_portal.backend.helpers.wifi_connection.wpa_supplicant_handler.WpaSupplicantHandler.get_status",
        return_value=IfaceStatus.INACTIVE,
    )

    assert wifi_manager.get_wifi_manager_instance().is_connected() is False
    assert wifi_manager.current_wifi_bssid() == ""


def test_current_wifi_bssid_function_returns_empty_string_on_exception(
    wifi_manager, mocker
):
    mocker.patch(
        "pt_os_web_portal.backend.helpers.wifi_connection.wpa_supplicant_handler.WpaSupplicantHandler.get_status",
        side_effect=Exception("Internal failure..."),
    )
    assert wifi_manager.current_wifi_bssid() == ""
