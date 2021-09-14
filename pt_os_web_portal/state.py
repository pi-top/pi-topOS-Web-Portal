from configparser import ConfigParser
from pathlib import Path


class StateManager:
    PATH_TO_CONFIG = "/var/lib/pt-os-web-portal/state.cfg"

    def __init__(self):
        path = Path(self.PATH_TO_CONFIG)
        if not path.exists():
            path.mkdir(parents=True, exist_ok=True)
            path.touch()

        self._config = ConfigParser()
        if len(self._config.read(self.PATH_TO_CONFIG)) != 1:
            raise Exception("Failed to open configuration file")

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
        with open(self.PATH_TO_CONFIG, "w") as configfile:
            self._config.write(configfile)
