# Migration Guide

## สำหรับการจัดระเบียบไฟล์

เมื่อ branch นี้ถูก merge คุณจะต้องดำเนินการตามขั้นตอนนี้:

### ขั้นตอนที่ 1: ย้ายไฟล์ Pages
```bash
mkdir -p src/pages
mv index.html src/pages/
mv latest.html src/pages/
mv icon.html src/pages/
mv squad.html src/pages/
mv mens-fixtures.html src/pages/
mv mens-results.html src/pages/
```

### ขั้นตอนที่ 2: ย้ายไฟล์ Chapters
```bash
mkdir -p src/chapters
mv Chapter*.html src/chapters/
mv chapter.html src/chapters/
```

### ขั้นตอนที่ 3: ย้ายไฟล์ Trophies
```bash
mkdir -p src/trophies
mv Trophy*.html src/trophies/
mv Managers.html src/trophies/
```

### ขั้นตอนที่ 4: ย้ายไฟล์ Assets
```bash
mkdir -p assets/data assets/js
mv match_m.csv assets/data/
mv clubs.js assets/js/
mv fixtures.js assets/js/
```

### ขั้นตอนที่ 5: ย้ายไฟล์ Docs
```bash
mkdir -p docs
mv appearances.html docs/
```

### ขั้นตอนที่ 6: อัปเดตเส้นทาง (Paths)
ตรวจสอบและอัปเดต path ทั้งหมดใน HTML/JS files เพื่อให้ตรงกับโครงสร้างใหม่

### ขั้นตอนที่ 7: ทดสอบ
ทดสอบเว็บไซต์ให้แน่ใจว่าทุกลิงก์และการอ้างอิงทำงานถูกต้อง

---

**หมายเหตุ**: การจัดระเบียบนี้จะทำให้โปรเจกต์ดูระเบียบและง่ายต่อการจัดการ!
