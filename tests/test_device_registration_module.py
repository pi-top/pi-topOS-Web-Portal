from unittest.mock import Mock

from tests.utils import SleepMocker


def test_sleeps_before_registering(app, mocker):
    mocker.patch("pt_os_web_portal.device_registration.listener.state", return_value="")
    mocker.patch(
        "pt_os_web_portal.device_registration.listener.send_register_device_request",
        return_value="",
    )
    sleep_mock = mocker.patch(
        "pt_os_web_portal.device_registration.listener.sleep", return_value=""
    )

    from pt_os_web_portal.device_registration.listener import register_device

    register_device()
    sleep_mock.assert_called_once_with(60)


def test_calls_register_handler_on_connected_to_internet_event(app, mocker):
    mocker.patch("pt_os_web_portal.device_registration.listener.state", return_value="")
    handler_mock = mocker.patch(
        "pt_os_web_portal.device_registration.listener.handle_is_connected_to_internet_event",
        return_value="",
    )

    from pt_os_web_portal.device_registration.listener import (
        setup_device_registration_event_handlers,
    )
    from pt_os_web_portal.event import AppEvents, post_event

    setup_device_registration_event_handlers()

    post_event(AppEvents.IS_CONNECTED_TO_INTERNET, True)
    handler_mock.assert_called_once_with(True)


def test_doesnt_register_if_already_registered(app, mocker):
    mocker.patch(
        "pt_os_web_portal.device_registration.listener.state.get",
        side_effect=lambda section, value, fallback=None: "true",
    )
    mocker.patch(
        "pt_os_web_portal.device_registration.listener.device_is_registered",
        return_value=True,
    )
    thread_mock = mocker.patch(
        "pt_os_web_portal.device_registration.listener.Thread", return_value=""
    )

    from pt_os_web_portal.device_registration.listener import (
        handle_is_connected_to_internet_event,
    )

    handle_is_connected_to_internet_event(is_connected=True)
    assert thread_mock.call_count == 0


def test_doesnt_register_if_not_connected_to_internet(app, mocker):
    mocker.patch(
        "pt_os_web_portal.device_registration.listener.state.get",
        side_effect=lambda section, value, fallback=None: "true",
    )
    mocker.patch(
        "pt_os_web_portal.device_registration.listener.device_is_registered",
        return_value=False,
    )
    thread_mock = mocker.patch(
        "pt_os_web_portal.device_registration.listener.Thread", return_value=""
    )

    from pt_os_web_portal.device_registration.listener import (
        handle_is_connected_to_internet_event,
    )

    handle_is_connected_to_internet_event(is_connected=False)
    assert thread_mock.call_count == 0


def test_doesnt_register_if_onboarding_not_completed(app, mocker):
    mocker.patch(
        "pt_os_web_portal.device_registration.listener.state.get",
        side_effect=lambda section, value, fallback=None: "false",
    )
    mocker.patch(
        "pt_os_web_portal.device_registration.listener.device_is_registered",
        return_value=False,
    )
    thread_mock = mocker.patch(
        "pt_os_web_portal.device_registration.listener.Thread", return_value=""
    )

    from pt_os_web_portal.device_registration.listener import (
        handle_is_connected_to_internet_event,
    )

    handle_is_connected_to_internet_event(is_connected=True)
    assert thread_mock.call_count == 0


def test_registers_if_not_already_registered(app, mocker):
    mocker.patch(
        "pt_os_web_portal.device_registration.listener.state.get",
        side_effect=lambda section, value, fallback=None: "true",
    )
    mocker.patch(
        "pt_os_web_portal.device_registration.listener.device_is_registered",
        return_value=False,
    )
    register_mock = mocker.patch(
        "pt_os_web_portal.device_registration.listener.register_device",
    )
    thread_mock = mocker.patch(
        "pt_os_web_portal.device_registration.listener.Thread",
    )
    thread_mock.start = Mock()

    from pt_os_web_portal.device_registration.listener import (
        handle_is_connected_to_internet_event,
    )

    handle_is_connected_to_internet_event(is_connected=True)
    thread_mock.assert_called_once_with(
        target=register_mock,
        args=(),
        daemon=True,
    )


