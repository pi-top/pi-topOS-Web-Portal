from tests.utils import SleepMocker


def test_connection_manager_triggers_event_when_getting_ap_credentials(
    patch_modules, mocker
):
    ap_metadata = {
        "ssid": "ap-network-ssid",
        "passphrase": "ap-network-password",
    }
    mocker.patch(
        "pt_os_web_portal.connection_manager.get_address_for_connected_device",
        return_value="",
    )
    mocker.patch(
        "pt_os_web_portal.connection_manager.get_ap_mode_status",
        return_value={},
    )
    mocker.patch(
        "pt_os_web_portal.connection_manager.is_connected_to_internet",
        return_value=False,
    )
    post_event_mock = mocker.patch("pt_os_web_portal.connection_manager.post_event")
    sleep_mocker = SleepMocker()
    sleep_patch = mocker.patch(
        "pt_os_web_portal.connection_manager.sleep", side_effect=sleep_mocker.sleep
    )

    from pt_os_web_portal.connection_manager import AppEvents, ConnectionManager

    cm = ConnectionManager()
    cm.start()

    # Events are not triggered since AP credentials are not available yet
    sleep_mocker.wait_until_next_iteration(sleep_patch)
    assert post_event_mock.call_count == 0

    # Events are triggered since AP credentials were retrieved successfuly
    mocker.patch(
        "pt_os_web_portal.connection_manager.get_ap_mode_status",
        return_value=ap_metadata,
    )
    sleep_mocker.wait_until_next_iteration(sleep_patch)
    post_event_mock.assert_any_call(AppEvents.AP_HAS_SSID, ap_metadata.get("ssid"))
    post_event_mock.assert_any_call(
        AppEvents.AP_HAS_PASSPHRASE, ap_metadata.get("passphrase")
    )
    assert post_event_mock.call_count == 2
    post_event_mock.reset_mock()

    # no changes in AP data, no events posted
    sleep_mocker.wait_until_next_iteration(sleep_patch)
    assert post_event_mock.call_count == 0

    # If issues happen when retrieving credentials, event is not triggered
    mocker.patch(
        "pt_os_web_portal.connection_manager.get_ap_mode_status",
        return_value={},
    )
    sleep_mocker.wait_until_next_iteration(sleep_patch)
    assert post_event_mock.call_count == 0

    cm._stop = True
    sleep_mocker.sleep_event.set()
    cm.stop()


def test_connection_manager_triggers_event_on_connected_device_ip_changes(
    patch_modules, mocker
):
    mocker.patch(
        "pt_os_web_portal.connection_manager.get_address_for_connected_device",
        return_value="",
    )
    mocker.patch(
        "pt_os_web_portal.connection_manager.get_ap_mode_status",
        return_value={},
    )
    mocker.patch(
        "pt_os_web_portal.connection_manager.is_connected_to_internet",
        return_value=False,
    )
    post_event_mock = mocker.patch(
        "pt_os_web_portal.connection_manager.post_event",
    )
    sleep_mocker = SleepMocker()
    sleep_patch = mocker.patch(
        "pt_os_web_portal.connection_manager.sleep", side_effect=sleep_mocker.sleep
    )

    from pt_os_web_portal.connection_manager import AppEvents, ConnectionManager

    cm = ConnectionManager()
    cm.start()

    sleep_mocker.wait_until_next_iteration(sleep_patch)

    # no changes, no events posted
    assert post_event_mock.call_count == 0

    mocker.patch(
        "pt_os_web_portal.connection_manager.get_address_for_connected_device",
        return_value="192.168.64.1",
    )
    sleep_mocker.wait_until_next_iteration(sleep_patch)

    post_event_mock.assert_called_once_with(AppEvents.HAS_CONNECTED_DEVICE, True)

    cm._stop = True
    sleep_mocker.sleep_event.set()
    cm.stop()


def test_connection_manager_triggers_event_on_connection_to_internet(
    patch_modules, mocker
):
    mocker.patch(
        "pt_os_web_portal.connection_manager.get_address_for_connected_device",
        return_value="",
    )
    mocker.patch(
        "pt_os_web_portal.connection_manager.get_ap_mode_status",
        return_value={},
    )
    mocker.patch(
        "pt_os_web_portal.connection_manager.is_connected_to_internet",
        return_value=False,
    )
    post_event_mock = mocker.patch(
        "pt_os_web_portal.connection_manager.post_event",
    )
    sleep_mocker = SleepMocker()
    sleep_patch = mocker.patch(
        "pt_os_web_portal.connection_manager.sleep", side_effect=sleep_mocker.sleep
    )

    from pt_os_web_portal.connection_manager import AppEvents, ConnectionManager

    cm = ConnectionManager()
    cm.start()

    sleep_mocker.wait_until_next_iteration(sleep_patch)

    # no changes, no events posted
    assert post_event_mock.call_count == 0

    mocker.patch(
        "pt_os_web_portal.connection_manager.is_connected_to_internet",
        return_value=True,
    )
    sleep_mocker.wait_until_next_iteration(sleep_patch)

    post_event_mock.assert_called_once_with(AppEvents.IS_CONNECTED_TO_INTERNET, True)

    cm._stop = True
    sleep_mocker.sleep_event.set()
    cm.stop()
