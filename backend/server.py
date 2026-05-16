#!/usr/bin/env python3
"""CHELSEA TH FANs backend API with a central SQLite database."""

from __future__ import annotations

import hmac
import json
import os
import secrets
import sqlite3
import ssl
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT_DIR / "data"
DB_PATH = Path(os.environ.get("NEWS_DB_PATH", DATA_DIR / "news.sqlite3"))
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "")
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "kaebmoopingkai3737")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "1234567890")
SESSION_COOKIE = "chelsea_admin_session"
SESSION_MAX_AGE_SECONDS = int(os.environ.get("SESSION_MAX_AGE_SECONDS", "86400"))
SSL_CERT_FILE = os.environ.get("SSL_CERT_FILE", "")
SSL_KEY_FILE = os.environ.get("SSL_KEY_FILE", "")
HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "8000"))
ADMIN_SESSIONS: set[str] = set()

DEFAULT_ARTICLES = [
    {
        "id": "chelsea-transfer-plan-2026",
        "title": "Chelsea เตรียมแผนเสริมทัพก่อนฤดูกาลใหม่",
        "category": "ทีมชาย",
        "author": "ทีมข่าว CHELSEA TH FANs",
        "date": "2026-05-14",
        "image": "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1200&auto=format&fit=crop",
        "summary": "สโมสรเดินหน้าวางโครงสร้างทีมระยะยาว พร้อมประเมินผู้เล่นในตำแหน่งหลักเพื่อยกระดับการแข่งขันทั้งในประเทศและเวทียุโรป",
        "content": "Chelsea วางแนวทางการเสริมทัพโดยเน้นผู้เล่นที่เข้ากับระบบทีมและมีศักยภาพเติบโตในระยะยาว ทีมงานจะประเมินสมดุลของขุมกำลังเดิมก่อนตัดสินใจในตลาดซื้อขาย เพื่อให้ทีมพร้อมแข่งขันต่อเนื่องตลอดฤดูกาล",
        "status": "published",
        "featured": True,
    },
    {
        "id": "chelsea-women-standard-2026",
        "title": "Chelsea Women เดินหน้าสร้างมาตรฐานใหม่",
        "category": "ทีมหญิง",
        "author": "ทีมข่าว CHELSEA TH FANs",
        "date": "2026-05-13",
        "image": "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=1200&auto=format&fit=crop",
        "summary": "ทีมหญิงยังเป็นหนึ่งในแกนหลักของโปรเจกต์สโมสร ด้วยผลงานต่อเนื่องและโครงสร้างทีมที่แข็งแรงในทุกตำแหน่ง",
        "content": "Chelsea Women ยังคงรักษามาตรฐานระดับสูงผ่านระบบการฝึกซ้อม การบริหารทีม และการผลักดันผู้เล่นรุ่นใหม่ แฟนบอลชาวไทยสามารถติดตามความเคลื่อนไหวของทีมได้ในหน้าข่าวล่าสุดของเว็บไซต์",
        "status": "published",
        "featured": False,
    },
    {
        "id": "academy-first-team-training-2026",
        "title": "อะคาเดมีดันดาวรุ่งขึ้นซ้อมทีมชุดใหญ่",
        "category": "อะคาเดมี",
        "author": "ทีมข่าว CHELSEA TH FANs",
        "date": "2026-05-12",
        "image": "https://images.unsplash.com/photo-1547347298-4074fc3086f0?q=80&w=1200&auto=format&fit=crop",
        "summary": "นักเตะเยาวชนหลายรายได้รับโอกาสเรียนรู้กับทีมชุดใหญ่ หลังทำผลงานโดดเด่นในระบบพัฒนาเยาวชนของสโมสร",
        "content": "ทีมอะคาเดมีของ Chelsea ยังคงเป็นฐานสำคัญในการพัฒนาผู้เล่นสู่ทีมชุดใหญ่ การได้ซ้อมร่วมกับนักเตะระดับสูงช่วยให้ดาวรุ่งเข้าใจความเร็วและมาตรฐานของเกมอาชีพมากขึ้น",
        "status": "published",
        "featured": False,
    },
]


