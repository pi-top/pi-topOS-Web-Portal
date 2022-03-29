from flask import json

from tests.data.timezone_data import timezones_list


def test_list_timezones_correct_format(app):
    response = app.get("/list-timezones")

    assert json.loads(response.data) == timezones_list
    assert response.status_code == 200


def test_current_timezone(app):
    response = app.get("/current-timezone")
    body = json.loads(response.data)
    assert response.status_code == 200
    assert body == "Europe/London"


def test_set_locale_success(app, mocker):
    valid_timezone = "America/Santiago"

    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.timezone.run_command",
        return_value="",
    )

    successful_response = app.post("/set-timezone", json={"timezone": valid_timezone})
    run_mock.assert_called_once_with(
        f"raspi-config nonint do_change_timezone {valid_timezone}",
        timeout=5,
    )
    assert successful_response.status_code == 200
    assert successful_response.data == b"OK"


def test_set_locale_failure_wrong_type(app):
    validation_error_response = app.post("/set-timezone", json={"timezone": 1})
    assert validation_error_response.status_code == 422


def test_set_locale_failure_invalid_code(app):
    no_locale_found_error = app.post(
        "/set-timezone", json={"timezone": "fake-timezone"}
    )
    assert no_locale_found_error.status_code == 400
