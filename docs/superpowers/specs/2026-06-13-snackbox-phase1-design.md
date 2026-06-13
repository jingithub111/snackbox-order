# Snackbox Order System — Phase 1 Design

**Date:** 2026-06-13  
**Status:** Approved  
**Scope:** Customer order form (mobile-first) + Node.js backend + Admin panel  

---

## 1. Overview

ระบบรับออเดอร์ Snack Box สำหรับลูกค้าองค์กร (B2B) ของนวลเบเกอรี่ 1988
ลูกค้าสั่งผ่านมือถือ → ระบบบันทึกและแจ้ง Admin → Admin ตอบกลับทาง Facebook

---

## 2. Scope — Phase 1

| Feature | รายละเอียด |
|---------|-----------|
| เมนูใหม่ (Grouped Cards) | จัดกลุ่ม 175 SKU → ~20 กลุ่มต่อ tier เลือกรสด้วย chip |
| รูปสินค้า | Emoji + gradient placeholder — เพิ่มรูปจริงทีหลัง |
| Mobile-first UI | ออกแบบเพื่อมือถือเป็นหลัก, font ≥16px, tap target ≥44px |
| แก้รูป Hero จาก Admin | Admin อัปโหลด Logo (profile icon) + Cover image ได้จากหลังบ้าน |
| บันทึกออเดอร์ | Google Sheets (append row ทุกออเดอร์) |
| แจ้งเตือน Admin | Telegram Bot — ส่งทันทีเมื่อมีออเดอร์ใหม่ |
| เก็บสลิปโอนเงิน | Google Drive (folder แยกตามวัน) |
| Admin Panel | ดูออเดอร์ + Copy FB message + ดูสลิป + Login |
| Local dev | รันได้บน localhost ก่อน deploy Railway |

**ไม่อยู่ใน Phase 1:** Analytics dashboard, CMS แก้เมนูจากหลังบ้าน, LINE/Messenger automation

---

## 3. Architecture

```
snackbox-order/          (Frontend — GitHub Pages)
├── index.html
├── app.js               ← เมนูใหม่ Grouped Cards
├── style.css            ← mobile-first updates
└── assets/

snackbox-admin/          (Backend — Railway)
├── server.js            ← Express entry point
├── routes/
│   ├── orders.js        ← POST /api/orders
│   ├── admin.js         ← GET /admin/*
│   └── auth.js          ← POST /auth/login, /auth/logout
├── services/
│   ├── sheets.js        ← Google Sheets API (googleapis)
│   ├── telegram.js      ← Telegram Bot API (node-telegram-bot-api)
│   └── drive.js         ← Google Drive upload (slip images)
├── admin/               ← Static HTML admin panel
│   ├── login.html
│   ├── orders.html      ← order list + copy FB button
│   └── order.html       ← order detail + slip viewer
├── middleware/
│   └── auth.js          ← session check middleware
├── package.json
└── .env                 ← secrets (gitignored)
```

### Data Flow

```
Customer (mobile) 
  → POST /api/orders (multipart: JSON + slip image)
  → Express validates + generates order number
  → Upload slip → Google Drive
  → Append row → Google Sheet
  → Send message → Telegram Bot
  → Return { orderNumber, status: 'ok' }

Admin
  → GET /admin/orders → reads Google Sheet
  → Click "Copy FB" → copies formatted message to clipboard
  → Click "View Slip" → signed Google Drive URL
```

---

## 4. Frontend — Menu Redesign (Grouped Cards)

### Data Structure

```js
const MENU_GROUPS = {
  30: [
    {
      groupId: 'g30-roll-butter',
      name: 'โรลครีม + บัตเตอร์เค้ก',
      icon: '🥐',
      gradient: ['#e8f5e9', '#c8e6c9'],
      price: 30,
      selectors: [
        { key: 'roll', label: 'รสโรลครีม', options: ['ใบเตย', 'ส้ม', 'กาแฟ'] }
      ],
      // skuMap: { 'ใบเตย': 'S30A1', 'ส้ม': 'S30A2', 'กาแฟ': 'S30A3' }
      skuMap: { roll: { 'ใบเตย': 'S30A1', 'ส้ม': 'S30A2', 'กาแฟ': 'S30A3' } }
    },
    // ... ~20 groups per tier
  ]
}
```

### Cart State

```js
// Key = SKU (e.g. 'S30A1'), Value = { qty, juice }
state.cart = {
  'S30A1': { qty: 3, juice: true },
  'S30D1': { qty: 5, juice: false },
}
```

### Card Interaction

1. ลูกค้าเห็นการ์ดเรียงในแนวตั้ง (1 column mobile, 2 column tablet)
2. ถ้ากลุ่มมี selectors → ต้องเลือกรสก่อน กด + ได้
3. เลือกรส = highlight chip → cart key = SKU ที่ตรงกับ selector combination
4. แต่ละ selector combination เป็น line item แยกกันใน cart
5. Juice toggle ยังคงอยู่ต่อ line item

### Mobile-First Rules

- Font ขั้นต่ำ 16px (ไม่ zoom บน iOS)
- Tap target ขั้นต่ำ 44×44px (chip, qty button)
- Card full-width บน mobile, 2-col บน ≥480px
- Sticky cart bar ด้านล่าง (safe area padding สำหรับ iPhone notch)
- Step progress bar แสดงบน mobile ด้วย

---

