from flask import json


def test_python_sdk_docs_url_is_retrieved_with_sdk_cli(app, mocker):
    url = "http://docs.pi-top.com"
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.landing.run_command",
        return_value=url,
    )

    response = app.get("/python-sdk-docs-url")
    body = json.loads(response.data)

    run_mock.assert_called_once_with(
        "pi-top support links docs -p", timeout=10, check=False
    )
    assert response.status_code == 200
    assert "url" in body
    assert body["url"] == url


def test_open_chromium_uses_current_user(patch_modules, mocker):
    user = "any_user"
    url = "http://docs.pi-top.com"
    get_user_using_display_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.landing.get_user_using_display",
        return_value=user,
    )

    from pt_os_web_portal.backend.helpers.landing import get_chromium_command

    command = get_chromium_command(url)

    get_user_using_display_mock.assert_called_once()
    assert command.startswith(f"su {user}")


def test_open_webrenderer_uses_current_user(patch_modules, mocker):
    user = "any_user"
    url = "http://localhost/app"
    get_user_using_display_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.landing.get_user_using_display",
        return_value=user,
    )

    from pt_os_web_portal.backend.helpers.landing import get_webrenderer_command

    command = get_webrenderer_command(url, "")

    get_user_using_display_mock.assert_called_once()
    assert command.startswith(f"su {user}")


def test_open_chromium_starts_a_maximized_new_window(patch_modules, mocker):
    user = "any_user"
    url = "http://docs.pi-top.com"
    mocker.patch(
        "pt_os_web_portal.backend.helpers.landing.get_user_using_display",
        return_value=user,
    )

    from pt_os_web_portal.backend.helpers.landing import get_chromium_command

    command = get_chromium_command(url)

    assert f"chromium-browser --new-window --start-maximized {url}" in command


def test_open_python_sdk_docs(app, mocker):
    url = "http://docs.pi-top.com"
    user = "any_user"
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.landing.run_command_background",
        return_value="",
    )
    mocker.patch(
        "pt_os_web_portal.backend.helpers.landing.get_user_using_display",
        return_value=user,
    )
    mocker.patch(
        "pt_os_web_portal.backend.helpers.landing.python_sdk_docs_url",
        return_value=url,
    )

    response = app.post("/open-python-sdk-docs")
    assert response.status_code == 200
    assert response.data == b"OK"

    run_mock.assert_called_once_with(
        f'su {user} -c "chromium-browser --new-window --start-maximized {url}"'
    )


def test_open_further(app, mocker):
    url = "http://further.pi-top.com"
    user = "any_user"
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.landing.run_command_background",
        return_value="",
    )
    mocker.patch(
        "pt_os_web_portal.backend.helpers.landing.get_user_using_display",
        return_value=user,
    )
    get_further_url_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.landing.get_further_url",
        return_value=url,
    )

    response = app.post("/open-further")
    assert response.status_code == 200
    assert response.data == b"OK"

    get_further_url_mock.assert_called_once()
    run_mock.assert_called_once_with(
        f'su {user} -c "chromium-browser --new-window --start-maximized {url}"'
    )


def test_open_kb(app, mocker):
    url = "https://knowledgebase.pi-top.com/knowledge"
    user = "any_user"
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.landing.run_command_background",
        return_value="",
    )
    mocker.patch(
        "pt_os_web_portal.backend.helpers.landing.get_user_using_display",
        return_value=user,
    )

    response = app.post("/open-knowledge-base")
    assert response.status_code == 200
    assert response.data == b"OK"

    run_mock.assert_called_once_with(
        f'su {user} -c "chromium-browser --new-window --start-maximized {url}"'
    )


def test_open_forum(app, mocker):
    url = "https://forum.pi-top.com"
    user = "any_user"
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.landing.run_command_background",
        return_value="",
    )
    mocker.patch(
        "pt_os_web_portal.backend.helpers.landing.get_user_using_display",
        return_value=user,
    )

    response = app.post("/open-forum")
    assert response.status_code == 200
    assert response.data == b"OK"

    run_mock.assert_called_once_with(
        f'su {user} -c "chromium-browser --new-window --start-maximized {url}"'
    )


def test_open_os_download(app, mocker):
    url = "https://www.pi-top.com/resources/download-os"
    user = "any_user"
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.landing.run_command_background",
        return_value="",
    )
    mocker.patch(
        "pt_os_web_portal.backend.helpers.landing.get_user_using_display",
        return_value=user,
    )

    response = app.post("/open-os-download")
    assert response.status_code == 200
    assert response.data == b"OK"

    run_mock.assert_called_once_with(
        f'su {user} -c "chromium-browser --new-window --start-maximized {url}"'
    )


def test_open_updater(app, mocker):
    user = "any_user"
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.landing.run_command_background",
        return_value="",
    )
    mocker.patch(
        "pt_os_web_portal.backend.helpers.landing.get_user_using_display",
        return_value=user,
    )

    response = app.post("/open-updater")
    assert response.status_code == 200
    assert response.data == b"OK"

    run_mock.assert_called_once_with(
        f'su {user} -c "web-renderer --window-title=\\"pi-topOS Updater Tool\\" http://127.0.0.1/updater"'
    )


def test_open_wifi(app, mocker):
    user = "any_user"
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.landing.run_command_background",
        return_value="",
    )
    mocker.patch(
        "pt_os_web_portal.backend.helpers.landing.get_user_using_display",
        return_value=user,
    )

    response = app.post("/open-wifi")
    assert response.status_code == 200
    assert response.data == b"OK"

    run_mock.assert_called_once_with(
        f'su {user} -c "web-renderer --window-title=\\"pi-topOS Wi-Fi\\" http://127.0.0.1/wifi"'
    )
