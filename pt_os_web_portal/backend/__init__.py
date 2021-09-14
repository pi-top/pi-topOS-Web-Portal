from flask import Flask
from flask_cors import CORS
from flask_sockets import Sockets

from .helpers.finalise import onboarding_completed

sockets: Sockets


def create_app(test_mode, os_updater, state_manager):
    app = Flask(
        __name__,
        static_url_path="",
        static_folder="../frontend/build",
        template_folder="../frontend/build",
    )
    global sockets
    sockets = Sockets(app)

    CORS(app)
    if test_mode:
        app.config["TESTING"] = True
    if os_updater:
        app.config["OS_UPDATER"] = os_updater
    if state_manager:
        app.config["STATE_MANAGER"] = state_manager

    with app.app_context():
        from . import routes

        return app
