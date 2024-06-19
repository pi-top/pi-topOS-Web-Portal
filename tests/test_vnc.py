def test_desktop_vnc_url_fails(app, mocker):
    connection_details_mock = mocker.patch(
        "pt_os_web_portal.backend.routes.vnc_connection_details",
        side_effect=Exception("oh oh"),
    )

    response = app.get("/vnc-desktop-url")

    assert response.status_code == 200
    assert response.data == b'{"url": ""}'
    connection_details_mock.assert_called_once_with(0)


def test_vnc_desktop_url_with_content(app, mocker):
    class DetailsMock:
        url = "pi-top.com"
        scheme = "http"
        port = "2112"
        path = "/desktop"

    connection_details_mock = mocker.patch(
        "pt_os_web_portal.backend.routes.vnc_connection_details",
        return_value=DetailsMock,
    )

    response = app.get("/vnc-desktop-url")

    assert response.status_code == 200
    assert response.data == b'{"url": "http://localhost:2112/desktop"}'
    connection_details_mock.assert_called_once_with(0)
