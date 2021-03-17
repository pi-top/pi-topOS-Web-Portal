from os.path import isfile

from helpers.registration import pi_top_registration_txt
from tests.data.finalise_data import cmd_line_before, cmd_line_after
from tests.utils import assert_file_content


def test_set_registration_failure_wrong_type(app):
    validation_error_response = app.post(
        '/set-registration', json={'email': 0})
    assert validation_error_response.status_code == 422


def test_set_registration_failure_invalid_payload(app):
    response = app.post(
        '/set-registration', json={'not_an_email': 1})

    assert response.status_code == 422


def test_set_registration_success(app, restore_files):
    response = app.post(
        '/set-registration', json={'email': 'hey@yo.com'})

    assert response.status_code == 200
    assert response.data == b"OK"


def test_set_registration_creates_a_file(app, restore_files):
    email_str = 'hey@yo.com'
    app.post('/set-registration', json={'email': email_str})
    assert isfile(pi_top_registration_txt()) == True
    assert_file_content('onboarding/test/registration.txt', email_str)
