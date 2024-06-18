from unittest.mock import call


def test_start_route(app, mocker):
    run_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.system.run_command", return_value=""
    )

    response = app.post("/start-vnc-wifi-advanced-connection", json={})

    run_command_mock.assert_has_calls(
        [
            call(
                "systemctl is-active pt-os-web-portal-vnc-advanced-wifi.service",
                timeout=5,
                check=False,
            ),
            call(
                "systemctl restart pt-os-web-portal-vnc-advanced-wifi.service",
                timeout=10,
                check=False,
            ),
        ],
        any_order=False,
    )

    assert response.status_code == 200
    assert response.data == b"OK"


def test_stop_route(app, mocker):
    run_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.system.run_command", return_value=""
    )
    clients_mock = mocker.patch(
        "pt_os_web_portal.backend.routes.vnc_clients",
        return_value=0,
    )

    response = app.post("/stop-vnc-wifi-advanced-connection", json={})

    clients_mock.assert_called_once()
    run_command_mock.assert_called_once_with(
        "systemctl stop pt-os-web-portal-vnc-advanced-wifi.service",
        timeout=10,
        check=False,
    )

    assert response.status_code == 200
    assert response.data == b"OK"


def test_stop_route_when_clients_still_connected(app, mocker):
    run_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.system.run_command", return_value=""
    )
    clients_mock = mocker.patch(
        "pt_os_web_portal.backend.routes.vnc_clients",
        return_value=1,
    )

    response = app.post("/stop-vnc-wifi-advanced-connection", json={})

    clients_mock.assert_called_once()
    run_command_mock.assert_not_called()

    assert response.status_code == 200
    assert response.data == b"OK"


def test_url_route(app, mocker):
    connection_details_mock = mocker.patch(
        "pt_os_web_portal.backend.routes.get_advanced_wifi_gui_url",
        return_value="http://localhost:123/456",
    )

    response = app.get("/vnc-wifi-advanced-connection-url")

    assert response.status_code == 200
    assert response.data == b'{"url": "http://localhost:123/456"}'
    connection_details_mock.assert_called_once_with(host_url="localhost")


def test_url_route_on_failure(app, mocker):
    connection_details_mock = mocker.patch(
        "pt_os_web_portal.backend.routes.get_advanced_wifi_gui_url",
        side_effect=Exception("oh oh"),
    )

    response = app.get("/vnc-wifi-advanced-connection-url")

    assert response.status_code == 200
    assert response.data == b'{"url": ""}'
    connection_details_mock.assert_called_once_with(host_url="localhost")


def test_start_command(mocker):
    start_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui.start",
    )
    run_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui.run_command"
    )

    # There's no active advanced wifi VNC gui running
    details_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui.connection_details"
    )
    mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui.is_url",
        return_value=False,
    )

    from pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui import (
        start_advanced_wifi_gui,
    )

    start_advanced_wifi_gui()

    details_command_mock.assert_called_once_with(99)
    run_command_mock.assert_called_once()
    start_command_mock.assert_called_with(
        background_colour="white",
        display_id=99,
        height=800,
        run="nm-connection-editor",
        width=1000,
        with_window_manager=True,
    )


def test_start_command_uses_wpa_gui_if_dhcpcd_is_running(mocker):
    start_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui.start",
    )
    run_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui.run_command",
        return_value="active",
    )

    # There's no active advanced wifi VNC gui running
    details_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui.connection_details"
    )
    mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui.is_url",
        return_value=False,
    )

    from pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui import (
        start_advanced_wifi_gui,
    )

    start_advanced_wifi_gui()

    details_command_mock.assert_called_once_with(99)
    run_command_mock.assert_called_once()
    start_command_mock.assert_called_with(
        background_colour="white",
        display_id=99,
        height=800,
        run="wpa_gui",
        width=1000,
        with_window_manager=True,
    )


def test_stop_command_stops_if_no_clients_are_connected(mocker):
    stop_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui.stop",
    )
    clients_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui.clients",
        return_value=0,
    )

    from pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui import (
        stop_advanced_wifi_gui,
    )

    stop_advanced_wifi_gui()

    clients_mock.assert_called_once_with(99)
    stop_command_mock.assert_called_once_with(display_id=99)


def test_stop_command_doesnt_stop_if_clients_are_connected(mocker):
    stop_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui.stop",
    )
    clients_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui.clients",
        return_value=1,
    )

    from pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui import (
        stop_advanced_wifi_gui,
    )

    stop_advanced_wifi_gui()

    clients_mock.assert_called_once_with(99)
    stop_command_mock.assert_not_called()


def test_on_failure_to_determine_vnc_url(mocker):
    connection_details_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui.connection_details",
        side_effect=Exception("oh oh"),
    )

    from pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui import (
        get_advanced_wifi_gui_url,
    )

    url = get_advanced_wifi_gui_url("this will fail anyway")
    connection_details_mock.assert_called_once_with(99)
    assert url == ""


def test_on_valid_vnc_url(app, mocker):
    class DetailsMock:
        url = "pi-top.com"
        scheme = "http"
        port = "2112"
        path = "/blah"

    connection_details_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui.connection_details",
        return_value=DetailsMock,
    )

    from pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui import (
        get_advanced_wifi_gui_url,
    )

    url = get_advanced_wifi_gui_url("192.168.64.1")

    assert (
        url
        == f"{DetailsMock.scheme}://192.168.64.1:{DetailsMock.port}{DetailsMock.path}"
    )
    connection_details_mock.assert_called_once_with(99)
