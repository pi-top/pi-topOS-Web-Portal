from os import path

from pitopcommon.logger import PTLogger

from .command_runner import run_command
from .paths import expand_fs_breadcrumb


def path_to_expand_fs_script():
    here = path.abspath(path.dirname(__file__))
    return path.join(here, "../scripts/expand-fs.sh")


def expand_file_system() -> None:
    PTLogger.info("Function: expand_file_system()")
    run_command(path_to_expand_fs_script(), timeout=120, lower_priority=True)


def create_expand_fs_breadcrumb() -> None:
    PTLogger.info("Function: create_expand_fs_breadcrumb()")

    path_to_breadcrumb = expand_fs_breadcrumb()
    run_command(f"touch {path_to_breadcrumb}", timeout=60, lower_priority=True)


def is_file_system_expanded() -> bool:
    PTLogger.info("Function: is_file_system_expanded()")

    is_expanded = path.exists(expand_fs_breadcrumb())
    PTLogger.info("File system is {}expanded".format("" if is_expanded else "not "))
    return is_expanded
