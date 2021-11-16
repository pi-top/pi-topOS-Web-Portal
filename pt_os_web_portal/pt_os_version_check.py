import logging

from pitop.common.pt_os import get_pitopOS_info
from requests import get

logger = logging.getLogger(__name__)


def check_relevant_pi_top_os_version_updates():
    URL = "https://backend-test.pi-top.com/utils/v1/OS/checkUpdate"
    BUILD_INFO_TO_API_LOOKUP = {
        "build_os_version": "currentOSVersion",
        "build_commit": "buildCommit",
    }

    def build_info_query_params():
        build_info = get_pitopOS_info()
        build_info_dict = build_info.__dict__ if build_info else {}
        return {
            BUILD_INFO_TO_API_LOOKUP.get(key): value
            for key, value in build_info_dict.items()
            if value and BUILD_INFO_TO_API_LOOKUP.get(key)
        }

    url_query_dict = build_info_query_params()
    logger.info(
        f"Checking if there are major OS updates - sending request to {URL} with {url_query_dict}"
    )
    data = {
        "shouldBurn": False,
        "requireBurn": False,
        "latestOSVersion": "",
        "update": False,
    }
    try:
        response = get(URL, url_query_dict, timeout=5).json()
        logger.info(f"Response was: {response}")
        for k, v in response.items():
            data.update({k: v})
    except Exception as e:
        logger.warning(f"{e}")
    finally:
        return data
