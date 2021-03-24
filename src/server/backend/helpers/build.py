from pitopcommon.logger import PTLogger

from json import dumps
from .paths import pt_issue


def os_build_info():
    PTLogger.info("Function: os_build_info()")

    build_name = None
    build_number = None
    build_date = None
    build_repo = None
    final_repo = None
    build_hash = None

    with open(pt_issue()) as file:
        for line in file:
            if "Build Name:" in line:
                build_name = line.split(":")[1].strip()
            elif "Build Number:" in line:
                build_number = line.split(":")[1].strip()
            elif "Build Date:" in line:
                build_date = line.split(":")[1].strip()
            elif "Build Apt Repo:" in line:
                build_repo = line.split(":")[1].strip()
            elif "Final Apt Repo:" in line:
                final_repo = line.split(":")[1].strip()
            elif "Build Pipeline Commit Hash:" in line:
                build_hash = line.split(":")[1].strip()

    resp = {
        'buildName': build_name,
        'buildNumber': build_number,
        'buildDate': build_date,
        'buildRepo': build_repo,
        'finalRepo': final_repo,
        'buildHash': build_hash,
    }

    PTLogger.info("OS build information: " + dumps(resp))

    return resp
