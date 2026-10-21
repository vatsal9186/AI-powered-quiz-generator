import sys
from pathlib import Path

# Add server directory to sys.path so 'import app...' works seamlessly
server_dir = Path(__file__).resolve().parent / "server"
if str(server_dir) not in sys.path:
    sys.path.insert(0, str(server_dir))

from server.app.main import app
