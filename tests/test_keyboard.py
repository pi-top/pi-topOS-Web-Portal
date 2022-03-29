from flask import json

from tests.data.keyboard_data import (
    keyboard_code_list,
    keyboard_current,
    keyboard_query_data,
    keyboard_variants_list,
)


def test_list_keyboard_codes_correct_format(app):
    response = app.get("/list-keyboard-layout-codes")

    assert json.loads(response.data) == keyboard_code_list
    assert response.status_code == 200


def test_list_keyboard_variants_correct_format(app):
    response = app.get("/list-keyboard-layout-variants")

    assert json.loads(response.data) == keyboard_variants_list
    assert response.status_code == 200


def test_current_keyboard(app, mocker):
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.keyboard.run_command",
        return_value=keyboard_query_data,
    )

    response = app.get("/current-keyboard-layout")
    body = json.loads(response.data)
    run_mock.assert_called_once_with(
        "setxkbmap -query",
        timeout=2,
    )
    assert response.status_code == 200
    assert body == keyboard_current


def test_set_keyboard_layout_success(app, mocker):
    valid_keyboard_layout = "ad"
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.keyboard.run_command",
        return_value="",
    )

    successful_response = app.post(
        "/set-keyboard-layout", json={"layout": valid_keyboard_layout}
    )
    run_mock.assert_called_once_with(
        f"raspi-config nonint do_configure_keyboard {valid_keyboard_layout}",
        timeout=30,
        capture_output=False,
    )
    assert successful_response.status_code == 200
    assert successful_response.data == b"OK"


def test_set_keyboard_layout_failure_wrong_type(app):
    validation_error_response = app.post("/set-keyboard-layout", json={"layout": 1})
    assert validation_error_response.status_code == 422


# XXX: this should fail ... but we are not getting any errors from raspi-config
def test_set_keyboard_layout_invalid_code(app, mocker, restore_files):
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.keyboard.run_command",
        return_value="",
    )

    no_locale_found_error = app.post(
        "/set-keyboard-layout", json={"layout": "fake-layout"}
    )
    run_mock.assert_called_once_with(
        "raspi-config nonint do_configure_keyboard fake-layout",
        timeout=30,
        capture_output=False,
    )
    assert no_locale_found_error.status_code == 200
