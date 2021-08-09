from json import dumps

from pitop.common.logger import PTLogger
from pitop.common.pt_os import get_pitopOS_info


def os_build_info():
    PTLogger.info("Function: os_build_info()")
    build_info = get_pitopOS_info()

    build = {
        "buildRepo": build_info.build_type,
        "buildDate": build_info.date,
        "buildNumber": build_info.number,
        "buildCommit": build_info.commit,
    }
    PTLogger.info("OS build information: " + dumps(build))
    return build
