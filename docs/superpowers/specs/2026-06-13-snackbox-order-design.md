# Snackbox Order Web App — Design Spec
**Date:** 2026-06-13
**Project:** `C:\Projects\snackbox-order`
**Client:** Nual Bakery 1988

---

## 1. Overview

Single-page ordering web app for Nual Bakery's ชุดเบรค (Snackbox) product line. Customers browse menu sets by price tier, build their order, provide delivery/pickup info, pay via PromptPay QR, upload a payment slip, and submit. The order is saved to Google Sheet and triggers a Telegram notification.

**Tech stack:** Static HTML + CSS + Vanilla JS (no build tool required) + Google Apps Script Web App as backend.

**Dev:** Local file (`index.html`) → Deploy to GitHub Pages or any static host.

---

## 2. Menu Data

### Price Tiers & Combos

#### ชุดเบรค 30 บาท
1. โรลครีม (คละรส) + บัตเตอร์เค้ก + น้ำส้ม
2. โรลครีม (คละรส) + ปังไส้เค้ก (คละรส)
3. โรลครีม (คละรส) + บราวนี่เม็ดมะม่วงมินิ
4. เอแคร์ + บัตเตอร์เค้ก
5. เอแคร์ + ปังไส้เค้ก (คละรส)
6. เอแคร์ + บราวนี่เม็ดมะม่วงมินิ
7. เค้กกล้วยหอม
8. เค้กถ้วย (คละรส)
9. ปังกลม 1 ชิ้น (คละรส)

#### ชุดเบรค 35 บาท
1. บราวนี่เม็ดมะม่วงมินิ + ปังไส้เค้ก
2. บัตเตอร์เค้ก + ปังไส้เค้ก
3. โรลครีม 2 ชิ้น (คละรส) + บัตเตอร์เค้ก
4. โรลครีม 2 ชิ้น (คละรส) + ปังไส้เค้ก (คละรส)
5. โรลครีม 2 ชิ้น (คละรส) + บราวนี่เม็ดมะม่วงมินิ
6. โรลครีม 1 ชิ้น (คละรส) + กล้วยหอม
7. โรลครีม 1 ชิ้น (คละรส) + เค้กถ้วย (คละรส)
8. โรลครีม 1 ชิ้น (คละรส) + ปังฝอยทอง
9. โรลครีม 1 ชิ้น (คละรส) + ปังไส้เผือก
10. โรลครีม 1 ชิ้น (คละรส) + ปังลูกเกด
11. โรลครีม 1 ชิ้น (คละรส) + ปังไส้กรอก

#### ชุดเบรค 40 บาท
1. ปังไส้กรอกแฮมชีส
2. ปังไส้กรอกชีส
3. ปังหมูหยองพริกเผา
4. ทอฟฟี่เค้กมินิ + บัตเตอร์เค้ก
5. ทอฟฟี่มินิ + ปังไส้เค้ก (คละรส)
6. บัตเตอร์เค้ก + ปังไส้เค้ก (คละรส)
7. ทอฟฟี่เค้ก
8. ปังไส้ถั่ว 5 รส
9. โรลครีม 1 ชิ้น (คละรส) + ปังฝอยทอง
10. โรลครีม 1 ชิ้น (คละรส) + ปังไส้เผือก
11. โรลครีม 1 ชิ้น (คละรส) + ปังลูกเกด
12. โรลครีม 1 ชิ้น (คละรส) + ปังไส้กรอก

#### ชุดเบรค 50 บาท
1. ปังไส้เค้ก (คละรส) + บัตเตอร์เค้ก + บราวนี่เม็ดมะม่วงมินิ
2. ปังไส้เค้ก (คละรส) + เค้กกล้วยหอม + โรลครีม (คละ)
3. ปังไส้เค้ก (คละรส) + เค้กถ้วย (คละ) + โรลครีม (คละ)
4. ปังไส้เค้ก (คละรส) + เอแคร์ 3 ชิ้น + โรลครีม (คละ)
5. คัพเค้กฝอยทอง 1 ชิ้น + โรลฝอยทอง (คละชิ้น)
6. คัพเค้กฝอยทอง 1 ชิ้น + บราวนี่เม็ดมะม่วงมินิ
7. แซนวิช 1 ชิ้น (คละ) + โรลครีม (คละ)
8. แซนวิช 1 ชิ้น (คละ) + เอแคร์ 1 ชิ้น
9. แซนวิช 1 ชิ้น + บราวนี่เม็ดมะม่วงมินิ
10. ทอฟฟี่เค้ก + บราวนี่เม็ดมะม่วงมินิ
11. ขนมปัง 2 ชิ้น (คละ)
12. ปังไส้กรอกแฮมชีส + บราวนี่เม็ดมะม่วงมินิ
13. ปังไส้กรอกแฮมชีส + โรลครีม (คละ)
14. ปังไส้กรอกแฮมชีส + เอแคร์ 1 ชิ้น
15. ขนมปังหมูหยองพริกเผา + โรลครีม (คละ)
16. ขนมปังหมูหยองพริกเผา + บราวนี่เม็ดมะม่วงมินิ
17. ขนมปังหมูหยองพริกเผา + เอแคร์ 1 ชิ้น

