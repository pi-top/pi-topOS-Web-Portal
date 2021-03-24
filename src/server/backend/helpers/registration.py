from pitopcommon.logger import PTLogger
from pathlib import Path

from .paths import (
    etc_pi_top,
    pi_top_registration_txt
)


def set_registration_email(email):
    PTLogger.info("Function: set_registration_email(email='%s')" % email)
    # create /etc/pi-top if it doesn't exist
    Path(etc_pi_top()).mkdir(exist_ok=True)

    with open(pi_top_registration_txt(), 'w+') as file:
        file.write(email + '\n')
