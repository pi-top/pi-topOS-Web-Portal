from flask import current_app
from pitop.common.logger import PTLogger


def set_registration_email(email):
    PTLogger.info(f"Function: set_registration_email(email='{email}')")
    with current_app.app_context():
        state_manager = current_app.config["STATE_MANAGER"]
        state_manager.set("registration", "email", email)
