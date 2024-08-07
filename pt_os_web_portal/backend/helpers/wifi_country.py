import logging

from pitop.common.command_runner import run_command

from .paths import iso_countries

logger = logging.getLogger(__name__)


def list_wifi_countries() -> dict:
    logger.info("Function: list_wifi_countries()")
    with open(iso_countries()) as file:
        country_pairs = [
            line.rstrip().split() for line in file if not line.startswith("#")
        ]

    countries = dict()
    for country_pair in country_pairs:
        countries[country_pair[0]] = " ".join(country_pair[1:])

    return countries


def current_wifi_country() -> str:
    logger.info("Function: current_wifi_country()")

    wifi_country = run_command(
        "raspi-config nonint get_wifi_country", check=False, timeout=5
    ).strip()
    logger.info("Current Wi-Fi country: '%s'" % wifi_country)

    return wifi_country


def set_wifi_country(wifi_country_code):
    logger.info(
        "Function: set_wifi_country(wifi_country_code='%s')" % wifi_country_code
    )
    code = wifi_country_code.upper()
    country_codes = list_wifi_countries().keys()
    if code not in country_codes:
        logger.error("Unable to set Wi-Fi country - Not available: %s" % code)
        return None

    return run_command("raspi-config nonint do_wifi_country %s" % code, timeout=15)
