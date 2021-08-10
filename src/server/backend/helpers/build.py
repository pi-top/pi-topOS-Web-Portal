from json import dumps

from pitop.common.logger import PTLogger
from pitop.common.pt_os import get_pitopOS_info


def os_build_info():
    PTLogger.info("Function: os_build_info()")
    build = {}

    build_info = get_pitopOS_info()
    if build_info:
        build = {
            "buildDate": build_info.build_date,
            "buildNumber": build_info.build_run_number,
            "buildCommit": build_info.build_commit,
            "schemaVersion": build_info.schema_version,
            "buildType": build_info.build_type,
            "buildOsVersion": build_info.build_os_version,
            "buildName": build_info.build_name,
            "buildRepo": build_info.build_repo,
            "finalRepo": build_info.final_repo,
        }

    PTLogger.info("OS build information: " + dumps(build))
    return build
