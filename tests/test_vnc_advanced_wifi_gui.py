def test_start(app, mocker):
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

    response = app.post("/start-vnc-wifi-advanced-connection", json={})

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

    assert response.status_code == 200
    assert response.data == b"OK"


def test_start_uses_wpa_gui_if_dhcpcd_is_running(app, mocker):
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

    response = app.post("/start-vnc-wifi-advanced-connection", json={})

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

    assert response.status_code == 200
    assert response.data == b"OK"


def test_stops_if_no_clients_are_connected(app, mocker):
    stop_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui.stop",
    )
    clients_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui.clients",
        return_value=0,
    )

    response = app.post("/stop-vnc-wifi-advanced-connection", json={})

    clients_mock.assert_called_once_with(99)
    stop_command_mock.assert_called_once_with(display_id=99)

    assert response.status_code == 200
    assert response.data == b"OK"


def test_doesnt_stop_if_clients_are_connected(app, mocker):
    stop_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui.stop",
    )
    clients_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui.clients",
        return_value=1,
    )

    response = app.post("/stop-vnc-wifi-advanced-connection", json={})

    clients_mock.assert_called_once_with(99)
    stop_command_mock.assert_not_called()

    assert response.status_code == 200
    assert response.data == b"OK"


def test_on_failure_to_determine_vnc_url(app, mocker):
    connection_details_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.vnc_advanced_wifi_gui.connection_details",
        side_effect=Exception("oh oh"),
    )

    response = app.get("/vnc-wifi-advanced-connection-url")

    connection_details_mock.assert_called_once_with(99)

    assert response.status_code == 200
    assert response.data == b'{"url": ""}'


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

    response = app.get("/vnc-wifi-advanced-connection-url")

    assert response.status_code == 200
    assert response.data == b'{"url": "http://localhost:2112/blah"}'
    connection_details_mock.assert_called_once_with(99)
