#!/bin/bash
# shellcheck disable=2140

WEB_PORTAL_PORT="80"
PID_USING_WEB_PORTAL_PORT=$(sudo lsof -ti :"${WEB_PORTAL_PORT}")

/usr/bin/notify-send \
	--expire-time=0 \
	--icon=system-error \
	"Error - pi-top web portal" \
	"Server cannot be started, port 80 is already in use by another process (PID ${PID_USING_WEB_PORTAL_PORT}). \
Make sure no other server software is configured to use this port and try again." \
	--action="Kill PID ${PID_USING_WEB_PORTAL_PORT} & Retry":"env SUDO_ASKPASS=/usr/lib/pt-os-web-portal/notify/pwdptwp.sh sudo -A kill -9 ${PID_USING_WEB_PORTAL_PORT}; env SUDO_ASKPASS=/usr/lib/pt-os-web-portal/notify/pwdptwp.sh sudo -A systemctl restart pt-os-web-portal.service" \
	--action='Retry':"env SUDO_ASKPASS=/usr/lib/pt-os-web-portal/notify/pwdptwp.sh sudo -A systemctl restart pt-os-web-portal.service" \
	--action='Find out more':"/usr/bin/chromium-browser --new-window --start-maximized https://knowledgebase.pi-top.com/knowledge/pi-topos-port-80 & /usr/bin/sleep 10 && env SUDO_ASKPASS=/usr/lib/pt-os-web-portal/notify/pwdptwp.sh sudo -A systemctl restart pt-os-web-portal.service" \
	--close-action="/usr/bin/chromium-browser --new-window --start-maximized https://knowledgebase.pi-top.com/knowledge/pi-topos-port-80 & /usr/bin/sleep 10 && env SUDO_ASKPASS=/usr/lib/pt-os-web-portal/notify/pwdptwp.sh sudo -A systemctl restart pt-os-web-portal.service"