def connect_db() -> sqlite3.Connection:
    DATA_DIR.mkdir(exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def normalize_article(article: dict) -> dict:
    title = str(article.get("title") or "Untitled News").strip()
    article_id = str(article.get("id") or slugify(title)).strip()

    return {
        "id": article_id,
        "title": title,
        "category": str(article.get("category") or "ข่าวสโมสร").strip(),
        "author": str(article.get("author") or "Admin").strip(),
        "date": str(article.get("date") or "2026-05-14").strip(),
        "image": str(article.get("image") or "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop").strip(),
        "summary": str(article.get("summary") or "").strip(),
        "content": str(article.get("content") or "").strip(),
        "status": "draft" if article.get("status") == "draft" else "published",
        "featured": bool(article.get("featured")),
    }


def slugify(text: str) -> str:
    slug = "-".join(text.lower().strip().split())
    safe_slug = "".join(character for character in slug if character.isalnum() or character == "-").strip("-")
    return safe_slug or "news"


def row_to_article(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "title": row["title"],
        "category": row["category"],
        "author": row["author"],
        "date": row["published_date"],
        "image": row["image"],
        "summary": row["summary"],
        "content": row["content"],
        "status": row["status"],
        "featured": bool(row["featured"]),
    }


def initialize_database() -> None:
    with connect_db() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS news_articles (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                author TEXT NOT NULL,
                published_date TEXT NOT NULL,
                image TEXT NOT NULL,
                summary TEXT NOT NULL,
                content TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('published', 'draft')),
                featured INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        count = connection.execute("SELECT COUNT(*) FROM news_articles").fetchone()[0]
        if count == 0:
            seed_database(connection)


def seed_database(connection: sqlite3.Connection) -> None:
    connection.execute("DELETE FROM news_articles")
    for article in DEFAULT_ARTICLES:
        upsert_article(connection, article)


def list_articles(include_drafts: bool) -> list[dict]:
    sql = "SELECT * FROM news_articles"
    params: tuple[str, ...] = ()
    if not include_drafts:
        sql += " WHERE status = ?"
        params = ("published",)
    sql += " ORDER BY published_date DESC, updated_at DESC"

    with connect_db() as connection:
        return [row_to_article(row) for row in connection.execute(sql, params).fetchall()]


def get_article(article_id: str, include_drafts: bool) -> dict | None:
    sql = "SELECT * FROM news_articles WHERE id = ?"
    params: tuple[str, ...] = (article_id,)
    if not include_drafts:
        sql += " AND status = ?"
        params = (article_id, "published")

    with connect_db() as connection:
        row = connection.execute(sql, params).fetchone()
        return row_to_article(row) if row else None


def upsert_article(connection: sqlite3.Connection, raw_article: dict) -> dict:
    article = normalize_article(raw_article)
    connection.execute(
        """
        INSERT INTO news_articles (
            id, title, category, author, published_date, image, summary, content, status, featured, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            category = excluded.category,
            author = excluded.author,
            published_date = excluded.published_date,
            image = excluded.image,
            summary = excluded.summary,
            content = excluded.content,
            status = excluded.status,
            featured = excluded.featured,
            updated_at = CURRENT_TIMESTAMP
        """,
        (
            article["id"],
            article["title"],
            article["category"],
            article["author"],
            article["date"],
            article["image"],
            article["summary"],
            article["content"],
            article["status"],
            1 if article["featured"] else 0,
        ),
    )
    return article


def verify_admin_credentials(username: str, password: str) -> bool:
    return hmac.compare_digest(username, ADMIN_USERNAME) and hmac.compare_digest(password, ADMIN_PASSWORD)


def parse_cookie_header(cookie_header: str) -> dict[str, str]:
    cookies: dict[str, str] = {}
    for cookie_part in cookie_header.split(";"):
        if "=" not in cookie_part:
            continue
        name, value = cookie_part.strip().split("=", 1)
        cookies[name] = value
    return cookies


def create_admin_session() -> str:
    session_id = secrets.token_urlsafe(32)
    ADMIN_SESSIONS.add(session_id)
    return session_id


def is_secure_server() -> bool:
    return bool(SSL_CERT_FILE and SSL_KEY_FILE)


class NewsHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT_DIR), **kwargs)

    def end_headers(self) -> None:
        if self.path.startswith("/api/"):
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Admin-Token")
            self.send_header("Access-Control-Allow-Credentials", "true")
        super().end_headers()

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/news") or parsed.path == "/api/auth/status":
            self.handle_api_get(parsed)
            return
        super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/login":
            payload = self.read_json_body()
            if not verify_admin_credentials(str(payload.get("username", "")), str(payload.get("password", ""))):
                self.send_json({"error": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"}, HTTPStatus.UNAUTHORIZED)
                return
            session_id = create_admin_session()
            self.send_json({"authenticated": True}, set_cookie=self.build_session_cookie(session_id))
            return
        if parsed.path == "/api/logout":
            self.clear_current_session()
            self.send_json({"authenticated": False}, set_cookie=self.build_session_cookie("", expire=True))
            return
        if parsed.path == "/api/news":
            if not self.require_admin():
                return
            payload = self.read_json_body()
            with connect_db() as connection:
                article = upsert_article(connection, payload)
            self.send_json({"article": article}, HTTPStatus.CREATED)
            return
        if parsed.path == "/api/news/reset":
            if not self.require_admin():
                return
            with connect_db() as connection:
                seed_database(connection)
            self.send_json({"articles": list_articles(True)})
            return
        self.send_error(HTTPStatus.NOT_FOUND)

    def do_PUT(self) -> None:
        article_id = self.get_article_id()
        if not article_id:
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        if not self.require_admin():
            return
        payload = self.read_json_body()
        payload["id"] = article_id
        with connect_db() as connection:
            article = upsert_article(connection, payload)
        self.send_json({"article": article})

    def do_DELETE(self) -> None:
        article_id = self.get_article_id()
        if not article_id:
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        if not self.require_admin():
            return
        with connect_db() as connection:
            connection.execute("DELETE FROM news_articles WHERE id = ?", (article_id,))
        self.send_json({"deleted": True})

    def handle_api_get(self, parsed) -> None:
        query = parse_qs(parsed.query)
        include_drafts = query.get("includeDrafts", ["false"])[0] == "true"
        if include_drafts and not self.require_admin():
            return

        if parsed.path == "/api/auth/status":
            self.send_json({"authenticated": self.is_admin_authenticated()})
            return

        if parsed.path == "/api/news":
            self.send_json({"articles": list_articles(include_drafts)})
            return

        article_id = self.get_article_id(parsed.path)
        if article_id:
            article = get_article(article_id, include_drafts)
            if article:
                self.send_json({"article": article})
            else:
                self.send_json({"error": "Article not found"}, HTTPStatus.NOT_FOUND)
            return

        self.send_error(HTTPStatus.NOT_FOUND)

    def get_article_id(self, path: str | None = None) -> str | None:
        api_path = path or urlparse(self.path).path
        prefix = "/api/news/"
        if api_path.startswith(prefix) and api_path != "/api/news/reset":
            return unquote(api_path[len(prefix):])
        return None

    def get_current_session_id(self) -> str:
        cookies = parse_cookie_header(self.headers.get("Cookie", ""))
        return cookies.get(SESSION_COOKIE, "")

    def is_admin_authenticated(self) -> bool:
        session_id = self.get_current_session_id()
        if session_id and session_id in ADMIN_SESSIONS:
            return True

        token = self.headers.get("X-Admin-Token", "")
        return bool(ADMIN_TOKEN and hmac.compare_digest(token, ADMIN_TOKEN))

    def clear_current_session(self) -> None:
        session_id = self.get_current_session_id()
        if session_id:
            ADMIN_SESSIONS.discard(session_id)

    def build_session_cookie(self, session_id: str, expire: bool = False) -> str:
        max_age = 0 if expire else SESSION_MAX_AGE_SECONDS
        secure_flag = "; Secure" if is_secure_server() else ""
        return f"{SESSION_COOKIE}={session_id}; Path=/; Max-Age={max_age}; HttpOnly; SameSite=Strict{secure_flag}"

    def require_admin(self) -> bool:
        if self.is_admin_authenticated():
            return True
        self.send_json({"error": "กรุณาเข้าสู่ระบบ Admin ก่อน"}, HTTPStatus.UNAUTHORIZED)
        return False

    def read_json_body(self) -> dict:
        length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(length).decode("utf-8") if length else "{}"
        return json.loads(raw_body or "{}")

    def send_json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK, set_cookie: str | None = None) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        if set_cookie:
            self.send_header("Set-Cookie", set_cookie)
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    initialize_database()
    server = ThreadingHTTPServer((HOST, PORT), NewsHandler)
    protocol = "http"

    if is_secure_server():
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(SSL_CERT_FILE, SSL_KEY_FILE)
        server.socket = context.wrap_socket(server.socket, server_side=True)
        protocol = "https"

    print(f"CHELSEA TH FANs backend running at {protocol}://{HOST}:{PORT}")
    print(f"SQLite database: {DB_PATH}")
    print(f"Admin username: {ADMIN_USERNAME}")
    print("Change ADMIN_PASSWORD before deploying publicly.")
    server.serve_forever()


if __name__ == "__main__":
    main()
