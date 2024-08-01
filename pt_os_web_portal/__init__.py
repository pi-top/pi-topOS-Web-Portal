import pitop.common.ptdm
import zmq.green
from gevent import monkey

from .version import __version__

monkey.patch_all()
# Use zmq.green for gevent compatibility
pitop.common.ptdm.zmq = zmq.green
