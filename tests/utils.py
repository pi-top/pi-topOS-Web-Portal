from os.path import isfile
from threading import Event
from time import sleep


class dotdict(dict):
    """dot.notation access to dictionary attributes"""

    __getattr__ = dict.get
    __setattr__ = dict.__setitem__  # type: ignore
    __delattr__ = dict.__delitem__  # type: ignore


def assert_file_content(path, expected_file_content):
    """reads file from path and asserts that the content
    is similar to the expected content given"""
    if not isfile(path):
        raise Exception("{} is not a valid file.".format(path))

    if not isinstance(expected_file_content, list):
        expected_file_content = [expected_file_content]

    with open(path, "r") as f:
        for expected_line_content in expected_file_content:
            line = f.readline()
            assert line.strip() == expected_line_content.strip()


class SleepMocker:
    def __init__(self) -> None:
        self.sleep_event = Event()

    def sleep(self, time):
        self.sleep_event.clear()
        self.sleep_event.wait()

    def wait_until_next_iteration(self, sleep_mock):
        current = sleep_mock.call_count
        self.sleep_event.set()
        while sleep_mock.call_count == current:
            sleep(0.01)
