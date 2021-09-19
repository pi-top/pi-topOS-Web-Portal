from configparser import ConfigParser
from pathlib import Path

STATE_FILE_PATH = "/var/lib/pt-os-web-portal/state.cfg"
config_parser = ConfigParser()

path = Path(STATE_FILE_PATH)

if not path.exists():
    path.mkdir(parents=True, exist_ok=True)
    path.touch()

config_parser.read(STATE_FILE_PATH)


def get(section: str, key: str, fallback=None):
    val = fallback
    try:
        val = config_parser.get(section, key)
    except Exception:
        if fallback is None:
            raise
    finally:
        return val


def set(section: str, key: str, value):
    try:
        if not config_parser.has_section(section):
            config_parser.add_section(section)
        config_parser.set(section, key, value)
        save()
    except Exception:
        raise


def save():
    with open(STATE_FILE_PATH, "w") as configfile:
        config_parser.write(configfile)
