from .paths import use_test_path


def get_pywifi():
    if use_test_path():
        from .mocks.pywifi_mock import PyWiFiMock

        return PyWiFiMock()

    from .vendor import pywifi

    return pywifi
