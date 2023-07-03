import logging

from ... import state

logger = logging.getLogger(__name__)


def set_registration_email(email):
    logger.info(f"Function: set_registration_email(email='{email}')")
    state.set("registration", "email", email)
    state.set("registration", "is_registered", "false")
