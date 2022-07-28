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
        "pt_os_web_portal.backend.routes.vnc_clients",
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
        "pt_os_web_portal.backend.routes.vnc_clients",
        return_value=1,
    )

    response = app.post("/stop-vnc-wpa-gui", json={})
    assert response.status_code == 200
    assert response.data == b"OK"
    assert run_command_mock.call_count == 0


def test_wpa_gui_vnc_url_fails(app, mocker):
    connection_details_mock = mocker.patch(
        "pt_os_web_portal.backend.routes.vnc_connection_details",
        side_effect=Exception("oh oh"),
    )

    response = app.get("/vnc-wpa-gui-url")

    connection_details_mock.assert_called_once_with(99)

    assert response.status_code == 200
    assert response.data == b'{"url": ""}'


def test_wpa_gui_vnc_url_with_content(app, mocker):
    class DetailsMock:
        url = "pi-top.com"
        scheme = "http"
        port = "2112"
        path = "/blah"

    mocker.patch(
        "pt_os_web_portal.backend.routes.vnc_connection_details",
        return_value=DetailsMock,
    )

    response = app.get("/vnc-wpa-gui-url")

    assert response.status_code == 200
    assert response.data == b'{"url": "http://localhost:2112/blah"}'
