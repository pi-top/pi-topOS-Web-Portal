from time import sleep

import requests
from pitop.common.logger import PTLogger

from .. import state
from ..backend.helpers.about import device_type, os_version, serial_number

API_ENDPOINT = "https://backend.pi-top.com/utils/v1/device/register"


def registration_data():
    email_address = state.get("registration", "email")
    os_name, os_build_number, update_repo = os_version()

    return {
        "serialNumber": serial_number(),
        "email": email_address,
        "privacyAgreement": True,
        "device": device_type(),
        "osVersion": os_name + "-" + os_build_number,
        "updateRepo": update_repo,
    }


def send_data_and_get_resp(data):
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    try:
        PTLogger.debug("POSTing data...")
        r = requests.post(API_ENDPOINT, headers=headers, json=data)
        return r.status_code, r.json()
    except Exception as e:
        PTLogger.error(f"Error sending register request: {e}")
    return None, None


def device_is_registered():
    return state.get("registration", "is_registered") == "true"


def create_device_registered_breadcrumb():
    state.set("registration", "is_registered", "true")


def send_register_device_request():

    PTLogger.debug("Getting device data to send...")
    data = registration_data()

    PTLogger.info(f"Device information to register: {data}")

    PTLogger.debug("Attempting to send data to server...")
    successfully_send_data = False

    while not successfully_send_data:

        statusCode, response = send_data_and_get_resp(data)

        if statusCode == 200 and response is not None and response["success"]:
            successfully_send_data = True
            PTLogger.info("Successfully registered device")
        else:
            PTLogger.warning(
                f"Sending registration data failed with status code {statusCode}"
            )
            PTLogger.warning(f"Server response: {response}")
            PTLogger.warning("Retrying in 30s...")
            sleep(30)

    PTLogger.info("Creating breadcrumb to avoid registering again")
    create_device_registered_breadcrumb()
