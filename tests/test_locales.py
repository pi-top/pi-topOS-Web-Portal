from flask import json

from tests.data.locale_data import default_locale, formatted_locales


def test_list_locales_supported_gets_correct_formats(app):
    response = app.get("/list-locales-supported")
    body = json.loads(response.data)

    assert response.status_code == 200
    assert body == formatted_locales


def test_current_locale(app):
    response = app.get("/current-locale")
    body = json.loads(response.data)

    assert response.status_code == 200
    assert body == default_locale


def test_set_locale_success(app, mocker):
    valid_locale_code = "en_US"
    environ_mock = mocker.patch("backend.helpers.command_runner.environ")
    environ_mock.copy = dict
    run_mock = mocker.patch("backend.helpers.command_runner.run")

    successful_response = app.post(
        "/set-locale", json={"locale_code": valid_locale_code}
    )
    run_mock.assert_called_once_with(
        ["raspi-config", "nonint", "do_change_locale", valid_locale_code + ".UTF-8"],
        timeout=30,
        capture_output=False,
        check=True,
        env={"DISPLAY": ":0"},
    )
    assert successful_response.status_code == 200
    assert successful_response.data == b"OK"


def test_set_locale_failure_wrong_type(app):
    validation_error_response = app.post("/set-locale", json={"locale_code": 1})
    assert validation_error_response.status_code == 422


def test_set_locale_failure_invalid_code(app):
    no_locale_found_error = app.post(
        "/set-locale", json={"locale_code": "fake-locale-code"}
    )
    assert no_locale_found_error.status_code == 400
