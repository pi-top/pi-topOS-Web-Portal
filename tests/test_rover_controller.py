from tests.utils import dotdict


def test_rover_controller_start(app, mocker):
    run_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.system.run_command", return_value=""
    )

    response = app.post("/rover-controller-start", json={})

    run_command_mock.assert_called_once_with(
        "systemctl start pt-os-web-portal-rover-controller.service",
        timeout=10,
        check=False,
    )

    assert response.status_code == 200
    assert response.data == b"OK"


def test_rover_controller_stop(app, mocker):
    run_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.system.run_command",
        return_value="",
    )

    response = app.post("/rover-controller-stop", json={})

    run_command_mock.assert_called_once_with(
        "systemctl stop pt-os-web-portal-rover-controller.service",
        timeout=10,
        check=False,
    )

    assert response.status_code == 200
    assert response.data == b"OK"


def test_rover_controller_status_inactive(app, mocker):
    run_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.system.run_command",
        return_value="inactive\n",
    )

    response = app.get("/rover-controller-status")

    run_command_mock.assert_called_once_with(
        "systemctl is-active pt-os-web-portal-rover-controller.service",
        timeout=1,
        check=False,
    )

    assert response.status_code == 200
    assert response.data == b'{"status": "inactive"}'


def test_rover_controller_status_failed(app, mocker):
    run_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.system.run_command",
        return_value="failed\n",
    )

    response = app.get("/rover-controller-status")

    run_command_mock.assert_called_once_with(
        "systemctl is-active pt-os-web-portal-rover-controller.service",
        timeout=1,
        check=False,
    )

    assert response.status_code == 200
    assert response.data == b'{"status": "failed"}'


def test_rover_controller_status_controller_starting(app, mocker):
    run_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.system.run_command",
        return_value="active",
    )
    # requests.get raises an exception when controller is still starting
    requests_get_mock = mocker.patch(
        "pt_os_web_portal.backend.routes.requests.get", side_effect=Exception()
    )

    response = app.get("/rover-controller-status")

    run_command_mock.assert_called_once_with(
        "systemctl is-active pt-os-web-portal-rover-controller.service",
        timeout=1,
        check=False,
    )
    requests_get_mock.assert_called_once()

    assert response.status_code == 200
    assert response.data == b'{"status": "inactive"}'


def test_rover_controller_status_active(app, mocker):
    run_command_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.system.run_command",
        return_value="active",
    )
    requests_get_mock = mocker.patch(
        "pt_os_web_portal.backend.routes.requests.get",
        return_value=dotdict({"status_code": 200}),
    )

    response = app.get("/rover-controller-status")

    run_command_mock.assert_called_once_with(
        "systemctl is-active pt-os-web-portal-rover-controller.service",
        timeout=1,
        check=False,
    )

    requests_get_mock.assert_called_once()
    url = requests_get_mock.call_args_list[0][0][0]
    assert url == "http://localhost:8070"

    assert response.status_code == 200
    assert response.data == b'{"status": "active"}'
