from time import sleep


class PackageMock:
    def __init__(self, package_name) -> None:
        self.name = package_name
        self.is_upgradable = False

    def mark_upgrade(self) -> None:
        pass


class CacheMock:
    required_download = 2155000000
    install_count = 1
    required_space = 99300000
    sleep_time = 1
    _dummy_upgrade_messages = [
        ["dpkg-exec", 0.0, "Running dpkg"],
        [
            "gnome-control-center-data",
            25.0,
            "Preparing gnome-control-center-data (armhf)",
        ],
        [
            "gnome-control-center-data",
            50.6923,
            "Unpacking gnome-control-center-data (armhf)",
        ],
        [
            "gnome-control-center-data",
            95.3333,
            "Installing gnome-control-center-data (armhf)",
        ],
    ]
    _sources_to_update = 4
    packages = {
        "pt-os-web-portal": PackageMock("pt-os-web-portal"),
        "python3-pitop": PackageMock("python3-pitop"),
        "python3-pitop-full": PackageMock("python3-pitop-full"),
    }

    def get(self, package_name):
        return self.packages.get(package_name)

    def update(self, progress=None):
        progress.total_items = self._sources_to_update
        if hasattr(progress, "pulse"):
            for idx in range(self._sources_to_update):
                progress.current_items = idx
                progress.pulse(None)
                if self.sleep_time:
                    print(f"CacheMock.update: Sleeping for {self.sleep_time}s")
                    sleep(self.sleep_time)

    def open(self, opt=None):
        pass

    def upgrade(self, dist_upgrade=None):
        if self.sleep_time:
            print(f"CacheMock.upgrade: Sleeping for {self.sleep_time}s")
            sleep(self.sleep_time)

    def commit(self, fetch_progress, install_progress):
        if self.sleep_time:
            print(f"CacheMock.commit: Sleeping for {self.sleep_time}s")
            sleep(self.sleep_time)

        if hasattr(fetch_progress, "pulse"):
            fetch_progress.pulse(None)

        if hasattr(install_progress, "status_change"):
            for pkg_name, percent, status in self._dummy_upgrade_messages:
                install_progress.status_change(
                    pkg=pkg_name, percent=percent, status=status
                )
                if self.sleep_time:
                    print(f"CacheMock.commit: Sleeping for {self.sleep_time}s")
                    sleep(self.sleep_time)

    def keys(self):
        return {}


class FilterMock:
    pass


class AptCacheMock:
    Filter = FilterMock


class AptMock:
    Cache = CacheMock
    cache = AptCacheMock
    Package = PackageMock


class ProgressMock:
    current_items = 0
    total_items = 1
    current_cps = 0
    current_bytes = 0
    total_bytes = 0

    def pulse(self, owner):
        pass

    def status_change(self, pkg, percent, status):
        pass

    def update_interface(self):
        pass


class AptProgressClassesMock:
    AcquireProgress = ProgressMock
    InstallProgress = ProgressMock


class AptProgressMock:
    base = AptProgressClassesMock()


class AptPkgMock:
    def size_to_str(self, size):
        return f"{size} " if size < 1e6 else f"{int(size*1e-6)} k"

    def init_config(self):
        pass
