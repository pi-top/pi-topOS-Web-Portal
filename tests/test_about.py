from enum import Enum

from flask import json

from tests.utils import dotdict


class DeviceNameMock(Enum):
    pi_top_4 = "pi-top [4]"


pitopOS_info_response = {
    "build_repo": "unstable",
    "build_date": "2022-02-02",
    "build_number": 3,
}


def test_about_response_format(app, mocker):
    pt_os_info_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.about.get_pitopOS_info",
        return_value=dotdict(pitopOS_info_response),
    )

    device_type_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.about.device_type",
        return_value="pi_top_4",
    )

    response = app.get("/about-device")
    body = json.loads(response.data)

    pt_os_info_mock.assert_called_once()
    device_type_mock.assert_called_once()

    assert response.status_code == 200
    assert set(("build_repo", "build_date", "build_number", "device")) == set(
        body.keys()
    )


def test_about_includes_serial_number_if_device_is_pitop_4(app, mocker):
    mocker.patch(
        "pt_os_web_portal.backend.helpers.about.get_pitopOS_info",
        return_value=dotdict(pitopOS_info_response),
    )
    mocker.patch(
        "pt_os_web_portal.backend.helpers.about.DeviceName.pi_top_4.value",
        DeviceNameMock.pi_top_4.value,
    )
    mocker.patch(
        "pt_os_web_portal.backend.helpers.about.device_type",
        side_effect=lambda: DeviceNameMock.pi_top_4.value,
    )

    response = app.get("/about-device")
    body = json.loads(response.data)

    assert response.status_code == 200
    assert set(
        ("build_repo", "build_date", "build_number", "device", "serial_number")
    ) == set(body.keys())


def test_about_on_error_returns_formatted_message(app, mocker):
    mocker.patch(
        "pt_os_web_portal.backend.helpers.about.get_pitopOS_info",
        side_effect=Exception("Error fetching OS info"),
    )

    response = app.get("/about-device")
    body = json.loads(response.data)

    assert response.status_code == 200
    assert set(("build_repo", "build_date", "build_number", "device")) == set(
        body.keys()
    )
    for key in body:
        assert body.get(key) == ""
