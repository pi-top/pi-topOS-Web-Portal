import pytest


@pytest.fixture(autouse=True)
def mock_send_static_file(app, mocker):
    mocker.patch.object(
        app.application, "send_static_file", lambda _: "Mocked Content", 200
    )


def test_app_served(app, mocker):
    mocker.patch(
        "pt_os_web_portal.backend.routes.onboarding_completed", return_value=True
    )
    response = app.get("/", follow_redirects=False)

    assert response.status_code == 200
    assert response.data == b"Mocked Content"


def test_app_served_on_404(app):
    response = app.get("/non-existant-route", follow_redirects=False)

    assert response.status_code == 200
    assert response.data == b"Mocked Content"


def test_redirect_base_route_to_onboarding_if_not_completed(app, mocker):
    mocker.patch(
        "pt_os_web_portal.backend.routes.onboarding_completed", return_value=False
    )

    response = app.get("/", follow_redirects=False)

    # Request redirects to /onboarding
    assert response.status_code == 302
    assert response.location == "http://localhost/onboarding"

    response = app.get(response.location, follow_redirects=False)

    # No more redirections
    assert response.status_code == 200
    assert response.data == b"Mocked Content"
