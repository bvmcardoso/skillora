import importlib
import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))


def _load_app():
    for mod in ("app.main", "main"):
        try:
            m = importlib.import_module(mod)
            if hasattr(m, "app"):
                return getattr(m, "app")
        except Exception:
            continue
    raise RuntimeError("Could not import FastAPI 'app' from app.main/main")


@pytest.fixture(scope="session")
def app():
    os.environ.setdefault("ENV", "test")
    os.environ.setdefault("TESTING", "1")  # precisa ser string
    return _load_app()


@pytest.fixture(scope="session")
def client(app):
    with TestClient(app) as c:
        yield c
