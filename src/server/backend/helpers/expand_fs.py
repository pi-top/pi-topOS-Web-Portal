from os import path

from pitop.common.logger import PTLogger

from .paths import expand_fs_breadcrumb


def is_file_system_expanded() -> bool:
    PTLogger.info("Function: is_file_system_expanded()")

    is_expanded = path.exists(expand_fs_breadcrumb())
    PTLogger.info("File system is {}expanded".format("" if is_expanded else "not "))
    return is_expanded
