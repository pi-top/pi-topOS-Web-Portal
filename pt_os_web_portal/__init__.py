from gevent import monkey

monkey.patch_all()

import pitop.common.ptdm  # noqa: E402
import zmq.green  # noqa: E402

from .version import __version__  # noqa: E402

# Use zmq.green for gevent compatibility
pitop.common.ptdm.zmq = zmq.green
