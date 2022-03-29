def send_static_file_mock(filename):
    return "Mocked content", 200


def test_redirect_on_404(app):
    response = app.get("/non-existant-route", follow_redirects=False)
    assert response.status_code == 302
    assert response.location == "http://localhost/"


def test_404_redirect_to_onboarding_if_not_completed(app, mocker):
    mocker.patch(
        "pt_os_web_portal.backend.routes.onboarding_completed", return_value=False
    )
    mocker.patch.object(app.application, "send_static_file", send_static_file_mock)

    response = app.get("/non-existant-route", follow_redirects=False)

    # Request redirects to /
    assert response.status_code == 302
    assert response.location == "http://localhost/"

    response = app.get(response.location, follow_redirects=False)

    # Request redirects to /onboarding
    assert response.status_code == 302
    assert response.location == "http://localhost/onboarding"

    response = app.get(response.location, follow_redirects=False)

    # No more redirections
    assert response.status_code == 200
    assert response.location is None


def test_404_redirect_to_landing_if_onboarding_is_completed(app, mocker):
    mocker.patch(
        "pt_os_web_portal.backend.routes.onboarding_completed", return_value=True
    )
    mocker.patch.object(app.application, "send_static_file", send_static_file_mock)

    response = app.get("/non-existant-route", follow_redirects=False)

    # Request redirects to /
    assert response.status_code == 302
    assert response.location == "http://localhost/"

    response = app.get(response.location, follow_redirects=False)

    # Request redirects to /landing
    assert response.status_code == 302
    assert response.location == "http://localhost/landing"

    response = app.get(response.location, follow_redirects=False)

    # No more redirections
    assert response.status_code == 200
    assert response.location is None
