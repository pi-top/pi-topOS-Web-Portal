from inspect import signature
from subprocess import PIPE, CalledProcessError, Popen

from pitop.common.logger import PTLogger

from .types import MessageType


class LegacyOSUpdateManager:
    def __init__(self) -> None:
        self.lock = False
        self._download_size = 0
        self.download_size_str = ""
        self._required_space = 0
        self.required_space_str = ""
        self.install_count = 0

    def __run(self, cmd, callback=None, check=True):
        with Popen(cmd, stdout=PIPE, bufsize=1, universal_newlines=True) as p:
            for line in p.stdout:
                line = line.strip()
                if callable(callback):
                    callback_signature = signature(callback)
                    if len(callback_signature.parameters) == 1:
                        callback(line)
                    elif len(callback_signature.parameters) == 3:
                        callback(MessageType.STATUS, line, 0.0)
                PTLogger.info(line)

        if check and p.returncode != 0:
            raise CalledProcessError(p.returncode, p.args)

    def update(self, callback) -> None:
        PTLogger.info("LegacyOSUpdaterManager: Updating APT sources")
        if self.lock:
            callback(MessageType.ERROR, "LegacyOSUpdaterManager is locked", 0.0)
            return
        self.lock = True

        try:
            self.__run(["apt-get", "update"], callback)
        except Exception as e:
            PTLogger.error(f"LegacyOSUpdaterManager Error: {e}")
            raise
        finally:
            self.lock = False

    def stage_upgrade(self, callback, packages=[]) -> None:
        PTLogger.info("LegacyOSUpdaterManager: Staging packages for upgrade")
        if self.lock:
            callback(MessageType.ERROR, "LegacyOSUpdaterManager is locked", 0.0)
            return
        self.lock = True

        self._download_size = 0
        self.download_size_str = ""
        self._required_space = 0
        self.required_space_str = ""
        self.install_count = 0
        self.packages = packages

        try:
            cmd = ["apt-get", "dist-upgrade", "--assume-no"]
            if len(packages) > 0:
                cmd = ["apt-get", "install", *packages, "--assume-no"]

            def str_to_float(text):
                dot_pos = text.rfind(".")
                comma_pos = text.rfind(",")
                if comma_pos > dot_pos:
                    text = text.replace(".", "")
                    text = text.replace(",", ".")
                else:
                    text = text.replace(",", "")
                return float(text)

            def get_update_info(line):
                line_arr = line.split()
                if "disk space" in line:
                    self._required_space = str_to_float(line_arr[3])
                    self.required_space_str = (
                        f"{self._required_space} {line_arr[4].split('/')[0]}"
                    )
                elif "Need to get" in line:
                    self._download_size = str_to_float(line_arr[3])
                    self.download_size_str = (
                        f"{self._download_size} {line_arr[4].split('/')[0]}"
                    )
                elif "newly installed" in line:
                    self.install_count = int(line_arr[0]) + int(line_arr[2])

            self.__run(cmd, get_update_info, check=False)
            PTLogger.info(
                f"OS Update: Will upgrade/install {self.install_count} packages"
            )
            PTLogger.info(f"OS Update: Need to download {self.download_size_str}")
            PTLogger.info(
                f"OS Update: After this operation, {self.required_space_str} of additional disk space will be used."
            )
        except Exception as e:
            PTLogger.error(f"{e}")
            raise e
        finally:
            self.lock = False

    def download_size(self):
        return self._download_size

    def required_space(self):
        return self._required_space

    def upgrade(self, callback):
        PTLogger.info("LegacyOSUpdaterManager: starting upgrade")
        if self.lock:
            callback(MessageType.ERROR, "LegacyOSUpdaterManager is locked", 0.0)
            return
        self.lock = True

        cmd = [
            "apt-get",
            '-o Dpkg::Options::="--force-confdef"',
            '-o Dpkg::Options::="--force-confold"',
            "-o APT::Get::Upgrade-Allow-New=true",
            "dist-upgrade",
            "--quiet",
            "--yes",
        ]
        if len(self.packages) > 0:
            cmd = [
                "apt-get",
                '-o Dpkg::Options::="--force-confdef"',
                '-o Dpkg::Options::="--force-confold"',
                "-o APT::Get::Upgrade-Allow-New=true",
                "install",
                *self.packages,
                "--quiet",
                "--yes",
            ]
        try:
            callback(MessageType.START, "Starting install & upgrade process", 0.0)
            self.__run(cmd, callback)
            callback(MessageType.FINISH, "Finished upgrade", 100.0)
        except Exception as e:
            raise e
        finally:
            self.lock = False

        PTLogger.info("LegacyOSUpdaterManager: finished upgrade")
