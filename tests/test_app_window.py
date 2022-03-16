from unittest.mock import call

from pytest import raises


def test_app_factory_with_valid_apps(patch_modules, mocker):
    from pt_os_web_portal.app_window import (
        AboutAppWindow,
        AppFactory,
        LandingAppWindow,
        OnboardingAppWindow,
        OsUpdaterAppWindow,
    )

    for key, cls in (
        ("about", AboutAppWindow),
        ("os-setup", OnboardingAppWindow),
        ("landing", LandingAppWindow),
        ("updater", OsUpdaterAppWindow),
    ):
        assert isinstance(AppFactory.get_app(key), cls)


def test_app_factory_with_invalid_app_raises_exception(patch_modules, mocker):
    from pt_os_web_portal.app_window import AppFactory

    with raises(Exception):
        AppFactory.get_app("non-existant-app")


def test_about_app_commands(patch_modules, mocker):
    run_mock = mocker.patch(
        "pt_os_web_portal.app_window.app_window.run_command", return_value=""
    )

    from pt_os_web_portal.app_window import AboutAppWindow

    obj = AboutAppWindow()

    obj.run()
    obj.close()
    obj.is_open()

    run_mock.assert_has_calls(
        [
            call(
                "/usr/bin/web-renderer --window-title='About pi-topOS' "
                "--icon='/usr/share/icons/hicolor/scalable/apps/pt-os-about.svg' "
                "--size=0.28x0.36 http://localhost/about",
                check=False,
                timeout=None,
            ),
            call(
                'wmctrl -v -c "About pi-topOS"',
                timeout=5,
            ),
            call(
                "wmctrl -l",
                timeout=5,
            ),
        ]
    )


def test_onboarding_app_commands(patch_modules, mocker):
    run_mock = mocker.patch(
        "pt_os_web_portal.app_window.app_window.run_command", return_value=""
    )

    from pt_os_web_portal.app_window import OnboardingAppWindow

    obj = OnboardingAppWindow()

    obj.run()
    obj.close()
    obj.is_open()

    run_mock.assert_has_calls(
        [
            call(
                "/usr/bin/web-renderer --kiosk --size=1.0x1.0 http://localhost/onboarding",
                check=False,
                timeout=None,
            ),
            call(
                'wmctrl -v -c ""',
                timeout=5,
            ),
            call(
                "wmctrl -l",
                timeout=5,
            ),
        ]
    )


def test_updater_app_commands(patch_modules, mocker):
    run_mock = mocker.patch(
        "pt_os_web_portal.app_window.app_window.run_command", return_value=""
    )

    from pt_os_web_portal.app_window import OsUpdaterAppWindow

    obj = OsUpdaterAppWindow()

    obj.run()
    obj.close()
    obj.is_open()

    run_mock.assert_has_calls(
        [
            call(
                "/usr/bin/web-renderer --window-title='pi-topOS Updater Tool' "
                "--icon='/usr/share/icons/Papirus/24x24/apps/system-software-update.svg' "
                "--size=0.7x0.7 http://localhost/updater",
                check=False,
                timeout=None,
            ),
            call(
                'wmctrl -v -c "pi-topOS Updater Tool"',
                timeout=5,
            ),
            call(
                "wmctrl -l",
                timeout=5,
            ),
        ]
    )


def test_landing_app_commands(patch_modules, mocker):
    run_mock = mocker.patch(
        "pt_os_web_portal.app_window.app_window.run_command", return_value=""
    )

    from pt_os_web_portal.app_window import LandingAppWindow

    obj = LandingAppWindow()

    obj.run()
    obj.close()
    obj.is_open()

    run_mock.assert_has_calls(
        [
            call(
                "/usr/bin/web-renderer --window-title='pi-topOS Landing' "
                "--icon='/usr/share/icons/hicolor/scalable/apps/pt-os-about.svg' "
                "--hide-frame --size=0.65x0.7 http://localhost/landing",
                check=False,
                timeout=None,
            ),
            call(
                'wmctrl -v -c "pi-topOS Landing"',
                timeout=5,
            ),
            call(
                "wmctrl -l",
                timeout=5,
            ),
        ]
    )
