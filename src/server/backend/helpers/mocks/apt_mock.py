from time import sleep


class CacheMock:
    required_download = 2155000000
    install_count = 1
    required_space = 99300000
    sleep_time = 0
    _dummy_messages = [
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

    def update(self, progress=None):
        if self.sleep_time:
            print(f"CacheMock.update: Sleeping for {self.sleep_time}s")
            sleep(self.sleep_time)
        if hasattr(progress, "pulse"):
            progress.pulse(None)
        # sleep(2)

    def open(self, opt=None):
        pass

    def upgrade(self, dist_upgrade=None):
        if self.sleep_time:
            print(f"CacheMock.upgrade: Sleeping for {self.sleep_time}s")
            sleep(self.sleep_time)
        pass

    def commit(self, fetch_progress, install_progress):
        if self.sleep_time:
            print(f"CacheMock.commit: Sleeping for {self.sleep_time}s")
            sleep(self.sleep_time)

        if hasattr(fetch_progress, "pulse"):
            fetch_progress.pulse(None)

        if hasattr(install_progress, "status_change"):
            for pkg_name, percent, status in self._dummy_messages:
                install_progress.status_change(
                    pkg=pkg_name, percent=percent, status=status
                )
                # sleep(0.5)

    def keys(self):
        return {}


class AptMock:
    Cache = CacheMock


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
