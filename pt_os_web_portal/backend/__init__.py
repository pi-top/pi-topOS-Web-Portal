from os import environ

from flask import Flask
from flask_cors import CORS
from flask_sockets import Sockets

sockets: Sockets


def create_app(test_mode, os_updater):
    app = Flask(
        __name__, static_url_path="", static_folder="./build", template_folder="./build"
    )
    global sockets
    sockets = Sockets(app)

    CORS(app)
    if test_mode:
        environ["TESTING"] = "1"
    if os_updater:
        app.config["OS_UPDATER"] = os_updater

    with app.app_context():
        from . import routes

        return app
