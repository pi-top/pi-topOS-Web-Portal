#!/bin/bash
export TEXTDOMAIN=pt-os-web-portal

# shellcheck disable=SC1091
. gettext.sh

zenity --password --title "$(gettext "Password Required")"
