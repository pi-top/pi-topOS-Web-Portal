#!/bin/bash
export TEXTDOMAIN=pt-web-portal

# shellcheck disable=SC1091
. gettext.sh

zenity --password --title "$(gettext "Password Required")"
