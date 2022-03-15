from threading import Event
from time import sleep

sleep_event = Event()


def fake_sleep(time):
    sleep_event.clear()
    sleep_event.wait()


def wait_until_next_iteration(sleep_mock):
    current = sleep_mock.call_count
    sleep_event.set()
    while sleep_mock.call_count == current:
        sleep(0.01)


def test_ap_connection_constructor_fetches_metadata(patch_modules, mocker):
    ap_metadata = {
        "ssid": "ap-network-ssid",
        "passphrase": "ap-network-password",
    }

    get_ap_mode_status_mock = mocker.patch(
        "pt_os_web_portal.connection_manager.get_ap_mode_status",
        return_value=ap_metadata,
    )

    from pt_os_web_portal.connection_manager import ApConnection

    ap = ApConnection()

    get_ap_mode_status_mock.assert_called_once()

    assert ap.metadata == ap_metadata


def test_ap_connection_properties_use_metadata(patch_modules, mocker):
    ap_metadata = {
        "ssid": "ap-network-ssid",
        "passphrase": "ap-network-password",
    }

    mocker.patch(
        "pt_os_web_portal.connection_manager.get_ap_mode_status",
        return_value=ap_metadata,
    )

    from pt_os_web_portal.connection_manager import ApConnection

    ap = ApConnection()

    assert ap.ssid == ap_metadata.get("ssid")
    assert ap.passphrase == ap_metadata.get("passphrase")


def test_ap_connection_has_changes_property_on_update(patch_modules, mocker):
    ap_metadata = {
        "ssid": "ap-network-ssid",
        "passphrase": "ap-network-password",
    }
    mocker.patch(
        "pt_os_web_portal.connection_manager.get_ap_mode_status",
        return_value=ap_metadata,
    )

    from pt_os_web_portal.connection_manager import ApConnection

    ap = ApConnection()

    assert ap.ssid == ap_metadata.get("ssid")
    assert ap.passphrase == ap_metadata.get("passphrase")

    mocker.patch(
        "pt_os_web_portal.connection_manager.get_ap_mode_status",
        return_value={},
    )

    ap.update()
    assert ap.has_changes is True
    assert ap.ssid == ""
    assert ap.passphrase == ""

    ap.update()
    assert ap.has_changes is False

    mocker.patch(
        "pt_os_web_portal.connection_manager.get_ap_mode_status",
        return_value=ap_metadata,
    )

    ap.update()
    assert ap.has_changes is True
    assert ap.ssid == ap_metadata.get("ssid")
    assert ap.passphrase == ap_metadata.get("passphrase")


def test_connection_manager_triggers_event_on_ap_changes(patch_modules, mocker):
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
        return_value=ap_metadata,
    )
    mocker.patch(
        "pt_os_web_portal.connection_manager.is_connected_to_internet",
        return_value=False,
    )
    post_event_mock = mocker.patch("pt_os_web_portal.connection_manager.post_event")
    sleep_mock = mocker.patch(
        "pt_os_web_portal.connection_manager.sleep", side_effect=fake_sleep
    )

    from pt_os_web_portal.connection_manager import AppEvents, ConnectionManager

    cm = ConnectionManager()
    cm.start()

    post_event_mock.assert_any_call(AppEvents.AP_HAS_SSID, ap_metadata.get("ssid"))
    post_event_mock.assert_any_call(
        AppEvents.AP_HAS_PASSPHRASE, ap_metadata.get("passphrase")
    )
    assert post_event_mock.call_count == 2
    post_event_mock.reset_mock()

    wait_until_next_iteration(sleep_mock)

    # no changes in AP data, no events posted
    assert post_event_mock.call_count == 0

    mocker.patch(
        "pt_os_web_portal.connection_manager.get_ap_mode_status",
        return_value={},
    )

    wait_until_next_iteration(sleep_mock)

    post_event_mock.assert_any_call(AppEvents.AP_HAS_SSID, "")
    post_event_mock.assert_any_call(AppEvents.AP_HAS_PASSPHRASE, "")
    assert post_event_mock.call_count == 2

    cm._stop = True
    sleep_event.set()
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
    sleep_mock = mocker.patch(
        "pt_os_web_portal.connection_manager.sleep", side_effect=fake_sleep
    )

    from pt_os_web_portal.connection_manager import AppEvents, ConnectionManager

    cm = ConnectionManager()
    cm.ap_connection._previous_metadata = {}  # don't trigger AP events
    cm.start()

    wait_until_next_iteration(sleep_mock)

    # no changes, no events posted
    assert post_event_mock.call_count == 0

    mocker.patch(
        "pt_os_web_portal.connection_manager.get_address_for_connected_device",
        return_value="192.168.64.1",
    )
    wait_until_next_iteration(sleep_mock)

    post_event_mock.assert_called_once_with(AppEvents.HAS_CONNECTED_DEVICE, True)

    cm._stop = True
    sleep_event.set()
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
    sleep_mock = mocker.patch(
        "pt_os_web_portal.connection_manager.sleep", side_effect=fake_sleep
    )

    from pt_os_web_portal.connection_manager import AppEvents, ConnectionManager

    cm = ConnectionManager()
    cm.ap_connection._previous_metadata = {}  # don't trigger AP events
    cm.start()

    wait_until_next_iteration(sleep_mock)

    # no changes, no events posted
    assert post_event_mock.call_count == 0

    mocker.patch(
        "pt_os_web_portal.connection_manager.is_connected_to_internet",
        return_value=True,
    )
    wait_until_next_iteration(sleep_mock)

    post_event_mock.assert_called_once_with(AppEvents.IS_CONNECTED_TO_INTERNET, True)

    cm._stop = True
    sleep_event.set()
    cm.stop()