def test_registers_if_connected_to_internet(app, mocker):
    mocker.patch(
        "pt_os_web_portal.device_registration.listener.state.get",
        side_effect=lambda section, value, fallback=None: "true",
    )
    mocker.patch(
        "pt_os_web_portal.device_registration.listener.device_is_registered",
        return_value=False,
    )
    register_mock = mocker.patch(
        "pt_os_web_portal.device_registration.listener.register_device",
    )
    thread_mock = mocker.patch(
        "pt_os_web_portal.device_registration.listener.Thread",
    )
    thread_mock.start = Mock()

    from pt_os_web_portal.device_registration.listener import (
        handle_is_connected_to_internet_event,
    )

    handle_is_connected_to_internet_event(is_connected=True)
    thread_mock.assert_called_once_with(
        target=register_mock,
        args=(),
        daemon=True,
    )


def test_registers_if_onboarding_is_complete(app, mocker):
    mocker.patch(
        "pt_os_web_portal.device_registration.listener.state.get",
        side_effect=lambda section, value, fallback=None: "true",
    )
    mocker.patch(
        "pt_os_web_portal.device_registration.listener.device_is_registered",
        return_value=False,
    )
    register_mock = mocker.patch(
        "pt_os_web_portal.device_registration.listener.register_device",
    )
    thread_mock = mocker.patch(
        "pt_os_web_portal.device_registration.listener.Thread",
    )
    thread_mock.start = Mock()

    from pt_os_web_portal.device_registration.listener import (
        handle_is_connected_to_internet_event,
    )

    handle_is_connected_to_internet_event(is_connected=True)
    thread_mock.assert_called_once_with(
        target=register_mock,
        args=(),
        daemon=True,
    )


def test_registration_retries_on_failure(app, mocker):
    mocker.patch(
        "pt_os_web_portal.device_registration.functions.get_registration_data",
        return_data="",
    )
    send_data_and_get_resp_mock = mocker.patch(
        "pt_os_web_portal.device_registration.functions.send_data_and_get_resp",
        side_effect=lambda data: (400, None),
    )

    sleep_mocker = SleepMocker()
    sleep_patch = mocker.patch(
        "pt_os_web_portal.device_registration.functions.sleep",
        side_effect=sleep_mocker.sleep,
    )

    from threading import Thread

    from pt_os_web_portal.device_registration.functions import (
        send_register_device_request,
    )

    t = Thread(target=send_register_device_request, args=(), daemon=True)
    t.start()

    sleep_patch.assert_called_once_with(30)
    assert sleep_patch.call_count == 1

    sleep_mocker.wait_until_next_iteration(sleep_patch)

    send_data_and_get_resp_mock.side_effect = lambda data: (200, {"success": True})
    assert sleep_patch.call_count == 2


def test_register_request(app, mocker):
    requests_mock = mocker.patch(
        "pt_os_web_portal.device_registration.functions.requests"
    )
    requests_mock.post = Mock()
    requests_mock.post.side_effect = lambda url, headers, data: (200, data)

    from pt_os_web_portal.device_registration.functions import (
        API_ENDPOINT,
        send_data_and_get_resp,
    )

    registration_data = {"key": "value"}
    send_data_and_get_resp(registration_data)

    requests_mock.post.assert_called_once_with(
        API_ENDPOINT,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        json=registration_data,
    )


def test_device_registration_is_retrieved_from_state(app, mocker):
    state_mock = mocker.patch("pt_os_web_portal.device_registration.functions.state")
    state_mock.get = Mock(side_effect=lambda section, name: "true")

    from pt_os_web_portal.device_registration.functions import device_is_registered

    assert device_is_registered() is True
    state_mock.get.assert_called_once_with("registration", "is_registered")


def test_registration_data_content(app, mocker):
    from pt_os_web_portal.device_registration.functions import get_registration_data

    assert set(
        (
            "serialNumber",
            "email",
            "privacyAgreement",
            "device",
            "osVersion",
            "updateRepo",
        )
    ) == set(get_registration_data().keys())
