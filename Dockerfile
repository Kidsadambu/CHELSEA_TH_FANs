FROM python:3.12-slim

WORKDIR /app
COPY . /app

ENV HOST=0.0.0.0 \
    PORT=8000 \
    NEWS_DB_PATH=/app/data/news.sqlite3

EXPOSE 8000
CMD ["python3", "backend/server.py"]
