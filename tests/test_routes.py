def test_redirect_on_404(app):
    response = app.get("/non-existant-route", follow_redirects=False)
    assert response.request.path == "/non-existant-route"
    assert response.status_code == 302
    assert response.location == "http://localhost/"


def send_static_file_mock(filename):
    return "hey", 0


def test_404_redirect_if_onboarding_isnt_completed(app, mocker):
    mocker.patch("backend.routes.onboarding_completed", return_value=False)
    mocker.patch.object(app.application, "send_static_file", send_static_file_mock)

    response = app.get("/non-existant-route", follow_redirects=True)
    assert len(response.history) == 2
    assert response.history[0].request.path == "/non-existant-route"
    assert response.history[1].request.path == "/"
    assert response.request.path == "/onboarding"


def test_404_redirect_if_onboarding_is_completed(app, mocker):
    mocker.patch("backend.routes.onboarding_completed", return_value=True)
    mocker.patch.object(app.application, "send_static_file", send_static_file_mock)

    response = app.get("/non-existant-route", follow_redirects=True)
    assert len(response.history) == 2
    assert response.history[0].request.path == "/non-existant-route"
    assert response.history[1].request.path == "/"
    assert response.request.path == "/landing"
