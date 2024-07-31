from gevent import monkey

from .version import __version__

monkey.patch_all()
