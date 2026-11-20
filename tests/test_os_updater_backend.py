from unittest.mock import patch

from pt_os_web_portal.os_updater.backend import AptCommands, OsUpdaterBackend


def test_system_upgrade_never_removes_packages():
    cmd = AptCommands.upgrade()
    assert "upgrade" in cmd
    assert "dist-upgrade" not in cmd
    # new dependencies (e.g. a package split) are still installed
    assert "APT::Get::Upgrade-Allow-New=true" in cmd


def test_upgrade_size_matches_the_upgrade():
    cmd = AptCommands.update_size()
    assert "upgrade" in cmd and "dist-upgrade" not in cmd
    assert "APT::Get::Upgrade-Allow-New=true" in cmd
    assert "--assume-no" in cmd


def test_package_install_stops_instead_of_removing():
    assert "--no-remove" in AptCommands.install_packages(["pt-os-web-portal"])
    assert "--no-remove" in AptCommands.install_size(["pt-os-web-portal"])


def test_backend_runs_the_upgrade_without_removals():
    backend = OsUpdaterBackend()
    with patch("pt_os_web_portal.os_updater.backend.run_command") as run:
        backend.upgrade(callback=None)
    assert run.call_args.args[0] == AptCommands.upgrade()