### Per-Item Options (ต่อแต่ละ combo ที่มีจำนวน > 0)
- น้ำส้ม: รับ / ไม่รับ (default: รับ) — ไม่มีราคาเพิ่ม
- กล่องเบรค: รับ / ไม่รับ (default: รับ) — ไม่มีราคาเพิ่ม

---

## 3. Order Flow (5 Steps)

```
Step 1: เลือกเมนู
Step 2: ข้อมูลการรับสินค้า
Step 3: ข้อมูลลูกค้า
Step 4: ชำระเงิน
Step 5: ยืนยันออเดอร์
```

Progress bar แสดงที่ด้านบนทุก step (ยกเว้น Step 1)

---

## 4. Step Detail

### Step 1 — เลือกเมนู
- Tab bar 4 แถบ: **30฿ / 35฿ / 40฿ / 50฿**
- แต่ละ combo แสดงเป็น card:
  - รูปสินค้า (ใช้รูปจาก assets/products/)
  - ชื่อเมนู
  - ราคา
  - ปุ่ม + / − และแสดงจำนวน
  - เมื่อจำนวน > 0: toggle น้ำส้ม + toggle กล่องเบรค ปรากฏใต้ card
- **Cart bar** ลอยด้านล่าง: แสดงจำนวนรายการรวม + ยอดรวม + ปุ่ม "ถัดไป"
- ปุ่มถัดไปเปิดใช้งานเมื่อมีสินค้าในตะกร้าอย่างน้อย 1 รายการ

### Step 2 — ข้อมูลการรับสินค้า
- **วันที่รับสินค้า:** date picker, เลือกได้เร็วสุดวันถัดไป +3 วัน (lead time)
- **วิธีรับ:**
  - รับที่สาขา (default) → dropdown 14 สาขา
  - จัดส่ง → แสดงได้เฉพาะเมื่อยอดรวม ≥ 4,000฿ (ก่อนส่วนลด); ถ้ายอดไม่ถึงจะ grey out พร้อมข้อความแจ้ง
- ถ้าเลือกจัดส่ง: textarea สำหรับที่อยู่จัดส่ง (required)

#### รายชื่อ 14 สาขา
1. รวมโชค (เชียงใหม่)
2. Big C Extra (เชียงใหม่)
3. Big C ดอนจั่น (เชียงใหม่)
4. Big C หางดง (เชียงใหม่)
5. 89 พลาซ่า (เชียงใหม่)
6. อบจ. เชียงใหม่ (เชียงใหม่)
7. เซ็นทรัล เชียงใหม่ (เชียงใหม่)
8. เซ็นทรัล เชียงใหม่ แอร์พอร์ต (เชียงใหม่)
9. โรงพยาบาลนครพิงค์ (เชียงใหม่)
10. โรงพยาบาลมหาราช สวนดอก (เชียงใหม่)
11. Big C ลำพูน (ลำพูน)
12. โรงพยาบาลลำปาง (ลำปาง)
13. โรงพยาบาลเชียงรายประชานุเคราะห์ (เชียงราย)
14. วังหลัง (กรุงเทพฯ)

### Step 3 — ข้อมูลลูกค้า
| Field | Required | Type |
|-------|----------|------|
| ชื่อ-นามสกุล | ✓ | text |
| เบอร์โทรศัพท์ | ✓ | tel (10 digits) |
| อีเมล | — | email |
| หน่วยงาน / บริษัท | — | text |
| ต้องการใบกำกับภาษี | — | checkbox |

**ถ้าเลือกใบกำกับภาษี** → แสดง sub-form:
| Field | Required |
|-------|----------|
| ชื่อบริษัท / นิติบุคคล | ✓ |
| เลขประจำตัวผู้เสียภาษี (13 หลัก) | ✓ |
| ที่อยู่สำหรับออกใบกำกับ | ✓ |

### Step 4 — ชำระเงิน
- สรุปยอดรวม (breakdown ต่อ tier)
- แสดง QR PromptPay (บจก. นวล เบเกอรี่1988)
- อัพโหลดสลิป: รับ JPG / PNG / PDF, ขนาดไม่เกิน 5MB
- ปุ่ม "ยืนยันการสั่งซื้อ" → disabled ระหว่าง submit + 30 วินาทีหลัง submit

