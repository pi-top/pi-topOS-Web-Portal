def test_set_registration_failure_wrong_type(app):
    validation_error_response = app.post("/set-registration", json={"email": 0})
    assert validation_error_response.status_code == 422


def test_set_registration_failure_invalid_payload(app):
    response = app.post("/set-registration", json={"not_an_email": 1})

    assert response.status_code == 422


def test_set_registration_success(app):
    response = app.post("/set-registration", json={"email": "hey@yo.com"})

    assert response.status_code == 200
    assert response.data == b"OK"


def test_set_registration_updates_state(app, mocker):
    email_str = "hey@yo.com"

    state_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.registration.state.set",
        return_value="",
    )

    app.post("/set-registration", json={"email": email_str})

    state_mock.assert_called_once_with("registration", "email", email_str)
