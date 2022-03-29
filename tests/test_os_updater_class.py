from json import loads as jloads
from threading import Thread


class WsMock:
    def __init__(self):
        self.messages = []
        self.closed = False

    def send(self, data):
        self.messages.append(jloads(data))


def test_lock_default_value(patch_modules):
    from pt_os_web_portal.os_updater import OSUpdater

    os_updater = OSUpdater()
    assert os_updater.active_backend.lock is False


def test_send_error_message_when_locked(patch_modules, mocker):
    mocker.patch(
        "pt_os_web_portal.os_updater.updater.is_system_clock_synchronized",
        return_value=True,
    )

    from pt_os_web_portal.os_updater import OSUpdater

    os_updater = OSUpdater()
    os_updater.active_backend.cache.sleep_time = 0.1
    ws_mock = WsMock()
    # Register WS client with app
    os_updater.state(ws_mock)

    for method in ["update_sources", "stage_packages", "start_os_upgrade"]:
        method_reference = getattr(os_updater, method)

        t = Thread(target=method_reference, args=(), daemon=True)
        t.start()

        # Call method again to make sure the updater is locked
        method_reference(ws_mock)

        # Find the error message
        error_message = {}
        for message in ws_mock.messages:
            if message["payload"]["status"] == "ERROR":
                error_message = message
                break

        assert error_message["payload"]["status"] == "ERROR"
        assert error_message["payload"]["percent"] == 0.0
        assert error_message["payload"]["message"] == "OsUpdateManager is locked"

        # wait until unlocked
        os_updater.stop()
        ws_mock.messages.clear()


def test_send_status_messages_on_state(patch_modules, mocker):
    mocker.patch(
        "pt_os_web_portal.os_updater.updater.is_system_clock_synchronized",
        return_value=True,
    )
    from pt_os_web_portal.os_updater import OSUpdater

    os_updater = OSUpdater()

    ws_mock = WsMock()
    os_updater.state(ws_mock)

    assert len(ws_mock.messages) == 1
    assert ws_mock.messages[0].get("type") == "STATE"

    for key in ("busy", "clients", "status"):
        assert key in ws_mock.messages[0].get("payload")


def test_send_status_messages_on_update(patch_modules, mocker):
    mocker.patch(
        "pt_os_web_portal.os_updater.updater.is_system_clock_synchronized",
        return_value=True,
    )

    from pt_os_web_portal.os_updater import OSUpdater

    os_updater = OSUpdater()
    os_updater.active_backend.cache.sleep_time = 0

    ws_mock = WsMock()
    os_updater.state(ws_mock)
    ws_mock.messages.clear()

    os_updater.update_sources(ws_mock)

    assert len(ws_mock.messages) >= 1
    assert ws_mock.messages[0].get("type") == "UPDATE_SOURCES"

    for key in ("message", "percent", "status"):
        assert key in ws_mock.messages[0].get("payload")


def test_send_start_finish_messages_on_update_sources(patch_modules, mocker):
    mocker.patch(
        "pt_os_web_portal.os_updater.updater.is_system_clock_synchronized",
        return_value=True,
    )

    from pt_os_web_portal.os_updater import OSUpdater

    os_updater = OSUpdater()
    os_updater.active_backend.cache.sleep_time = 0

    ws_mock = WsMock()
    os_updater.state(ws_mock)
    ws_mock.messages.clear()

    os_updater.update_sources(ws_mock)

    assert len(ws_mock.messages) >= 1
    assert ws_mock.messages[0].get("type") == "UPDATE_SOURCES"

    for key in ("message", "percent", "status"):
        assert key in ws_mock.messages[0].get("payload")

    assert ws_mock.messages[0].get("payload", {}).get("status") == "START"
    assert ws_mock.messages[0].get("payload", {}).get("percent") == 0.0

    assert ws_mock.messages[-1].get("payload", {}).get("status") == "FINISH"
    assert ws_mock.messages[-1].get("payload", {}).get("percent") == 100.0


def test_send_start_finish_messages_on_upgrade(patch_modules, mocker):
    mocker.patch(
        "pt_os_web_portal.os_updater.updater.is_system_clock_synchronized",
        return_value=True,
    )

    from pt_os_web_portal.os_updater import OSUpdater

    os_updater = OSUpdater()
    os_updater.active_backend.cache.sleep_time = 0

    ws_mock = WsMock()
    os_updater.state(ws_mock)
    ws_mock.messages.clear()

    os_updater.start_os_upgrade(ws_mock)

    assert len(ws_mock.messages) >= 1
    assert ws_mock.messages[0].get("type") == "OS_UPGRADE"

    for key in ("message", "percent", "status"):
        assert key in ws_mock.messages[0].get("payload")

    assert ws_mock.messages[0].get("payload", {}).get("status") == "START"
    assert ws_mock.messages[0].get("payload", {}).get("percent") == 0.0

    assert ws_mock.messages[-1].get("payload", {}).get("status") == "FINISH"
    assert ws_mock.messages[-1].get("payload", {}).get("percent") == 100.0


def test_send_start_finish_messages_on_stage_packages(patch_modules, mocker):
    mocker.patch(
        "pt_os_web_portal.os_updater.updater.is_system_clock_synchronized",
        return_value=True,
    )
    from pt_os_web_portal.os_updater import OSUpdater

    os_updater = OSUpdater()
    os_updater.active_backend.cache.sleep_time = 0

    ws_mock = WsMock()
    os_updater.state(ws_mock)
    ws_mock.messages.clear()

    os_updater.stage_packages(ws_mock)

    assert len(ws_mock.messages) >= 1
    assert ws_mock.messages[0].get("type") == "OS_PREPARE_UPGRADE"

    assert ws_mock.messages[0].get("payload", {}).get("status") == "START"
    assert ws_mock.messages[0].get("payload", {}).get("percent") == 0.0

    assert ws_mock.messages[-1].get("payload", {}).get("status") == "FINISH"
    assert ws_mock.messages[-1].get("payload", {}).get("percent") == 100.0


def test_download_size_format(patch_modules, mocker):
    mocker.patch(
        "pt_os_web_portal.os_updater.updater.is_system_clock_synchronized",
        return_value=True,
    )
    from pt_os_web_portal.os_updater import OSUpdater

    os_updater = OSUpdater()
    os_updater.active_backend.cache.sleep_time = 0

    ws_mock = WsMock()
    os_updater.state(ws_mock)
    ws_mock.messages.clear()

    os_updater.upgrade_size(ws_mock)

    assert len(ws_mock.messages) == 1
    assert ws_mock.messages[0].get("type") == "SIZE"
    assert ws_mock.messages[0].get("payload", {}).get("status") == "STATUS"
    assert (
        ws_mock.messages[0].get("payload", {}).get("size").get("downloadSize")
        == 2155000000
    )
    assert (
        ws_mock.messages[0].get("payload", {}).get("size").get("requiredSpace")
        == 99300000
    )
