from unittest.mock import Mock

import pytest

from tests.utils import wait_for_condition


def test_constructor_excepts_when_interface_doesnt_exist(network_manager_handler):
    with pytest.raises(Exception):
        network_manager_handler("not-a-valid-iface")


def test_constructor_success_on_default_interface(network_manager_handler):
    handler = network_manager_handler("wlan0")
    assert handler.wifi_device.device == "wlan0"


def test_scan_and_get_results_output(network_manager_handler):
    handler = network_manager_handler()
    networks = handler.scan_and_get_results()

    assert isinstance(networks, list)
    assert len(networks) == 6

    for prop in (
        "in_use",
        "ssid",
        "bssid",
        "mode",
        "chan",
        "freq",
        "rate",
        "signal",
        "security",
    ):
        assert not isinstance(getattr(networks[0], prop), Mock)


def test_reported_5G_networks_have_5G_suffix(network_manager_handler, nmcli_mock):
    def find_reported_network_by_bssid(bssid):
        for network in network_manager_handler().get_formatted_ssids():
            if network.get("bssid") == bssid:
                return network

    for network_profile in nmcli_mock.device.wifi("wlan0"):
        reported_network = find_reported_network_by_bssid(network_profile.bssid)
        if reported_network:
            assert expected_name_for_network_profile(
                network_profile
            ) == reported_network.get("ssid")


def expected_name_for_network_profile(network_profile):
    expected_name = network_profile.ssid
    if network_profile.freq >= 5000:
        expected_name += " [5G]"
    return expected_name


def test_reported_ssids_dont_include_repeaters(network_manager_handler, nmcli_mock):
    def find_reported_network_by_key_value(key, value):
        reported_networks = network_manager_handler().get_formatted_ssids()

        for network in reported_networks:
            if network.get(key) == value:
                return network

    for network_profile in nmcli_mock.device.wifi("wlan0"):
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


def test_on_connection_success_state_is_updated(network_manager_handler):
    handler = network_manager_handler()
    assert handler.is_connected() is False
    handler.connect(bssid="F0:9B:B8:2D:20:4C", password="valid-password")
    wait_for_condition(lambda: handler.is_connected() is True)
    assert handler.is_connected() is True


def test_connect_verifies_data_with_scan_and_get_results(
    network_manager_handler, mocker
):
    handler = network_manager_handler()
    mocker.spy(handler, "scan_and_get_results")
    handler.connect(bssid="F0:9B:B8:2D:20:4C", password="valid-password")
    assert handler.scan_and_get_results.call_count == 1


def test_connect_raises_exception_on_unexistant_bssid(network_manager_handler, mocker):
    handler = network_manager_handler()
    with pytest.raises(Exception):
        handler.connect(bssid="invalid bssid", password="valid-password")


def test_connect_failure_on_invalid_bssid(network_manager_handler):
    handler = network_manager_handler()
    assert handler.is_connected() is False

    with pytest.raises(Exception):
        connect_output = handler.connect(
            bssid="a-non-existant-bssid", password="this-is-a-password"
        )
        assert connect_output is None
    assert handler.is_connected() is False


def test_connect_doesnt_except_on_failure(network_manager_handler, mocker, nmcli_mock):
    mocker.patch.object(
        nmcli_mock.device,
        "wifi_connect",
        side_effect=Exception("Waited too long..."),
    )
    handler = network_manager_handler()

    handler.connect(bssid="F0:9B:B8:2D:20:4C", password="valid-password")


def test_bssid_connected_function_output(network_manager_handler):
    handler = network_manager_handler()
    handler.connect(bssid="F0:9B:B8:2D:20:4C", password="valid-password")
    assert handler.bssid_connected() == "F0:9B:B8:2D:20:4C"


def test_bssid_connected_function_returns_empty_string_if_disconnected(
    network_manager_handler,
):
    handler = network_manager_handler()
    assert handler.is_connected() is False
    assert handler.bssid_connected() == ""


def test_bssid_connected_function_returns_empty_string_on_exception(
    network_manager_handler, mocker, nmcli_mock
):
    mocker.patch.object(
        nmcli_mock.device,
        "wifi",
        side_effect=Exception("Internal failure..."),
    )

    handler = network_manager_handler()
    assert handler.bssid_connected() == ""


def displayed_ssid_for_network(network_manager_handler):
    from pt_os_web_portal.backend.helpers.mocks.pywifi_mock import PyWiFiProfile

    handler = network_manager_handler()

    test_data = [
        ({"ssid": "", "freq": 2400}, "[Hidden Network]"),
        ({"ssid": "", "freq": 5400}, "[Hidden Network] [5G]"),
        ({"ssid": "any ssid", "freq": 5400}, "any ssid [5G]"),
        ({"ssid": "any ssid", "freq": 2400}, "any ssid"),
    ]
    for profile, expected_ssid in test_data:
        assert handler.ssid_to_display(PyWiFiProfile(profile)) == expected_ssid
