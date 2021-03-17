#!/bin/bash
export TEXTDOMAIN=pt-os-setup

# shellcheck disable=SC1091
. gettext.sh

zenity --password --title "$(gettext "Password Required")"