### Step 5 — ยืนยันออเดอร์
- แสดงเลขออเดอร์ (รูปแบบ: NB-YYYYMMDD-XXX)
- สรุปรายการทั้งหมด
- แสดงข้อความ "ทีมงานจะติดต่อยืนยันออเดอร์ภายใน 24 ชั่วโมง"
- ปุ่ม "สั่งซื้อใหม่" → reset กลับ Step 1

---

## 5. UI Design

- **Color palette:** น้ำตาล `#5C3317`, ครีม `#FFF8F0`, ทอง accent `#C9973A`
- **Font:** Sarabun (Google Fonts) — ภาษาไทยอ่านง่าย
- **Layout:** Mobile-first, max-width 480px centered on desktop
- **Cards:** rounded corners, shadow เล็กน้อย, รูปสินค้าด้านบน
- **Buttons:** ใหญ่ กดง่ายบน mobile (min-height 48px)
- **Step indicator:** progress dots/bar ด้านบน Step 2–5

---

## 6. Backend — Google Apps Script

### Web App (`Code.gs`)
**Endpoint:** `POST https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec`

**Receives:**
```json
{
  "orderNumber": "NB-20260613-001",
  "timestamp": "2026-06-13T14:00:00+07:00",
  "items": [...],
  "total": 1500,
  "pickupDate": "2026-06-16",
  "deliveryMethod": "branch | delivery",
  "branch": "รวมโชค",
  "deliveryAddress": "",
  "customer": { "name": "", "phone": "", "email": "", "org": "" },
  "taxInvoice": { "required": false, "companyName": "", "taxId": "", "address": "" },
  "slipBase64": "data:image/jpeg;base64,..."
}
```

**Actions (in order):**
1. Validate required fields — ถ้าไม่ผ่าน return error 400
2. Check origin header (whitelist domain)
3. Generate order number (ถ้าไม่ได้ส่งมา)
4. Save slip image to Google Drive → folder `/NualBakery-Orders/YYYY-MM/`
5. Append row to Google Sheet
6. Send Telegram message via Bot API
7. Return `{ success: true, orderNumber: "..." }`

### Google Sheet Columns
| # | Column |
|---|--------|
| 1 | Timestamp |
| 2 | เลขออเดอร์ |
| 3 | ชื่อลูกค้า |
| 4 | เบอร์โทร |
| 5 | อีเมล |
| 6 | หน่วยงาน |
| 7 | รายการ (JSON string) |
| 8 | ยอดรวม |
| 9 | วันที่รับ |
| 10 | วิธีรับ (สาขา/จัดส่ง) |
| 11 | สาขา / ที่อยู่จัดส่ง |
| 12 | ใบกำกับภาษี |
| 13 | ข้อมูลใบกำกับ |
| 14 | URL สลิป (Google Drive) |
| 15 | สถานะ (รอยืนยัน / ยืนยันแล้ว / จัดส่งแล้ว) |

### Telegram Notification Format
```
🧁 ออเดอร์ใหม่ NB-20260613-001
👤 คุณสมชาย โทร 0812345678
📅 รับวันที่: 16 มิ.ย. 2569
📍 สาขา: รวมโชค
💰 ยอดรวม: ฿1,500
---
รายการ:
• ชุด 30฿ x5 (น้ำส้ม✓ กล่อง✓)
• ชุด 50฿ x3 (น้ำส้ม✗ กล่อง✓)
```

---

## 7. Security

| Layer | Measure |
|-------|---------|
| Frontend | Input sanitization (strip HTML tags), tel regex validation, email format check, tax ID 13-digit check |
| File upload | MIME type whitelist (image/jpeg, image/png, application/pdf), max 5MB enforced client-side |
| Honeypot | Hidden field `website` — if filled, silently reject submission |
| Submit rate limit | Disable submit button 30s after click, show countdown |
| Apps Script | Check `Origin` / `Referer` header against allowed domain whitelist |
| Apps Script | Re-validate all required fields server-side |
| Apps Script | Telegram Bot Token + Sheet ID stored in Script Properties (never in frontend code) |
| Google Drive | Slip folder set to private (not publicly accessible) |

---

## 8. File Structure

```
C:\Projects\snackbox-order\
├── index.html
├── style.css
├── app.js
├── assets/
│   ├── logo.png              ← Nual Bakery logo
│   ├── qr-payment.png        ← copy จาก "Snack box/QR รับเงินบริษัท/"
│   └── products/             ← รูปขนมแต่ละชิ้น (ตั้งชื่อตาม slug)
├── gas/
│   └── Code.gs               ← Google Apps Script source
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-06-13-snackbox-order-design.md
```

---

## 9. Out of Scope (v1)

- Admin dashboard
- Order status tracking for customers
- Payment gateway (ใช้ QR + manual slip แทน)
- SMS notification
- Inventory / stock management
- Discount / coupon system
