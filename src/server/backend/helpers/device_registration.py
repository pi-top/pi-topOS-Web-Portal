#!/usr/bin/python3

import json
import os
import requests
from pathlib import Path
from subprocess import call
from time import sleep


DEVICE_SERIALS_FILE = "/etc/pi-top/device_serial_numbers.json"
REGISTRATION_EMAIL_ADDRESS_FILE = "/etc/pi-top/registration.txt"
DEVICE_INFO_FILE = "/etc/pi-top/pt-device-manager/device_version"
OS_INFO_FILE = "/etc/pt-issue"
API_ENDPOINT = "https://backend.pi-top.com/utils/v1/device/register"
DEVICE_IS_REGISTERED_BREADCRUMB = Path("/etc/pi-top/.device_registered")


def field_is_in_json(json, fieldToFind):
    keyExists = fieldToFind in json
    valueExists = json.get(fieldToFind) is not None
    return keyExists and valueExists


def get_email_address():

    if os.path.exists(REGISTRATION_EMAIL_ADDRESS_FILE):
        with open(REGISTRATION_EMAIL_ADDRESS_FILE, "r") as f:
            email_address = f.readline()
            email_address = email_address.strip()
            print("Successfully read email address")
            return email_address

    return ""


def get_serial_number():

    if os.path.exists(DEVICE_SERIALS_FILE):
        with open(DEVICE_SERIALS_FILE, "r") as f:
            print("Reading device serial number from file")
            serial_numbers_json = json.load(f)

            if field_is_in_json(serial_numbers_json, "primary"):
                serial_number = str(serial_numbers_json["primary"])
                serial_number = serial_number.strip()
                print("Successfully read serial number")
                return serial_number
            else:
                print("primary serial number could not be read from file")
    else:
        print("Device serial number not found")

    return "unknown"


def get_device_type():

    if os.path.exists(DEVICE_INFO_FILE):
        with open(DEVICE_INFO_FILE, "r") as f:
            device_type = f.readline()
            device_type = device_type.strip()
            print("Successfully read device type")
            return device_type

    return ""


def get_os_version():

    os_name = ""
    os_build_number = ""
    update_repo = ""

    if os.path.exists(OS_INFO_FILE):
        with open(OS_INFO_FILE, "r") as f:
            for line in f:
                if "Build Name:" in line:
                    parts = line.split(": ")
                    if len(parts) > 1:
                        os_name = parts[1].strip()
                elif "Build Number:" in line:
                    parts = line.split(": ")
                    if len(parts) > 1:
                        os_build_number = parts[1].strip()
                elif "Final Apt Repo:" in line:
                    parts = line.split(": ")
                    if len(parts) > 1:
                        update_repo = parts[1].strip()

    if os_name != "":
        print("Successfully read OS name")

    if os_build_number != "":
        print("Successfully read OS build number")

    if update_repo != "":
        print("Successfully read OS update repo")

    return os_name, os_build_number, update_repo


def get_registration_data():

    email_address = get_email_address()
    serial_number = get_serial_number()
    device_type = get_device_type()
    os_name, os_build_number, update_repo = get_os_version()

    return {
        "serialNumber": serial_number,
        "email": email_address,
        "privacyAgreement": True,
        "device": device_type,
        "osVersion": os_name + "-" + os_build_number,
        "updateRepo": update_repo,
    }


def send_data_and_get_resp(data):
    headers = {"Content-Type": "application/json",
               "Accept": "application/json"}
    try:
        print("POSTing data...")
        r = requests.post(API_ENDPOINT, headers=headers, json=data)
        return r.status_code, r.json()
    except Exception as e:
        print("Error sending data: " + str(e))
    return None, None


def device_is_registered():
    return DEVICE_IS_REGISTERED_BREADCRUMB.is_file()


def create_device_registered_breadcrumb():
    return DEVICE_IS_REGISTERED_BREADCRUMB.touch()


def main():
    if device_is_registered():
        return
    try:
        # TODO: run in thread
        register_device()
    except Exception as e:
        print("There was an error registering device: {e}.")


def register_device():

    print("Waiting a minute before attempting device registration...")
    sleep(60)

    print("Getting device data to send...")
    data = get_registration_data()

    print("Data to send:")
    print(data)

    print("Attempting to send data to server...")

    successfully_send_data = False

    while not successfully_send_data:

        statusCode, response = send_data_and_get_resp(data)

        if statusCode == 200 and response is not None and response["success"]:
            successfully_send_data = True
            print("Successfully sent device ID data")
        else:
            print("Sending registration data failed.")
            print("Result: " + str(statusCode))
            print("Response: " + str(response))

            print("Retrying in 30s")
            sleep(30)

    print("Creating breadcrumb to avoid registering again")
    create_device_registered_breadcrumb()

    print("Exiting...")


if __name__ == "__main__":
    register_device()
