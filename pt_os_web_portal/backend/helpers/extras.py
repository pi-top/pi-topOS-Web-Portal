from pathlib import Path

started_onboarding_breadcrumb = (
    "/tmp/.com.pi-top.pt-os-web-portal.miniscreen.onboarding"
)


def leave_started_onboarding_breadcrumb():
    Path(started_onboarding_breadcrumb).touch(exist_ok=True)
