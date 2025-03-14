from datetime import datetime
from os import environ

from flask import Flask
from flask_cors import CORS
from pitop.common.flask_sockets import Sockets

sockets: Sockets


def create_app(test_mode, os_updater):
    app = Flask(
        __name__, static_url_path="", static_folder="./build", template_folder="./build"
    )

    @app.after_request
    def no_cache(response):
        response.headers["Cache-Control"] = (
            "no-store, no-cache, must-revalidate, max-age=0"
        )
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        response.headers["Last-Modified"] = datetime.now()
        response.headers.pop("Etag", None)
        return response

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
