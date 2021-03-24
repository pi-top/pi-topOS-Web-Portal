from flask import Flask
from flask_cors import CORS
from flask_sockets import Sockets


sockets = None


def create_app(test=False):
    app = Flask(__name__,
                static_url_path='',
                static_folder='./pages/',
                template_folder='./pages/')
    global sockets
    sockets = Sockets(app)

    CORS(app)
    if test:
        app.config['TESTING'] = True

    with app.app_context():
        from . import routes  # noqa: F401

        return app
