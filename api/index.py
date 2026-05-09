import sys
import os
from pathlib import Path

# Add backend directory to sys.path to allow imports like 'from app...'
backend_path = str(Path(__file__).resolve().parent.parent / "backend")
if backend_path not in sys.path:
    sys.path.append(backend_path)

from app.main import app
