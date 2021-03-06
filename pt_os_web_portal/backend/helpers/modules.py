from .paths import use_test_path


def get_pywifi():
    if use_test_path():
        from .mocks.pywifi_mock import PyWiFiMock

        return PyWiFiMock()

    from .vendor import pywifi

    return pywifi


def get_apt():
    if use_test_path():
        from .mocks.apt_mock import AptMock, AptPkgMock, AptProgressMock

        return AptMock(), AptProgressMock(), AptPkgMock()

    import apt
    import apt.progress
    import apt_pkg

    return apt, apt.progress, apt_pkg
