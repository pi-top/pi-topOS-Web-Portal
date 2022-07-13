from unittest.mock import call


def test_wpa_gui_vnc_start(app, mocker):
    run_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.system.run_command", return_value=""
    )

    response = app.post("/start-vnc-wpa-gui", json={})

    run_command_mock.assert_has_calls(
        [
            call(
                "systemctl is-active pt-os-web-portal-wpa-gui-vnc.service",
                timeout=5,
                check=False,
            ),
            call(
                "systemctl restart pt-os-web-portal-wpa-gui-vnc.service",
                timeout=10,
                check=False,
            ),
        ],
        any_order=False,
    )

    assert response.status_code == 200
    assert response.data == b"OK"


def test_wpa_gui_vnc_stops_if_no_clients_are_connected(app, mocker):
    run_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.system.run_command",
        return_value="",
    )
    mocker.patch(
        "pt_os_web_portal.backend.routes.vnc_wpa_gui_clients",
        return_value=0,
    )

    response = app.post("/stop-vnc-wpa-gui", json={})

    run_command_mock.assert_called_once_with(
        "systemctl stop pt-os-web-portal-wpa-gui-vnc.service",
        timeout=10,
        check=False,
    )

    assert response.status_code == 200
    assert response.data == b"OK"


def test_wpa_gui_vnc_doesnt_stop_if_clients_are_connected(app, mocker):
    run_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.system.run_command",
        return_value="",
    )
    mocker.patch(
        "pt_os_web_portal.backend.routes.vnc_wpa_gui_clients",
        return_value=1,
    )

    response = app.post("/stop-vnc-wpa-gui", json={})
    assert run_command_mock.call_count == 0
    assert response.status_code == 200
    assert response.data == b"OK"


def test_wpa_gui_vnc_url_empty(app, mocker):
    run_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc.run_command",
        side_effect=Exception("oh oh"),
    )

    response = app.get("/vnc-wpa-gui-url")

    run_command_mock.assert_called_once_with(
        "/usr/bin/pt-web-vnc url --display-id 99", check=True, timeout=10
    )

    assert response.status_code == 200
    assert response.data == b'{"url": ""}'


def test_wpa_gui_vnc_url_with_content(app, mocker):
    run_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc.run_command",
        return_value="http://pi-top.com",
    )

    response = app.get("/vnc-wpa-gui-url")

    run_command_mock.assert_called_once_with(
        "/usr/bin/pt-web-vnc url --display-id 99", check=True, timeout=10
    )

    assert response.status_code == 200
    assert response.data == b'{"url": "http://pi-top.com"}'


def test_wpa_gui_vnc_clients_command(mocker):
    run_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc.run_command",
        return_value="",
    )
    from pt_os_web_portal.backend.helpers.vnc import vnc_wpa_gui_clients

    vnc_wpa_gui_clients()

    assert run_command_mock.call_count == 1
    run_command_mock.assert_called_once_with(
        "/usr/bin/pt-web-vnc clients --display-id 99",
        check=True,
        timeout=10,
        log_errors=False,
    )
