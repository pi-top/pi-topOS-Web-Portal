import logging
from typing import Dict, List

from .wifi_connection.manager import WifiManager

logger = logging.getLogger(__name__)


# Global instance
wifi_manager = None


def get_wifi_manager_instance():
    global wifi_manager
    if wifi_manager is None:
        wifi_manager = WifiManager()
    return wifi_manager


def get_ssids() -> List[Dict]:
    logger.info("Getting list of SSIDs")
    return get_wifi_manager_instance().get_formatted_ssids()


def attempt_connection(bssid: str, password: str, on_connection=None) -> None:
    logger.info(f"Attempting to connect to network with bssid '{bssid}'")
    wm = get_wifi_manager_instance()
    wm.connect(bssid, password)

    if wm.is_connected() and on_connection:
        logger.info("Executing on_connection callback")
        on_connection()


def wifi_connection_info() -> Dict:
    return get_wifi_manager_instance().connection_information()
