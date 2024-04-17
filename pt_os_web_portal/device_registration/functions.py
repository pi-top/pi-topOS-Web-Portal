import logging
from time import sleep
from typing import Dict, Tuple

import requests
from pitop.common.pt_os import get_pitopOS_info
from pitop.system import device_type

from .. import state
from ..backend.helpers.device import serial_number

logger = logging.getLogger(__name__)

API_ENDPOINT = "https://backend.pi-top.com/utils/v1/device/register"


def send_data_and_get_resp(data) -> Tuple:
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    try:
        logger.debug("POSTing data...")
        r = requests.post(API_ENDPOINT, headers=headers, json=data)
        return r.status_code, r.json()
    except Exception as e:
        logger.error(f"Error sending register request: {e}")
    return None, None


def device_is_registered() -> bool:
    return state.get("registration", "is_registered") == "true"


def get_registration_data() -> Dict:
    logger.debug("Getting device data to send...")
    build_info = get_pitopOS_info()
    data = {
        "serialNumber": serial_number(),
        "email": state.get("registration", "email", ""),
        "privacyAgreement": True,
        "device": device_type(),
        "osVersion": f"{build_info.build_run_number}-{build_info.build_date}",
        "updateRepo": build_info.build_type,
    }

    logger.info(f"Device information to register: {data}")
    return data


def send_register_device_request() -> None:
    data = get_registration_data()

    logger.debug("Attempting to send data to server...")
    successfully_sent_data = False
    while not successfully_sent_data:
        statusCode, response = send_data_and_get_resp(data)

        if statusCode == 200 and response is not None and response["success"]:
            successfully_sent_data = True
            logger.info("Successfully registered device")
        else:
            logger.warning(
                f"Sending registration data failed with status code {statusCode}"
            )
            logger.warning(f"Server response: {response}")
            logger.warning("Retrying in 30s...")
            sleep(30)

    logger.info("Creating breadcrumb to avoid registering again")
    state.set("registration", "is_registered", "true")
