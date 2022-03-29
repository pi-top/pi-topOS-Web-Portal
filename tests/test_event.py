from unittest.mock import Mock


def test_event_supports_multiple_subscribers(patch_modules):
    from pt_os_web_portal.event import AppEvents, subscribe, subscribers

    event = AppEvents.READY_TO_BE_A_MAKER
    subscribe_times = 5
    for _ in range(subscribe_times):
        subscribe(event, lambda x: x)

    assert len(subscribers[event]) == subscribe_times


def test_post_event_runs_subscribers_callbacks(patch_modules):
    from pt_os_web_portal.event import AppEvents, post_event, subscribe

    fn = Mock(side_effect=lambda x: x)
    data = {"key": "value"}

    subscribe(AppEvents.OS_UPDATE_SOURCES, fn)
    post_event(AppEvents.OS_UPDATE_SOURCES, data)

    fn.assert_called_once_with(data)


def test_subscribes_callables_only(patch_modules):
    from pt_os_web_portal.event import AppEvents, subscribe, subscribers

    subscribe(AppEvents.OS_UPDATER_PREPARE, 1)
    subscribe(AppEvents.OS_UPDATER_PREPARE, "hi")
    subscribe(AppEvents.OS_UPDATER_PREPARE, lambda x: x)

    assert len(subscribers[AppEvents.OS_UPDATER_PREPARE]) == 1
