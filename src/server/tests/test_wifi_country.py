from flask import json

from tests.data.wifi_country_data import wifi_country_list, country_code_sample
from tests.utils import dotdict


def test_list_wifi_countries_gets_correct_formats(app):
    response = app.get('/list-wifi-countries')

    assert json.loads(response.data) == wifi_country_list
    assert response.status_code == 200


def test_current_wifi_country_uses_raspi_config(app, mocker):
    environ_mock = mocker.patch('onboarding.helpers.command_runner.environ')
    environ_mock.copy = dict
    run_mock = mocker.patch('onboarding.helpers.command_runner.run',
                            return_value=dotdict({'stdout': country_code_sample, 'stderr': b'', 'returncode': 0}))

    response = app.get('/current-wifi-country')
    body = json.loads(response.data)

    run_mock.assert_called_once_with(['raspi-config', 'nonint', 'get_wifi_country'],
                                     capture_output=True, check=False, env={'DISPLAY': ':0'}, timeout=5)

    assert response.status_code == 200
    assert body == str(country_code_sample, 'UTF8')


def test_set_wifi_country_success(app, mocker):
    valid_country_code = 'CL'
    environ_mock = mocker.patch('onboarding.helpers.command_runner.environ')
    environ_mock.copy = dict
    run_mock = mocker.patch('onboarding.helpers.command_runner.run',
                            return_value=dotdict({'stdout': b'', 'stderr': b'', 'returncode': 200}))

    successful_response = app.post(
        '/set-wifi-country', json={'wifi_country': valid_country_code})
    run_mock.assert_called_once_with(['raspi-config', 'nonint', 'do_wifi_country', valid_country_code],
                                     capture_output=True, check=True, env={'DISPLAY': ':0'}, timeout=5
                                     )
    assert successful_response.status_code == 200
    assert successful_response.data == b"OK"


def test_set_wifi_country_failure_wrong_type(app):
    validation_error_response = app.post(
        '/set-wifi-country', json={'wifi_country': 1})
    assert validation_error_response.status_code == 422


def test_set_wifi_country_failure_invalid_code(app):
    no_locale_found_error = app.post(
        '/set-wifi-country', json={'wifi_country': 'fake-country-code'})
    assert no_locale_found_error.status_code == 400
