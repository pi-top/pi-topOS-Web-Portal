import logging
from re import search
from typing import List

from pitop.common.command_runner import run_command

from .paths import default_locale, locales_gen, supported_locales

logger = logging.getLogger(__name__)


def list_locales_supported() -> list:
    logger.info("Function: list_locales_supported()")

    with open(supported_locales()) as file:
        lines = [line.rstrip() for line in file]
        utf8_locales: List[str] = list()

        for line in lines:
            # keep lines NOT starting with @ and containing .UTF-8
            if line[0] != "@" and ".UTF-8" in line:
                # take before .UTF-8
                locale_code = line.split(".UTF-8")[0]
                # remove repeats
                if not any(locale == locale_code for locale in utf8_locales):
                    utf8_locales.append(locale_code)

        return utf8_locales


def current_locale() -> str:
    logger.info("Function: current_locale()")

    with open(default_locale()) as file:
        lang_lines = [line.rstrip() for line in file if line.startswith("LANG=")]
        if len(lang_lines) == 0:
            return ""

        # Get last one, in case there are multiple
        locale = lang_lines[-1].split("=")[1].split(".UTF-8")[0]
        logger.info("Current locale: '%s'" % locale)
        return locale


def list_locales_available() -> list:
    logger.info("Function: list_locales_available()")

    with open(locales_gen()) as file:
        lines = [line.rstrip() for line in file]
        utf8_locales: List[str] = list()

        for line in lines:
            # get just locale code from lines matching utf-8 locale regex
            matches = search(r"(\w+_\w\w)\.UTF-8", line)
            if matches is not None:
                locale_code = matches.group(1)
                # remove repeats
                if not any(locale == locale_code for locale in utf8_locales):
                    utf8_locales.append(locale_code)

        return utf8_locales


def set_locale(locale_code):
    logger.info("Function: set_locale(locale_code='%s')" % locale_code)

    available_locales = list_locales_available()
    if locale_code not in available_locales:
        logger.error("Unable to set locale - Not available: %s" % locale_code)
        return None

    command = "raspi-config nonint do_change_locale %s.UTF-8" % locale_code
    run_command(command, timeout=30, capture_output=False)

    return True
