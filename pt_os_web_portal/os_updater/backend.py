import logging
from os import environ
from subprocess import PIPE, CalledProcessError, Popen
from typing import Callable, List

logger = logging.getLogger(__name__)


def str_to_float(text):
    dot_pos = text.rfind(".")
    comma_pos = text.rfind(",")
    if comma_pos > dot_pos:
        text = text.replace(".", "")
        text = text.replace(",", ".")
    else:
        text = text.replace(",", "")
    return float(text)


def size_str_to_bytes(size):
    units = {"B": 1, "KB": 1e3, "kB": 1e3, "MB": 1e6, "GB": 1e9, "TB": 1e12}
    number, unit = [string.strip() for string in size.split()]
    return int(float(number) * units[unit])


class AptCommands:
    @classmethod
    def update(cls):
        return ["apt-get", "update"]

    @classmethod
    def dist_upgrade(cls):
        return [
            "apt-get",
            "-o",
            "Dpkg::Options::=--force-confdef",
            "-o",
            "Dpkg::Options::=--force-confold",
            "-o",
            "APT::Get::Upgrade-Allow-New=true",
            "dist-upgrade",
            "--quiet",
            "--yes",
        ]

    @classmethod
    def update_size(cls):
        return ["apt-get", "dist-upgrade", "--assume-no"]

    @classmethod
    def install_packages(cls, packages):
        return [
            "apt-get",
            "-o",
            "Dpkg::Options::=--force-confdef",
            "-o",
            "Dpkg::Options::=--force-confold",
            "-o",
            "APT::Get::Upgrade-Allow-New=true",
            "install",
            *packages,
            "--quiet",
            "--yes",
        ]

    @classmethod
    def install_size(cls, packages):
        return ["apt-get", "install", "--assume-no", *packages]


def run_command(cmd: List, callback: Callable, check: bool = True):
    logger.info(f"run_command: executing '{cmd}'")
    env = environ.copy()
    env["DEBIAN_FRONTEND"] = "noninteractive"
    with Popen(cmd, stdout=PIPE, bufsize=1, universal_newlines=True, env=env) as p:
        for line in p.stdout:
            line = line.strip()
            if callable(callback):
                callback(line)
            logger.info(f"run_command: {line}")
        p.wait()
    if check and p.returncode != 0:
        raise CalledProcessError(p.returncode, p.args)


class OsUpdaterBackend:
    def __init__(self) -> None:
        self.lock = False
        self._download_size = 0
        self.download_size_str = ""
        self._required_space = 0
        self.required_space_str = ""
        self._install_count = 0
        self.packages = []

    def download_size(self):
        return self._download_size

    def required_space(self):
        return self._required_space

    def install_count(self):
        return self._install_count

    def update(self, callback) -> None:
        logger.info("OsUpdaterBackend: Updating APT sources")
        if self.lock:
            raise Exception("OsUpdaterBackend is locked")
        self.lock = True

        try:
            self._do_update(callback)
        finally:
            self.lock = False

    def stage_upgrade(self, packages=[]) -> None:
        logger.info("OsUpdaterBackend: Staging packages for upgrade")
        if self.lock:
            raise Exception("OsUpdaterBackend is locked")
        self.lock = True

        try:
            self._do_stage_upgrade(packages)
        finally:
            self.lock = False

    def upgrade(self, callback):
        logger.info("OsUpdaterBackend: starting upgrade")
        if self.lock:
            raise Exception("OsUpdaterBackend is locked")
        self.lock = True

        try:
            if len(self.packages) > 0:
                self._do_install(callback)
            else:
                self._do_upgrade(callback)
        finally:
            self.lock = False

        logger.info("OsUpdaterBackend: finished upgrade")

    def _do_update(self, callback):
        run_command(AptCommands.update(), callback)

    def _do_install(self, callback):
        run_command(AptCommands.install_packages(self.packages), callback)

    def _do_upgrade(self, callback):
        run_command(AptCommands.dist_upgrade(), callback)

    def _do_get_install_size(self):
        if len(self.packages) > 0:
            cmd = AptCommands.install_size(self.packages)
        else:
            cmd = AptCommands.update_size()
        run_command(cmd, self._parse_install_size_and_packages, check=False)

    def _parse_install_size_and_packages(self, line):
        # parse lines from 'apt' command.
        # on error, assume there's something to install
        line_arr = line.split()
        if "disk space" in line:
            try:
                # Sometimes partial downloads are required when a network error prevents from completing a previous upgrade.
                # In this case, we need to get the first number before the '/'
                # eg: 'Need to get 11.4 kB/1,861 kB of archives.'
                self.required_space_str = (
                    f"{str_to_float(line_arr[3])} {line_arr[4].split('/')[0]}"
                )
                self._required_space = size_str_to_bytes(self.required_space_str)
            except Exception:
                self._required_space = 0
                self.required_space_str = f"{self._required_space} M"
        elif "Need to get" in line:
            try:
                self.download_size_str = (
                    f"{str_to_float(line_arr[3])} {line_arr[4].split('/')[0]}"
                )
                self._download_size = size_str_to_bytes(self.download_size_str)
            except Exception:
                self._download_size = 0
                self.download_size_str = f"{self._download_size} M"
        elif "newly installed" in line:
            try:
                self._install_count = int(line_arr[0]) + int(line_arr[2])
            except Exception:
                self._install_count = 0

    def _do_stage_upgrade(self, packages):
        self._download_size = 0
        self.download_size_str = ""
        self._required_space = 0
        self.required_space_str = ""
        self._install_count = 0
        self.packages = packages

        self._do_get_install_size()

        logger.info(
            f"OsUpdaterBackend: Will upgrade/install {self._install_count} packages"
        )
        logger.info(f"OsUpdaterBackend: Need to download {self.download_size_str}")
        logger.info(
            f"OsUpdaterBackend: After this operation, {self.required_space_str} of additional disk space will be used."
        )
