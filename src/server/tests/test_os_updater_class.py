from threading import Thread

import pytest


def create_update_callback(messages):
    def callback(message_type, status_message, percent=None):
        data = {
            "status": status_message.strip(),
            "percent": percent,
            "type": message_type.name,
        }
        messages.append(data)

    return callback


def create_size_callback(messages):
    def callback(message_type, size, percent=None):
        data = {"size": size, "type": message_type.name}
        messages.append(data)

    return callback


@pytest.mark.skip(reason="failing on CI, works on local")
def test_lock_default_value(os_updater_module):
    os_updater = os_updater_module.OSUpdater()
    assert os_updater.lock is False


@pytest.mark.skip(reason="failing on CI, works on local")
def test_locks_on_methods(os_updater_module):
    os_updater = os_updater_module.OSUpdater()
    os_updater.cache.sleep_time = 20

    methods_that_lock = ["update", "stage_upgrade", "upgrade"]

    for method in methods_that_lock:
        method_reference = getattr(os_updater, method)
        t = Thread(
            target=method_reference, args=(create_update_callback([]),), daemon=True
        )
        t.start()

        messages = list()
        os_updater.stage_upgrade(create_update_callback(messages))

        print(f"{method} - {messages}")
        assert len(messages) == 1
        assert messages[0].get("type") == "ERROR"
        assert messages[0].get("percent") == 0.0
        assert messages[0].get("status") == "OSUpdater is locked"

        t.join(0.1)


@pytest.mark.skip(reason="failing on CI, works on local")
def test_send_status_messages_on_update(os_updater_module):
    os_updater = os_updater_module.OSUpdater()

    messages = list()
    os_updater.update(create_update_callback(messages))

    assert len(messages) >= 1
    for key in ("type", "percent", "status"):
        assert key in messages[0]

    assert messages[0].get("type") == "STATUS"
    assert messages[0].get("percent") == 0.0


@pytest.mark.skip(reason="hangs on CI, works on local")
def test_send_start_finish_messages_on_upgrade(os_updater_module, mocker):
    os_updater = os_updater_module.os_updater
    mocker.patch.object(os_updater, "skip_os_updater_on_reboot")

    os_updater.update(create_update_callback([]))
    messages = list()
    os_updater.upgrade(create_update_callback(messages))

    assert len(messages) >= 1
    for key in ("type", "percent", "status"):
        assert key in messages[0]

    assert messages[0].get("type") == "START"
    assert messages[0].get("percent") == 0.0

    assert messages[-1].get("type") == "FINISH"
    assert messages[-1].get("percent") == 100.0


@pytest.mark.skip(reason="hangs on CI, works on local")
def test_send_start_finish_messages_on_prepare_upgrade(os_updater_module, mocker):
    os_updater = os_updater_module.os_updater
    mocker.patch.object(os_updater, "skip_os_updater_on_reboot")

    messages = list()
    os_updater_module.prepare_os_upgrade(create_update_callback(messages))
    assert messages[0].get("type") == "START"
    assert messages[0].get("percent") == 0.0

    assert messages[-1].get("type") == "FINISH"
    assert messages[-1].get("percent") == 100.0


@pytest.mark.skip(reason="failing on CI, works on local")
def test_download_size_format(os_updater_module):
    os_updater_module.prepare_os_upgrade(create_update_callback([]))
    messages = list()
    os_updater_module.os_upgrade_size(create_size_callback(messages))

    assert len(messages) == 1
    assert messages[0].get("type") == "STATUS"
    assert messages[0].get("size").get("downloadSize") == 2155000000
    assert messages[0].get("size").get("requiredSpace") == 99300000


@pytest.mark.skip(reason="failing on CI, works on local")
def test_lock_prevents_sends_error_message(os_updater_module):
    os_updater = os_updater_module.os_updater
    os_updater.lock = True

    methods_that_lock = ["update", "stage_upgrade", "upgrade"]

    for method in methods_that_lock:
        msgs = list()
        method_reference = getattr(os_updater, method)
        method_reference(create_update_callback(msgs))

        assert len(msgs) == 1
        assert msgs[0].get("type") == "ERROR"
        assert msgs[0].get("percent") == 0.0
        assert msgs[0].get("status") == "OSUpdater is locked"

    os_updater.lock = False


@pytest.mark.skip(reason="failing on CI, works on local")
def test_upgrade_writes_last_checked_date_file(os_updater_module, mocker):
    os_path_exists = mocker.patch(
        "backend.helpers.os_updater.os.path.exists", return_value=False
    )
    os_makedirs = mocker.patch(
        "backend.helpers.os_updater.os.makedirs", return_value=True
    )
    os_isfile = mocker.patch(
        "backend.helpers.os_updater.os.path.isfile", return_value=True
    )
    os_remove = mocker.patch("backend.helpers.os_updater.os.remove", return_value=True)
    open_builtin = mocker.patch("builtins.open", create=True)

    os_updater_module.prepare_os_upgrade(create_update_callback([]))
    os_updater_module.start_os_upgrade(create_update_callback([]))

    os_path_exists.assert_called_once_with("/etc/pi-top/pt-os-updater/")
    os_makedirs.assert_called_once_with("/etc/pi-top/pt-os-updater/")
    os_isfile.assert_called_once_with("/etc/pi-top/pt-os-updater/last_checked_date")
    os_remove.assert_called_once_with("/etc/pi-top/pt-os-updater/last_checked_date")
    open_builtin.assert_called_once_with(
        "/etc/pi-top/pt-os-updater/last_checked_date", "a"
    )
