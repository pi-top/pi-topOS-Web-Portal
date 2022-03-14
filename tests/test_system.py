def test_systemctl_functions(app, mocker):
    run_mock = mocker.patch(
        "pt_os_web_portal.backend.helpers.system.run_command",
        return_value="",
    )

    from pt_os_web_portal.backend.helpers import system

    service = system.SystemService.WebPortal
    test_data = [
        ("restart", system.service_restart),
        ("start", system.service_start),
        ("stop", system.service_stop),
        ("enable", system.service_enable),
        ("disable", system.service_disable),
        ("status", system.service_status),
        ("is-active", system.service_is_active),
    ]

    for command, system_func in test_data:
        system_func(service)
        run_mock.assert_called_once_with(
            f"systemctl {command} {service.value}.service", check=False, timeout=10
        )
        run_mock.reset_mock()


def test_systemctl_returns_command_output(app, mocker):
    expected_output = "this is the output of a command"
    mocker.patch(
        "pt_os_web_portal.backend.helpers.system.run_command",
        return_value=expected_output,
    )

    from pt_os_web_portal.backend.helpers.system import SystemService, systemctl

    assert systemctl("restart", SystemService.WebPortal) == expected_output


def test_systemctl_catches_exception(app, mocker):
    mocker.patch(
        "pt_os_web_portal.backend.helpers.system.run_command",
        side_effect=Exception("oh oh, there was an error"),
    )

    from pt_os_web_portal.backend.helpers.system import SystemService, systemctl

    assert systemctl("restart", SystemService.WebPortal) is None
