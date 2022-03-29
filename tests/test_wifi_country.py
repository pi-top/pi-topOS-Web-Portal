from flask import json

from tests.data.wifi_country_data import country_code_sample, wifi_country_list


def test_list_wifi_countries_gets_correct_formats(app):
    response = app.get("/list-wifi-countries")

    assert json.loads(response.data) == wifi_country_list
    assert response.status_code == 200


def test_current_wifi_country_uses_raspi_config(app, mocker):
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.wifi_country.run_command",
        return_value=country_code_sample,
    )

    response = app.get("/current-wifi-country")
    body = json.loads(response.data)

    run_mock.assert_called_once_with(
        "raspi-config nonint get_wifi_country",
        timeout=5,
        check=False,
    )

    assert response.status_code == 200
    assert body == country_code_sample


def test_set_wifi_country_success(app, mocker):
    valid_country_code = "CL"
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.wifi_country.run_command",
        return_value="",
    )

    successful_response = app.post(
        "/set-wifi-country", json={"wifi_country": valid_country_code}
    )
    run_mock.assert_called_once_with(
        f"raspi-config nonint do_wifi_country {valid_country_code}",
        timeout=5,
    )
    assert successful_response.status_code == 200
    assert successful_response.data == b"OK"


def test_set_wifi_country_failure_wrong_type(app):
    validation_error_response = app.post("/set-wifi-country", json={"wifi_country": 1})
    assert validation_error_response.status_code == 422


def test_set_wifi_country_failure_invalid_code(app):
    no_locale_found_error = app.post(
        "/set-wifi-country", json={"wifi_country": "fake-country-code"}
    )
    assert no_locale_found_error.status_code == 400
