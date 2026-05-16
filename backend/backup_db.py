#!/usr/bin/env python3
"""Create a safe timestamped backup of the CHELSEA TH FANs SQLite database."""

from __future__ import annotations

import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT_DIR / "data"
DEFAULT_DB_PATH = DATA_DIR / "news.sqlite3"
DEFAULT_BACKUP_DIR = DATA_DIR / "backups"

DB_PATH = Path(os.environ.get("NEWS_DB_PATH", DEFAULT_DB_PATH))
BACKUP_DIR = Path(os.environ.get("NEWS_BACKUP_DIR", DEFAULT_BACKUP_DIR))


def main() -> None:
    if not DB_PATH.exists():
        raise SystemExit(f"Database not found: {DB_PATH}")

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    backup_path = BACKUP_DIR / f"news-{timestamp}.sqlite3"

    source = sqlite3.connect(DB_PATH)
    try:
        destination = sqlite3.connect(backup_path)
        try:
            source.backup(destination)
        finally:
            destination.close()
    finally:
        source.close()

    print(f"Backup created: {backup_path}")


if __name__ == "__main__":
    main()
