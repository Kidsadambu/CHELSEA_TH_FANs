# CHELSEA TH FANs Backend

ระบบข่าวตอนนี้รองรับ 2 โหมด: (1) Vercel Functions + Vercel KV สำหรับให้คนทั่วโลกเห็นข่าวเดียวกันบนเว็บที่ deploy ด้วย Vercel และ (2) Python backend + SQLite สำหรับรันบน VPS/Docker เอง เหมาะกับกรณีมี Admin คนเดียว

## 1) ตั้งค่ารหัสผ่าน Admin ให้เปลี่ยนได้ง่าย

คัดลอกไฟล์ตัวอย่างและเปลี่ยนรหัสผ่านก่อนเปิดใช้งานจริง:

```bash
cp .env.example .env
```

ค่าเริ่มต้นตามที่ขอไว้สำหรับเริ่มทดสอบคือ:

```env
ADMIN_USERNAME=kaebmoopingkai3737
ADMIN_PASSWORD=1234567890
```

> สำคัญ: ให้เปลี่ยน `ADMIN_PASSWORD` เป็นรหัสใหม่ที่ยาวและเดายากก่อนเปิดเว็บสาธารณะ

## 2) ใช้งานบน Vercel ให้คนทั่วโลกเห็นข่าวเดียวกัน

หาก deploy บน Vercel ให้เชื่อม Vercel KV กับโปรเจกต์ก่อน แล้วตั้ง Environment Variables เหล่านี้ใน Vercel Project Settings:

```env
ADMIN_USERNAME=kaebmoopingkai3737
ADMIN_PASSWORD=เปลี่ยนรหัสใหม่ก่อนเปิดจริง
SESSION_SECRET=สุ่มข้อความยาวๆสำหรับเซ็น session cookie
KV_REST_API_URL=ค่าจาก Vercel KV
KV_REST_API_TOKEN=ค่าจาก Vercel KV
```

ระบบ `/api/*` ในโฟลเดอร์ `api/` จะทำงานเป็น Vercel Functions และบันทึกข่าวลง Vercel KV ดังนั้นข่าวที่ Admin เขียนจะถูกดึงจากฐานข้อมูลกลางและคนทั่วโลกจะเห็นเหมือนกัน

ลิงก์ลับสำหรับ Admin คือ:

```text
/admin-portal-kaebmoopingkai3737.html
```

ลิงก์นี้ไม่ถูกแสดงในหน้า public และหน้า Admin ถูกตั้งค่า `noindex,nofollow` แล้ว

## 3) วิธีรันแบบ local ด้วย Python + SQLite

```bash
set -a
source .env
set +a
python3 backend/server.py
```

จากนั้นเปิดเว็บผ่าน backend server:

- หน้าบ้าน: <http://127.0.0.1:8000/latest.html>
- หลังบ้าน: <http://127.0.0.1:8000/admin-news.html>

ในหน้า Admin ให้ login ด้วย username/password ข้างต้น แล้วค่อยบันทึก/แก้ไข/ลบข่าว

## 4) HTTPS

สำหรับ production แนะนำให้วางหลัง reverse proxy เช่น Caddy/Nginx ที่ออก HTTPS ให้ หรือกำหนด cert/key ให้ server โดยตรง:

```env
SSL_CERT_FILE=/etc/letsencrypt/live/example.com/fullchain.pem
SSL_KEY_FILE=/etc/letsencrypt/live/example.com/privkey.pem
```

เมื่อกำหนด 2 ค่านี้ backend จะเสิร์ฟเป็น HTTPS และ session cookie จะถูกตั้งค่า `Secure`

## 5) Backup ฐานข้อมูล SQLite

ข่าวทั้งหมดอยู่ใน `data/news.sqlite3` ให้ backup เป็นประจำด้วยคำสั่ง:

```bash
python3 backend/backup_db.py
```

ไฟล์ backup จะอยู่ใน `data/backups/` หรือ path ที่กำหนดด้วย `NEWS_BACKUP_DIR`

## 6) รันถาวรด้วย Docker หรือ systemd

Docker:

```bash
docker build -t chelsea-th-fans .
docker run --env-file .env -p 8000:8000 -v "$PWD/data:/app/data" chelsea-th-fans
```

systemd ตัวอย่างอยู่ที่ `deploy/chelsea-th-fans.service` ให้แก้ `WorkingDirectory` และ `EnvironmentFile` ให้ตรง server จริง แล้วค่อย enable service

## API หลัก

- `POST /api/login` — login Admin ด้วย username/password และรับ session cookie ทั้งบน Vercel Functions และ Python backend
- `POST /api/logout` — logout Admin
- `GET /api/auth/status` — ตรวจสถานะ login
- `GET /api/news` — ดึงข่าวที่เผยแพร่แล้ว
- `GET /api/news?includeDrafts=true` — ดึงข่าวทั้งหมด ต้อง login หรือส่ง `X-Admin-Token`
- `GET /api/news/:id` — ดึงรายละเอียดข่าวที่เผยแพร่แล้ว
- `POST /api/news` — สร้างข่าว ต้อง login หรือส่ง `X-Admin-Token`
- `PUT /api/news/:id` — แก้ไขข่าว ต้อง login หรือส่ง `X-Admin-Token`
- `DELETE /api/news/:id` — ลบข่าว ต้อง login หรือส่ง `X-Admin-Token`
- `POST /api/news/reset` — รีเซ็ตข้อมูลตัวอย่าง ต้อง login หรือส่ง `X-Admin-Token`

ฐานข้อมูล SQLite จะถูกสร้างที่ `data/news.sqlite3` โดยอัตโนมัติ และไฟล์ฐานข้อมูล/backup ถูก ignore ไม่ commit เข้า git
