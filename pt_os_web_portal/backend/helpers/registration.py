import logging

from flask import current_app

from ... import state

logger = logging.getLogger(__name__)


def set_registration_email(email):
    logger.info(f"Function: set_registration_email(email='{email}')")
    with current_app.app_context():
        state.set("registration", "email", email)
