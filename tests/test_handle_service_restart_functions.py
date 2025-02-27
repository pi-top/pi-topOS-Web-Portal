import os
import subprocess
import tempfile

import pytest

SCRIPT_PATH = "debian/extra/handle-service-restart-in-policy"
POLICY_FILE = "/usr/sbin/policy-rc.d"
POLICY_FILE_TEMP = tempfile.mktemp()


def run_bash_function(func_name, *args):
    """Run a specific bash function from the script"""
    # Creates a temporary version of the script without the final execution line
    # to be able to source the script and use the functions in the tests
    args_str = " ".join(f"'{arg}'" for arg in args)
    temp_file = tempfile.mktemp()
    cmd = f"""
    # Read all lines except the last one
    head -n -1 {SCRIPT_PATH} > {temp_file}
    source {temp_file}
    rm -r {temp_file}
    {func_name} {args_str}
    """
    return subprocess.run(
        ["bash", "-c", cmd],
        capture_output=True,
        text=True,
        env={"POLICY_FILE": POLICY_FILE_TEMP, "EUID": "0"},
    )


@pytest.fixture
def mock_policy_file(request):
    """Mock policy file for testing. If a service_name is provided, the corresponding section is added to the policy file."""
    service_name = getattr(request, "param", None)
    service_section = ""
    if service_name is not None:
        service_section = f"""if [ "$1" = "{service_name}" ]; then
        exit 101
    fi
"""
    content = f"""#!/bin/sh
{service_section}
exit 0
"""
    # Write the content to the policy file
    with open(POLICY_FILE_TEMP, "w") as f:
        f.write(content)
    yield
    # Cleanup
    os.remove(POLICY_FILE_TEMP)


def get_policy_file_content():
    if not os.path.exists(POLICY_FILE_TEMP):
        return None
    with open(POLICY_FILE_TEMP, "r") as f:
        return f.read()


# validate_args function
def test_validate_args_add_command():
    result = run_bash_function("validate_args", "add", "myservice")
    assert result.returncode == 0


def test_validate_args_remove_command():
    result = run_bash_function("validate_args", "remove", "myservice")
    assert result.returncode == 0


def test_validate_args_invalid_command():
    result = run_bash_function("validate_args", "invalid", "myservice")
    assert result.returncode == 1
    assert "Invalid command. Use 'add' or 'remove'" in result.stdout


def test_validate_args_missing_service_name():
    result = run_bash_function("validate_args", "add", "")
    assert result.returncode == 1
    assert "Please provide both command and service name" in result.stdout


# is_service_in_policy function
@pytest.mark.parametrize(
    "mock_policy_file", ["the-service"], indirect=["mock_policy_file"]
)
def test_is_service_in_policy_with_service_that_exists(mock_policy_file):
    result = run_bash_function("is_service_in_policy", "the-service")
    assert result.returncode == 0


def test_is_service_in_policy_with_service__that_does_not_exists(mock_policy_file):
    result = run_bash_function("is_service_in_policy", "another-service")
    assert result.returncode == 1


# add_service_to_policy function
def test_add_service_to_policy_new_service(mock_policy_file):
    result = run_bash_function("add_service_to_policy", "the-service")
    assert result.returncode == 0
    assert f"Policy added for the-service into {POLICY_FILE_TEMP}" in result.stdout


@pytest.mark.parametrize(
    "mock_policy_file", ["the-service"], indirect=["mock_policy_file"]
)
def test_add_service_to_policy_existing_service(mock_policy_file):
    result = run_bash_function("add_service_to_policy", "the-service")
    assert result.returncode == 0
    assert "Service the-service already in policy - skipping" in result.stdout


# remove_service_from_policy function
@pytest.mark.parametrize(
    "mock_policy_file", ["the-service"], indirect=["mock_policy_file"]
)
def test_remove_existing_service(mock_policy_file):
    result = run_bash_function("remove_service_from_policy", "the-service")
    assert result.returncode == 0
    assert "Policy removed for the-service" in result.stdout


def test_remove_nonexistent_service(mock_policy_file):
    result = run_bash_function("remove_service_from_policy", "non-existent")
    assert result.returncode == 0
    assert "non-existent not found in policy" in result.stdout


def test_handle_operation_add_remove():
    """Integration test for adding and then removing a service"""
    # Add a service
    result = run_bash_function("handle_operation", "add", "test-service")
    assert result.returncode == 0
    assert "Policy added for test-service" in result.stdout
    assert (
        get_policy_file_content()
        == """#!/bin/sh

if [ "$1" = "test-service" ]; then
    echo "Skipping service test-service restart..." 1>&2
    exit 101
fi

exit 0
"""
    )

    # Add the same service again
    result = run_bash_function("handle_operation", "add", "test-service")
    assert result.returncode == 0
    assert "Service test-service already in policy - skipping" in result.stdout
    assert (
        get_policy_file_content()
        == """#!/bin/sh

if [ "$1" = "test-service" ]; then
    echo "Skipping service test-service restart..." 1>&2
    exit 101
fi

exit 0
"""
    )
    # Add another service
    result = run_bash_function("handle_operation", "add", "another-service")
    assert result.returncode == 0
    assert "Policy added for another-service" in result.stdout
    assert (
        get_policy_file_content()
        == """#!/bin/sh

if [ "$1" = "test-service" ]; then
    echo "Skipping service test-service restart..." 1>&2
    exit 101
fi

if [ "$1" = "another-service" ]; then
    echo "Skipping service another-service restart..." 1>&2
    exit 101
fi

exit 0
"""
    )

    # Remove the services
    result = run_bash_function("handle_operation", "remove", "another-service")
    assert result.returncode == 0
    assert "Policy removed for another-service" in result.stdout
    assert (
        get_policy_file_content()
        == """#!/bin/sh

if [ "$1" = "test-service" ]; then
    echo "Skipping service test-service restart..." 1>&2
    exit 101
fi

exit 0
"""
    )
    result = run_bash_function("handle_operation", "remove", "test-service")
    assert result.returncode == 0
    assert "Policy removed for test-service" in result.stdout
    assert (
        get_policy_file_content()
        == """#!/bin/sh

exit 0
"""
    )

    # Run remove again
    result = run_bash_function("handle_operation", "remove", "test-service")
    assert result.returncode == 0
    assert "Service test-service not found in policy - skipping ..." in result.stdout
    assert (
        get_policy_file_content()
        == """#!/bin/sh

exit 0
"""
    )