## 5. Backend — API Endpoints

### POST /api/orders
รับ multipart/form-data:
- `order` (JSON string): cart, date, method, branch/address, customer, taxInvoice
- `slip` (file): JPG/PNG/PDF ≤5MB

Response:
```json
{ "orderNumber": "NB-20260613-123", "status": "ok" }
```

### POST /auth/login
Body: `{ username, password }`  
Response: set session cookie, redirect to `/admin/orders`

### GET /auth/logout
Clear session, redirect to `/admin/login`

### GET /admin/orders
Protected. Reads Google Sheet → returns HTML page with order list.

### GET /admin/orders/:id
Protected. Returns order detail page with slip viewer.

---

## 6. Google Sheet Structure

**Sheet name:** `Orders`

| Column | Field | Type |
|--------|-------|------|
| A | OrderID | NB-YYYYMMDD-XXX |
| B | Timestamp | ISO datetime |
| C | CustomerName | string |
| D | Phone | string |
| E | Email | string |
| F | Org | string |
| G | PickupDate | YYYY-MM-DD |
| H | Method | branch / delivery |
| I | BranchOrAddress | string |
| J | Items | JSON string |
| K | Total | number |
| L | TaxInvoice | boolean |
| M | TaxData | JSON string |
| N | SlipDriveUrl | Google Drive URL |
| O | TelegramSent | boolean |
| P | Status | new / confirmed / done |

---

## 7. Telegram Notification Format

```
🛒 ออเดอร์ใหม่! #{OrderID}
📅 วันรับ: {PickupDate} ({DayName})
📍 {Method}: {BranchOrAddress}
👤 {CustomerName} / {Phone}
{Org ? '🏢 ' + Org : ''}

รายการ:
{Items.map(i => '• ' + i.name + ' × ' + i.qty + (i.juice ? ' 🍊' : '')).join('\n')}

💰 ยอดรวม: ฿{Total}
{TaxInvoice ? '🧾 ต้องการใบกำกับภาษี' : ''}
🖼 สลิป: {SlipDriveUrl}
```

---

## 8. Admin Panel — Copy FB Message Template

```
✅ นวลเบเกอรี่ยืนยันออเดอร์ #{OrderID}

📅 วันรับ: {DayName}ที่ {PickupDate}
📍 รับที่: {BranchOrAddress}
👤 คุณ{CustomerName} / {Phone}

{Items.map(i => '• ' + i.name + ' × ' + i.qty).join('\n')}
💰 ยอดรวม ฿{Total}

ขอบคุณที่สั่งซื้อนะคะ 🙏 ทางร้านจะเตรียมให้พร้อมในวันที่ระบุค่ะ
หากมีข้อสงสัยทักมาได้เลยนะคะ
```

---

## 9. Auth

- Username + password เก็บใน `.env` (`ADMIN_USER`, `ADMIN_PASS`)
- Session ด้วย `express-session` + `connect-sqlite3` (local) / memory (dev)
- Session expire: 8 ชั่วโมง
- ไม่มี rate limit (Phase 1) — เพิ่มใน Phase 2

---

## 10. Environment Variables (.env)

```
PORT=3001
ADMIN_USER=admin
ADMIN_PASS=<set_by_user>
SESSION_SECRET=<random_string>

GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
GOOGLE_SHEET_ID=...
GOOGLE_DRIVE_FOLDER_ID=...

TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

---

## 11. Local Dev Setup

```bash
# Terminal 1 — frontend
cd C:\Projects\snackbox-order
# open index.html in browser (or use Live Server)

# Terminal 2 — backend
cd C:\Projects\snackbox-admin
npm install
cp .env.example .env   # fill in values
node server.js         # runs on localhost:3001
```

Frontend ส่ง POST ไป `http://localhost:3001/api/orders`  
Admin panel เปิดที่ `http://localhost:3001/admin`

---

## 12. Dependencies

```json
{
  "express": "^4.18",
  "express-session": "^1.17",
  "multer": "^1.4",
  "googleapis": "^134",
  "node-telegram-bot-api": "^0.64",
  "dotenv": "^16",
  "connect-sqlite3": "^0.9"
}
```

---

## 13. Admin — Hero Image Management

Admin สามารถแก้รูปในส่วน Hero ของหน้าสั่งซื้อได้จาก Admin Panel:

| รูป | ขนาดแนะนำ | เก็บที่ | Default |
|-----|-----------|---------|---------|
| Logo (profile icon) | 200×200px, PNG | Google Drive → serve via `/api/assets/logo` | emoji 🧁 |
| Cover / Banner | 1200×400px, JPG | Google Drive → serve via `/api/assets/cover` | gradient CSS |

**Flow:**
1. Admin เปิดหน้า Settings ใน Admin Panel
2. กด "เปลี่ยน Logo" หรือ "เปลี่ยนรูป Cover"
3. เลือกไฟล์ → อัปโหลด → บันทึกใน Google Drive (แทนที่ไฟล์เดิม)
4. Frontend โหลดรูปจาก `/api/assets/logo` และ `/api/assets/cover` ทุกครั้งที่เปิดหน้า

---

## 15. Out of Scope (Phase 2+)

- Analytics / Sales dashboard
- CMS — แก้เมนูจาก admin panel
- LINE / Messenger automation
- Order status tracking for customers
- Multi-admin accounts
- Rate limiting / CAPTCHA
