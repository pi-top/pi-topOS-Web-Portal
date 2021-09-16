from configparser import ConfigParser
from pathlib import Path

from pitop.common.singleton import Singleton


class StateManager(metaclass=Singleton):
    STATE_FILE_DIRECTORY = "/var/lib/pt-os-web-portal/"
    STATE_FILE_NAME = "state.cfg"

    def __init__(self):
        Path(self.STATE_FILE_DIRECTORY).mkdir(parents=True, exist_ok=True)

        path = Path(self.path_to_file)
        if not path.exists():
            path.touch()

        self._config = ConfigParser()
        self._config.read(self.path_to_file)

    @property
    def path_to_file(self):
        return self.STATE_FILE_DIRECTORY + self.STATE_FILE_NAME

    def get(self, section: str, key: str, fallback=None):
        val = fallback
        try:
            val = self._config.get(section, key)
        except Exception:
            if fallback is None:
                raise
        finally:
            return val

    def set(self, section: str, key: str, value):
        try:
            if not self._config.has_section(section):
                self._config.add_section(section)
            self._config.set(section, key, value)
            self.save()
        except Exception:
            raise

    def save(self):
        with open(self.path_to_file, "w") as configfile:
            self._config.write(configfile)
