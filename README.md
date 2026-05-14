# 🔵⚪ CHELSEA Thailand FANs

แฟนเพจเชลซีไทยแลนด์อย่างเป็นทางการ

## 📁 โครงสร้างโปรเจกต์

```
CHELSEA_TH_FANs/
├── src/
│   ├── pages/              # หน้าเว็บหลัก
│   │   ├── index.html      # หน้าแรก
│   │   ├── latest.html     # ข่าวสาร
│   │   ├── squad.html      # รายชื่อทีม
│   │   └── ...
│   ├── chapters/           # บทเรียนประวัติศาสตร์เชลซี
│   │   ├── Chapter1.html
│   │   ├── Chapter2.html
│   │   └── ...
│   └── trophies/           # รางวัล แลและผู้จัดการ
│       ├── Trophy.html
│       ├── Trophy_m_1.html
│       ├── Managers.html
│       └── ...
├── assets/
│   ├── data/               # ไฟล์ข้อมูล
│   │   └── match_m.csv     # ข้อมูลการแข่งขัน
│   └── js/                 # ไฟล์ JavaScript
│       ├── clubs.js
│       └── fixtures.js
├── docs/                   # เอกสารอื่นๆ
│   ├── appearances.html
│   └── ...
├── tools/                  # เครื่องมือและไฟล์พิเศษ
│   └── ...
├── README.md               # ไฟล์นี้
└── MIGRATION_GUIDE.md      # คำแนะนำการอัปเดต
```

## 📖 รายละเอียด

### 🏟️ Pages (`src/pages/`)
- `index.html` - หน้าแรก
- `latest.html` - ข่าวสารล่าสุด
- `icon.html` - ไอคอนและอื่นๆ
- `squad.html` - รายชื่อผู้เล่น
- `mens-fixtures.html` - ตารางการแข่งขัน
- `mens-results.html` - ผลการแข่งขัน

### 📚 Chapters (`src/chapters/`)
บทเรียนเกี่ยวกับประวัติศาสตร์เชลซี
- Chapter1.html - Chapter9.html
- chapter.html - หน้าหลักบท

### 🏆 Trophies (`src/trophies/`)
รางวัลและข้อมูลผู้จัดการ
- Trophy.html - หน้ารางวัลหลัก
- Trophy_m_1.html - Trophy_m_38.html - รายละเอียดผู้จัดการแต่ละคน
- Managers.html - รายชื่อผู้จัดการ

### 📊 Assets (`assets/`)
- `data/match_m.csv` - ข้อมูลการแข่งขันทั้งหมด
- `js/clubs.js` - ข้อมูลสโมสร
- `js/fixtures.js` - ข้อมูลตารางแข่งขัน

### 📄 Docs (`docs/`)
- `appearances.html` - ข้อมูลการปรากฏตัว

## 🔧 อัปเดต Paths

หลังจากจัดระเบียบแล้ว ต้องอัปเดต path ใน HTML/JS files:

### ตัวอย่างการอัปเดต:
```html
<!-- เดิม -->
<a href="Chapter1.html">บทที่ 1</a>

<!-- ใหม่ -->
<a href="../../src/chapters/Chapter1.html">บทที่ 1</a>
```

## 🚀 การใช้งาน

1. Clone repository
   ```bash
   git clone https://github.com/Kidsadambu/CHELSEA_TH_FANs.git
   ```

2. เปิดไฟล์ `src/pages/index.html` ในเบราวเซอร์

3. เดิดเบราวเซอร์ไปยังเพจต่างๆ

## 📝 หมายเหตุ

- โครงสร้างนี้ได้รับการจัดระเบียบตามมาตรฐาน best practice
- ใช้ `.gitkeep` เพื่อให้ Git รักษาโฟลเดอร์ว่างไว้
- สำหรับข้อมูลการอัปเดต ดูไฟล์ `MIGRATION_GUIDE.md`

## 📞 ติดต่อ

**Developer**: Kidsadambu  
**Repository**: https://github.com/Kidsadambu/CHELSEA_TH_FANs  
**Website**: https://chelsea-th-fans.vercel.app

---

**ขอบคุณที่เป็นแฟนเชลซี!** 💙⚪
