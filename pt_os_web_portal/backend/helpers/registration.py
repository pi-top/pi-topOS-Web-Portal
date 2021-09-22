from flask import current_app
from pitop.common.logger import PTLogger

from ... import state


def set_registration_email(email):
    PTLogger.info(f"Function: set_registration_email(email='{email}')")
    with current_app.app_context():
        state.set("registration", "email", email)
