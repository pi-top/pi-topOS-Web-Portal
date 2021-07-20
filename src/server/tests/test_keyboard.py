from flask import json
from tests.data.keyboard_data import (
    keyboard_code_list,
    keyboard_current,
    keyboard_query_data,
    keyboard_variants_list,
)
from tests.utils import dotdict


def test_list_keyboard_codes_correct_format(app):
    response = app.get("/list-keyboard-layout-codes")

    assert json.loads(response.data) == keyboard_code_list
    assert response.status_code == 200


def test_list_keyboard_variants_correct_format(app):
    response = app.get("/list-keyboard-layout-variants")

    assert json.loads(response.data) == keyboard_variants_list
    assert response.status_code == 200


def test_current_keyboard(app, mocker):
    environ_mock = mocker.patch("backend.helpers.command_runner.environ")
    environ_mock.copy = dict
    run_mock = mocker.patch(
        "backend.helpers.command_runner.run",
        return_value=dotdict(
            {"stdout": keyboard_query_data, "stderr": b"", "returncode": 0}
        ),
    )

    response = app.get("/current-keyboard-layout")
    body = json.loads(response.data)
    run_mock.assert_called_once_with(
        ["setxkbmap", "-query"],
        capture_output=True,
        check=True,
        env={"DISPLAY": ":0"},
        timeout=2,
    )
    assert response.status_code == 200
    assert body == keyboard_current


def test_set_keyboard_layout_success(app, mocker):
    valid_keyboard_layout = "ad"
    environ_mock = mocker.patch("backend.helpers.command_runner.environ")
    environ_mock.copy = dict
    run_mock = mocker.patch(
        "backend.helpers.command_runner.run",
        return_value=dotdict({"stdout": b"", "stderr": b"", "returncode": 200}),
    )

    successful_response = app.post(
        "/set-keyboard-layout", json={"layout": valid_keyboard_layout}
    )
    run_mock.assert_called_once_with(
        ["raspi-config", "nonint", "do_configure_keyboard", "ad"],
        capture_output=False,
        check=True,
        env={"DISPLAY": ":0"},
        timeout=30,
    )
    assert successful_response.status_code == 200
    assert successful_response.data == b"OK"


def test_set_keyboard_layout_failure_wrong_type(app):
    validation_error_response = app.post("/set-keyboard-layout", json={"layout": 1})
    assert validation_error_response.status_code == 422


# XXX: this should fail ... but we are not getting any errors from raspi-config
def test_set_keyboard_layout_invalid_code(app, mocker, restore_files):
    environ_mock = mocker.patch("backend.helpers.command_runner.environ")
    environ_mock.copy = dict
    run_mock = mocker.patch(
        "backend.helpers.command_runner.run",
        return_value=dotdict({"stdout": b"", "stderr": b"", "returncode": 0}),
    )

    no_locale_found_error = app.post(
        "/set-keyboard-layout", json={"layout": "fake-layout"}
    )
    run_mock.assert_called_once_with(
        ["raspi-config", "nonint", "do_configure_keyboard", "fake-layout"],
        capture_output=False,
        check=True,
        env={"DISPLAY": ":0"},
        timeout=30,
    )
    assert no_locale_found_error.status_code == 200
