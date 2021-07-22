from os import environ
from shlex import split
from subprocess import Popen, run

from pitopcommon.logger import PTLogger


def run_command_background(command_str: str) -> Popen:
    PTLogger.info("Function: run_command_background(command_str=%s)" % command_str)
    return Popen(split(command_str))


# Possible errors:
# 	TimeoutExpired
# 	CalledProcessError
def run_command(
    command_str: str,
    timeout: int,
    check: bool = True,
    capture_output: bool = True,
    lower_priority: bool = False,
) -> str:
    PTLogger.info(
        "Function: run_command(command_str=%s, timeout=%f, check=%s, capture_output=%s, lower_priority=%s)"
        % (command_str, timeout, check, capture_output, lower_priority)
    )

    resp_stdout = ""

    env_plus_display = environ.copy()
    env_plus_display["DISPLAY"] = ":0"

    command_args_list = split(command_str)

    if lower_priority:
        command_args_list = ["nice", "-n", "10"] + command_args_list

    # try:
    resp = run(
        command_args_list,
        check=check,
        capture_output=capture_output,
        timeout=timeout,
        env=env_plus_display,
    )

    if capture_output:
        resp_stdout = str(resp.stdout, "utf8")
        resp_stderr = str(resp.stderr, "utf8")

        PTLogger.info(
            "run_command(command_str='%s', timeout=%f, check='%s', capture_output='%s', lower_priority=%s)) stdout:\n%s"
            % (command_str, timeout, check, capture_output, lower_priority, resp_stdout)
        )
        PTLogger.info(
            "run_command(command_str='%s', timeout=%f, check='%s', capture_output='%s', lower_priority=%s)) stdout:\n%s"
            % (command_str, timeout, check, capture_output, lower_priority, resp_stderr)
        )

    if not check:
        PTLogger.info(
            "run_command(command_str='%s', timeout=%f, check='%s', capture_output='%s', lower_priority=%s)) exit code: %f"
            % (
                command_str,
                timeout,
                check,
                capture_output,
                lower_priority,
                resp.returncode,
            )
        )

    # except TimeoutError as e:
    #     # do something here
    #     PTLogger.error(e)
    #     raise e
    # except CalledProcessError as e:
    #     PTLogger.error(e)
    #     raise e
    # except Exception as e:
    #     PTLogger.error(e)

    return resp_stdout
