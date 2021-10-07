===================
pi-topOS Web Portal
===================

--------------------
Build Status: Latest
--------------------

.. image:: https://img.shields.io/github/workflow/status/pi-top/pi-topOS-Web-Portal/Test%20and%20Build%20Packages%20on%20All%20Commits
   :alt: GitHub Workflow Status

.. image:: https://img.shields.io/github/v/tag/pi-top/pi-topOS-Web-Portal
    :alt: GitHub tag (latest by date)

.. image:: https://img.shields.io/github/v/release/pi-top/pi-topOS-Web-Portal
    :alt: GitHub release (latest by date)

.. https://img.shields.io/codecov/c/gh/pi-top/pi-topOS-Web-Portal?token=hfbgB9Got4
..   :alt: Codecov

-----
About
-----

A Python server that hosts a web application to interact directly with a Linux machine.

In addition to the core web server, desktop management of app pages is managed via [`web-renderer`](https://github.com/pi-top/web-renderer) is handled via a separate `-desktop` binary Debian package.

`pt-os-web-portal` is included out-of-the-box with pi-topOS.

Ensure that you keep your system up-to-date to enjoy the latest features and bug fixes.

This application is installed as a Python 3 script that is managed by a systemd service, configured to automatically run on startup and restart during software updates.

------------
Installation
------------

`pt-os-web-portal` is installed out of the box with pi-topOS, which is available from
pi-top.com_. To install on Raspberry Pi OS or other operating systems, check out the `Using pi-top Hardware with Raspberry Pi OS`_ page on the pi-top knowledge base.

.. _pi-top.com: https://www.pi-top.com/products/os/

.. _Using pi-top Hardware with Raspberry Pi OS: https://pi-top.com/pi-top-and-raspberry-pi-os

----------------
More Information
----------------

Please refer to the `additional documentation`_ for more
information about the application.

.. _More Info: https://github.com/pi-top/pi-topOS-Web-Portal/blob/master/docs/README.md
