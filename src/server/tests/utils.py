from os.path import isfile


class dotdict(dict):
    """dot.notation access to dictionary attributes"""

    __getattr__ = dict.get
    __setattr__ = dict.__setitem__
    __delattr__ = dict.__delitem__


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
