# Snackbox Admin Backend — Node.js + Express Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `C:\Projects\snackbox-admin\` — a Node.js + Express server that receives snackbox orders from the frontend, stores them in Google Sheets, sends Telegram notifications, stores slip images in Google Drive, and serves an admin panel (order list + detail + settings + login).

**Architecture:** Single Express app. Routes split by concern (orders API, admin HTML, auth, assets). Services are pure functions that wrap Google/Telegram APIs. Admin panel is server-rendered HTML (no framework). Session auth guards all `/admin/*` and `/api/assets` write routes.

**Tech Stack:** Node.js 18+, Express 4.18, express-session 1.17, multer 1.4, googleapis 134, node-telegram-bot-api 0.64, dotenv 16, connect-sqlite3 0.9

---

## File Structure

```
C:\Projects\snackbox-admin\
├── server.js                 ← Express entry point, wires routes
├── routes/
│   ├── orders.js             ← POST /api/orders
│   ├── admin.js              ← GET /admin/login, /admin/orders, /admin/orders/:id, /admin/settings
│   ├── auth.js               ← POST /auth/login, GET /auth/logout
│   └── assets.js             ← GET /api/assets/logo, GET /api/assets/cover, POST /api/assets/logo, POST /api/assets/cover
├── services/
│   ├── sheets.js             ← appendOrder(orderRow), getOrders(), getOrder(orderId)
│   ├── telegram.js           ← sendOrderNotification(order)
│   └── drive.js              ← uploadSlip(fileBuffer, filename, mimeType), getSignedUrl(fileId), uploadAsset(fileBuffer, assetName)
├── middleware/
│   └── auth.js               ← requireAuth(req,res,next) session check
├── admin/
│   ├── login.html            ← static login form
│   ├── orders.html           ← order list template (served by admin.js)
│   ├── order.html            ← order detail template
│   └── settings.html         ← hero image upload UI
├── .env.example              ← template (no secrets)
├── .env                      ← actual secrets (gitignored)
├── .gitignore
└── package.json
```

---

## Task 1: Project scaffold

**Files:**
- Create: `C:\Projects\snackbox-admin\package.json`
- Create: `C:\Projects\snackbox-admin\.gitignore`
- Create: `C:\Projects\snackbox-admin\.env.example`

- [ ] **Step 1: Create directory and package.json**

```powershell
New-Item -ItemType Directory -Force "C:\Projects\snackbox-admin"
Set-Location "C:\Projects\snackbox-admin"
```

Write `C:\Projects\snackbox-admin\package.json`:

```json
{
  "name": "snackbox-admin",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "connect-sqlite3": "^0.9.15",
    "dotenv": "^16.4.5",
    "express": "^4.18.3",
    "express-session": "^1.17.3",
    "googleapis": "^134.0.0",
    "multer": "^1.4.5-lts.1",
    "node-telegram-bot-api": "^0.64.0"
  }
}
```

- [ ] **Step 2: Create .gitignore**

Write `C:\Projects\snackbox-admin\.gitignore`:

```
node_modules/
.env
*.sqlite
sessions/
```

- [ ] **Step 3: Create .env.example**

Write `C:\Projects\snackbox-admin\.env.example`:

```
PORT=3001
ADMIN_USER=admin
ADMIN_PASS=change_me
SESSION_SECRET=change_me_to_random_string

GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id_here
GOOGLE_DRIVE_ASSETS_FOLDER_ID=your_assets_folder_id_here

TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

- [ ] **Step 4: Install dependencies**

```powershell
cd C:\Projects\snackbox-admin
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 5: Create .env from example**

```powershell
Copy-Item .env.example .env
```

Edit `.env` — for local dev, only `PORT`, `ADMIN_USER`, `ADMIN_PASS`, `SESSION_SECRET` are needed for the admin UI to work. Google and Telegram keys can be filled in later.

- [ ] **Step 6: Init git**

```powershell
cd C:\Projects\snackbox-admin
git init
git add package.json .gitignore .env.example
git commit -m "init: scaffold snackbox-admin project"
```

---

## Task 2: Services — Google Sheets

**Files:**
- Create: `C:\Projects\snackbox-admin\services\sheets.js`

- [ ] **Step 1: Create services directory and sheets.js**

Write `C:\Projects\snackbox-admin\services\sheets.js`:

```js
'use strict';
const { google } = require('googleapis');

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheets() {
  return google.sheets({ version: 'v4', auth: getAuth() });
}

const SHEET_NAME = 'Orders';
const SHEET_ID = () => process.env.GOOGLE_SHEET_ID;

// Ensure header row exists (idempotent)
async function ensureHeader() {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID(),
    range: `${SHEET_NAME}!A1:P1`,
  });
  const row = res.data.values?.[0];
  if (!row || row[0] !== 'OrderID') {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID(),
      range: `${SHEET_NAME}!A1:P1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'OrderID', 'Timestamp', 'CustomerName', 'Phone', 'Email', 'Org',
          'PickupDate', 'Method', 'BranchOrAddress', 'Items',
          'Total', 'TaxInvoice', 'TaxData', 'SlipDriveUrl', 'TelegramSent', 'Status',
        ]],
      },
    });
  }
}

async function appendOrder(order) {
  await ensureHeader();
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID(),
    range: `${SHEET_NAME}!A:P`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [[
        order.orderNumber,
        order.timestamp,
        order.customerName,
        order.phone,
        order.email || '',
        order.org || '',
        order.pickupDate,
        order.method,
        order.branchOrAddress,
        JSON.stringify(order.items),
        order.total,
        order.taxInvoice ? 'TRUE' : 'FALSE',
        order.taxData ? JSON.stringify(order.taxData) : '',
        order.slipDriveUrl || '',
        order.telegramSent ? 'TRUE' : 'FALSE',
        'new',
      ]],
    },
  });
}

async function getOrders() {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID(),
    range: `${SHEET_NAME}!A2:P`,
  });
  return (res.data.values || []).map(rowToOrder).reverse(); // newest first
}

async function getOrder(orderId) {
  const orders = await getOrders();
  return orders.find(o => o.orderNumber === orderId) || null;
}

async function updateStatus(orderId, status) {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID(),
    range: `${SHEET_NAME}!A:A`,
  });
  const rows = res.data.values || [];
  const rowIndex = rows.findIndex(r => r[0] === orderId);
  if (rowIndex < 0) return;
  const rowNum = rowIndex + 1; // 1-indexed, row 1 is header so data starts at row 2
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID(),
    range: `${SHEET_NAME}!P${rowNum}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[status]] },
  });
}

function rowToOrder(row) {
  return {
    orderNumber: row[0] || '',
    timestamp: row[1] || '',
    customerName: row[2] || '',
    phone: row[3] || '',
    email: row[4] || '',
    org: row[5] || '',
    pickupDate: row[6] || '',
    method: row[7] || '',
    branchOrAddress: row[8] || '',
    items: safeJsonParse(row[9], []),
    total: Number(row[10]) || 0,
    taxInvoice: row[11] === 'TRUE',
    taxData: safeJsonParse(row[12], null),
    slipDriveUrl: row[13] || '',
    telegramSent: row[14] === 'TRUE',
    status: row[15] || 'new',
  };
}

function safeJsonParse(str, fallback) {
  try { return JSON.parse(str); } catch { return fallback; }
}

module.exports = { appendOrder, getOrders, getOrder, updateStatus };
```

- [ ] **Step 2: Verify syntax**

```powershell
cd C:\Projects\snackbox-admin
node -e "require('./services/sheets.js'); console.log('OK')"
```
Expected: `OK` (no errors — just imports, doesn't call Google yet).

- [ ] **Step 3: Commit**

```powershell
git add services/sheets.js
git commit -m "feat: Google Sheets service (append, list, get orders)"
```

---

## Task 3: Services — Google Drive and Telegram

**Files:**
- Create: `C:\Projects\snackbox-admin\services\drive.js`
- Create: `C:\Projects\snackbox-admin\services\telegram.js`

- [ ] **Step 1: Create drive.js**

Write `C:\Projects\snackbox-admin\services\drive.js`:

```js
'use strict';
const { google } = require('googleapis');
const { Readable } = require('stream');

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive',
    ],
  });
}

function getDrive() {
  return google.drive({ version: 'v3', auth: getAuth() });
}

async function uploadSlip(fileBuffer, filename, mimeType, orderId) {
  const drive = getDrive();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  // Create dated sub-folder name (YYYYMMDD)
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const subFolderId = await getOrCreateFolder(drive, today, folderId);

  const res = await drive.files.create({
    requestBody: {
      name: `${orderId}_${filename}`,
      parents: [subFolderId],
    },
    media: {
      mimeType,
      body: Readable.from(fileBuffer),
    },
    fields: 'id,webViewLink',
  });

  // Make publicly readable so admin can view link
  await drive.permissions.create({
    fileId: res.data.id,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  return res.data.webViewLink;
}

async function uploadAsset(fileBuffer, assetName, mimeType) {
  const drive = getDrive();
  const folderId = process.env.GOOGLE_DRIVE_ASSETS_FOLDER_ID;

  // Check if file already exists with this name — delete it first (replace)
  const existing = await drive.files.list({
    q: `name='${assetName}' and '${folderId}' in parents and trashed=false`,
    fields: 'files(id)',
  });
  for (const f of (existing.data.files || [])) {
    await drive.files.delete({ fileId: f.id });
  }

  const res = await drive.files.create({
    requestBody: { name: assetName, parents: [folderId] },
    media: { mimeType, body: Readable.from(fileBuffer) },
    fields: 'id',
  });

  await drive.permissions.create({
    fileId: res.data.id,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  return res.data.id;
}

async function getAssetBuffer(assetName) {
  const drive = getDrive();
  const folderId = process.env.GOOGLE_DRIVE_ASSETS_FOLDER_ID;

  const res = await drive.files.list({
    q: `name='${assetName}' and '${folderId}' in parents and trashed=false`,
    fields: 'files(id)',
  });
  const file = res.data.files?.[0];
  if (!file) return null;

  const resp = await drive.files.get(
    { fileId: file.id, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(resp.data);
}

async function getOrCreateFolder(drive, name, parentId) {
  const res = await drive.files.list({
    q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
  });
  if (res.data.files.length > 0) return res.data.files[0].id;
  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  });
  return created.data.id;
}

module.exports = { uploadSlip, uploadAsset, getAssetBuffer };
```

- [ ] **Step 2: Create telegram.js**

Write `C:\Projects\snackbox-admin\services\telegram.js`:

```js
'use strict';
const TelegramBot = require('node-telegram-bot-api');

let _bot = null;
function getBot() {
  if (!_bot && process.env.TELEGRAM_BOT_TOKEN) {
    _bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
  }
  return _bot;
}

const DAYS_TH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

function formatDate(dateStr) {
  if (!dateStr) return dateStr;
  const d = new Date(dateStr + 'T12:00:00');
  return `${DAYS_TH[d.getDay()]}ที่ ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`;
}

async function sendOrderNotification(order) {
  const bot = getBot();
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!bot || !chatId) return false;

  const itemLines = (order.items || [])
    .map(i => `• ${i.name} × ${i.qty}${i.juice ? ' 🍊' : ''}`)
    .join('\n');

  const msg = [
    `🛒 ออเดอร์ใหม่! #${order.orderNumber}`,
    `📅 วันรับ: ${formatDate(order.pickupDate)}`,
    `📍 ${order.method === 'branch' ? 'สาขา' : 'จัดส่ง'}: ${order.branchOrAddress}`,
    `👤 ${order.customerName} / ${order.phone}`,
    order.org ? `🏢 ${order.org}` : null,
    '',
    'รายการ:',
    itemLines,
    '',
    `💰 ยอดรวม: ฿${order.total.toLocaleString()}`,
    order.taxInvoice ? '🧾 ต้องการใบกำกับภาษี' : null,
    order.slipDriveUrl ? `🖼 สลิป: ${order.slipDriveUrl}` : '🖼 ไม่มีสลิป',
  ].filter(l => l !== null).join('\n');

  try {
    await bot.sendMessage(chatId, msg);
    return true;
  } catch (err) {
    console.error('Telegram send failed:', err.message);
    return false;
  }
}

module.exports = { sendOrderNotification };
```

- [ ] **Step 3: Verify both files compile**

```powershell
node -e "require('./services/drive.js'); require('./services/telegram.js'); console.log('OK')"
```
Expected: `OK`

- [ ] **Step 4: Commit**

```powershell
git add services/drive.js services/telegram.js
git commit -m "feat: Google Drive upload and Telegram notification services"
```

---

## Task 4: Auth middleware and helpers

**Files:**
- Create: `C:\Projects\snackbox-admin\middleware\auth.js`

- [ ] **Step 1: Create middleware/auth.js**

Write `C:\Projects\snackbox-admin\middleware\auth.js`:

```js
'use strict';

function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  // Redirect to login, preserving the intended URL
  res.redirect('/admin/login?next=' + encodeURIComponent(req.originalUrl));
}

module.exports = { requireAuth };
```

- [ ] **Step 2: Commit**

```powershell
git add middleware/auth.js
git commit -m "feat: requireAuth middleware"
```

---

## Task 5: Order ID generator helper

**Files:**
- Create: `C:\Projects\snackbox-admin\utils\orderNumber.js`

- [ ] **Step 1: Create utils/orderNumber.js**

Write `C:\Projects\snackbox-admin\utils\orderNumber.js`:

```js
'use strict';

function generateOrderNumber() {
  const d = new Date();
  const ymd = d.getFullYear().toString()
    + String(d.getMonth() + 1).padStart(2, '0')
    + String(d.getDate()).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `NB-${ymd}-${seq}`;
}

module.exports = { generateOrderNumber };
```

- [ ] **Step 2: Commit**

```powershell
git add utils/orderNumber.js
git commit -m "feat: order number generator"
```

---

## Task 6: Routes — orders API

**Files:**
- Create: `C:\Projects\snackbox-admin\routes\orders.js`

- [ ] **Step 1: Create routes/orders.js**

Write `C:\Projects\snackbox-admin\routes\orders.js`:

```js
'use strict';
const express = require('express');
const multer = require('multer');
const { appendOrder } = require('../services/sheets');
const { uploadSlip } = require('../services/drive');
const { sendOrderNotification } = require('../services/telegram');
const { generateOrderNumber } = require('../utils/orderNumber');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.post('/', upload.single('slip'), async (req, res) => {
  let orderData;
  try {
    orderData = JSON.parse(req.body.order);
  } catch {
    return res.status(400).json({ error: 'Invalid order JSON' });
  }

  const orderNumber = generateOrderNumber();
  const timestamp = new Date().toISOString();

  let slipDriveUrl = '';
  if (req.file) {
    try {
      slipDriveUrl = await uploadSlip(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        orderNumber
      );
    } catch (err) {
      console.error('Slip upload failed:', err.message);
      // Continue without slip — don't block order
    }
  }

  const order = {
    orderNumber,
    timestamp,
    customerName: orderData.customerName || '',
    phone: orderData.phone || '',
    email: orderData.email || '',
    org: orderData.org || '',
    pickupDate: orderData.pickupDate || '',
    method: orderData.method || 'branch',
    branchOrAddress: orderData.branchOrAddress || '',
    items: orderData.items || [],
    total: Number(orderData.total) || 0,
    taxInvoice: !!orderData.taxInvoice,
    taxData: orderData.taxData || null,
    slipDriveUrl,
    telegramSent: false,
  };

  try {
    await appendOrder(order);
  } catch (err) {
    console.error('Sheets append failed:', err.message);
    // Still respond with order number — admin will see it in Telegram
  }

  let telegramSent = false;
  try {
    telegramSent = await sendOrderNotification(order);
  } catch (err) {
    console.error('Telegram failed:', err.message);
  }

  res.json({ orderNumber, status: 'ok', telegramSent });
});

module.exports = router;
```

- [ ] **Step 2: Commit**

```powershell
git add routes/orders.js utils/orderNumber.js
git commit -m "feat: POST /api/orders route with slip upload, Sheets, Telegram"
```

---

## Task 7: Routes — auth (login/logout)

**Files:**
- Create: `C:\Projects\snackbox-admin\routes\auth.js`

- [ ] **Step 1: Create routes/auth.js**

Write `C:\Projects\snackbox-admin\routes\auth.js`:

```js
'use strict';
const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    req.session.isAdmin = true;
    const next = req.query.next || '/admin/orders';
    return res.redirect(next);
  }
  res.redirect('/admin/login?error=1');
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

module.exports = router;
```

- [ ] **Step 2: Commit**

```powershell
git add routes/auth.js
git commit -m "feat: /auth/login and /auth/logout routes"
```

---

## Task 8: Admin HTML templates

**Files:**
- Create: `C:\Projects\snackbox-admin\admin\login.html`
- Create: `C:\Projects\snackbox-admin\admin\orders.html` (template used by server-side render)
- Create: `C:\Projects\snackbox-admin\admin\order.html`
- Create: `C:\Projects\snackbox-admin\admin\settings.html`

Note: The admin routes return HTML built with template literals (not a template engine). The HTML files here are the base templates — routes read them and inject data.

- [ ] **Step 1: Create login.html**

Write `C:\Projects\snackbox-admin\admin\login.html`:

```html
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Admin Login — นวล เบเกอรี่</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Sarabun', sans-serif; background: #1e2a3a; min-height: 100vh;
      display: flex; align-items: center; justify-content: center; }
    .box { background: #243447; border-radius: 16px; padding: 36px; width: 100%; max-width: 380px; }
    h1 { color: white; font-size: 20px; margin-bottom: 4px; }
    .sub { color: #90caf9; font-size: 13px; margin-bottom: 24px; }
    label { display: block; color: #aaa; font-size: 13px; margin-bottom: 4px; }
    input { width: 100%; padding: 12px; background: #1e2a3a; border: 1px solid #3d5068;
      border-radius: 8px; color: white; font-size: 15px; margin-bottom: 16px; }
    button { width: 100%; padding: 13px; background: #1565C0; color: white; border: none;
      border-radius: 8px; font-size: 16px; font-weight: 700; cursor: pointer; }
    .err { color: #ef9a9a; font-size: 13px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="box">
    <h1>🧁 Nual Bakery Admin</h1>
    <div class="sub">ระบบจัดการออเดอร์</div>
    {{ERROR_MSG}}
    <form method="POST" action="/auth/login{{NEXT_PARAM}}">
      <label>ชื่อผู้ใช้</label>
      <input type="text" name="username" autocomplete="username" required>
      <label>รหัสผ่าน</label>
      <input type="password" name="password" autocomplete="current-password" required>
      <button type="submit">เข้าสู่ระบบ</button>
    </form>
  </div>
</body>
</html>
```

- [ ] **Step 2: Create orders.html (list template skeleton)**

This file is not served directly — routes/admin.js reads orders data and builds HTML. The template defines the layout; data is injected via string replacement.

Write `C:\Projects\snackbox-admin\admin\orders.html`:

```html
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ออเดอร์ทั้งหมด — Admin</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: sans-serif; background: #1e2a3a; color: white; min-height: 100vh; }
    .nav { background: #243447; padding: 14px 20px; display: flex; align-items: center;
      justify-content: space-between; }
    .nav-brand { font-weight: 700; font-size: 16px; }
    .nav-links a { color: #90caf9; text-decoration: none; font-size: 13px; margin-left: 16px; }
    .container { max-width: 900px; margin: 0 auto; padding: 20px; }
    .order-row { background: #243447; border-radius: 8px; padding: 14px; margin-bottom: 10px;
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;
      border-left: 3px solid #4caf50; }
    .order-row.status-new { border-left-color: #4caf50; }
    .order-row.status-confirmed { border-left-color: #ff9800; }
    .order-row.status-done { border-left-color: #555; }
    .order-id { color: white; font-weight: 700; font-size: 14px; }
    .order-meta { color: #90caf9; font-size: 12px; margin-top: 2px; }
    .order-actions { display: flex; gap: 8px; }
    .btn-fb { background: #1565C0; color: white; border: none; border-radius: 6px;
      padding: 6px 12px; font-size: 12px; cursor: pointer; }
    .btn-detail { background: #2d3f55; color: #aaa; border: 1px solid #3d5068; border-radius: 6px;
      padding: 6px 12px; font-size: 12px; cursor: pointer; text-decoration: none; }
    .empty { color: #aaa; text-align: center; padding: 40px; }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="nav-brand">🧁 Nual Bakery — Admin</div>
    <div class="nav-links">
      <a href="/admin/orders">📥 ออเดอร์</a>
      <a href="/admin/settings">⚙️ ตั้งค่า</a>
      <a href="/auth/logout">🚪 ออก</a>
    </div>
  </nav>
  <div class="container">
    <h2 style="margin-bottom:16px;font-size:18px;">ออเดอร์ทั้งหมด</h2>
    {{ORDER_ROWS}}
  </div>
  <script>
  function copyFB(btn, orderId, customerName, pickupDate, branchOrAddress, itemsJson, total) {
    const items = JSON.parse(decodeURIComponent(itemsJson));
    const lines = items.map(i => `• ${i.name} × ${i.qty}`).join('\n');
    const d = new Date(pickupDate + 'T12:00:00');
    const days = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
    const dateStr = `${days[d.getDay()]}ที่ ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()+543}`;
    const msg = `✅ นวลเบเกอรี่ยืนยันออเดอร์ #${orderId}\n\n📅 วันรับ: ${dateStr}\n📍 รับที่: ${branchOrAddress}\n👤 คุณ${customerName}\n\n${lines}\n💰 ยอดรวม ฿${Number(total).toLocaleString()}\n\nขอบคุณที่สั่งซื้อนะคะ 🙏 ทางร้านจะเตรียมให้พร้อมในวันที่ระบุค่ะ\nหากมีข้อสงสัยทักมาได้เลยนะคะ`;
    navigator.clipboard.writeText(msg).then(() => {
      const orig = btn.textContent;
      btn.textContent = '✓ คัดลอกแล้ว!';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    });
  }
  </script>
</body>
</html>
```

- [ ] **Step 3: Create order.html (detail template)**

Write `C:\Projects\snackbox-admin\admin\order.html`:

```html
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ออเดอร์ {{ORDER_ID}} — Admin</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: sans-serif; background: #1e2a3a; color: white; min-height: 100vh; }
    .nav { background: #243447; padding: 14px 20px; display: flex; align-items: center;
      justify-content: space-between; }
    .nav-brand { font-weight: 700; font-size: 16px; }
    .nav-links a { color: #90caf9; text-decoration: none; font-size: 13px; margin-left: 16px; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
    .section { background: #243447; border-radius: 10px; padding: 16px; margin-bottom: 14px; }
    .section-title { color: #90caf9; font-size: 13px; font-weight: 700; margin-bottom: 10px; }
    .row { display: flex; justify-content: space-between; font-size: 14px;
      padding: 6px 0; border-bottom: 1px solid #2d3f55; }
    .row:last-child { border-bottom: none; }
    .label { color: #aaa; }
    .val { color: white; font-weight: 600; text-align: right; max-width: 60%; }
    .item-row { font-size: 13px; padding: 6px 0; border-bottom: 1px solid #2d3f55; }
    .btn-fb { background: #1565C0; color: white; border: none; border-radius: 8px;
      padding: 12px 20px; font-size: 14px; cursor: pointer; width: 100%; margin-bottom: 10px; }
    .slip-link { color: #90caf9; font-size: 14px; }
    a.back { color: #aaa; font-size: 13px; text-decoration: none; display: inline-block;
      margin-bottom: 14px; }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="nav-brand">🧁 Nual Bakery — Admin</div>
    <div class="nav-links">
      <a href="/admin/orders">📥 ออเดอร์</a>
      <a href="/auth/logout">🚪 ออก</a>
    </div>
  </nav>
  <div class="container">
    <a href="/admin/orders" class="back">← กลับรายการ</a>
    {{ORDER_DETAIL_HTML}}
  </div>
  <script>
  function copyFB() {
    const msg = document.getElementById('fbMsg').textContent;
    navigator.clipboard.writeText(msg).then(() => {
      const btn = document.getElementById('copyBtn');
      const orig = btn.textContent;
      btn.textContent = '✓ คัดลอกแล้ว!';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    });
  }
  </script>
</body>
</html>
```

- [ ] **Step 4: Create settings.html**

Write `C:\Projects\snackbox-admin\admin\settings.html`:

```html
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ตั้งค่า — Admin</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: sans-serif; background: #1e2a3a; color: white; min-height: 100vh; }
    .nav { background: #243447; padding: 14px 20px; display: flex; align-items: center;
      justify-content: space-between; }
    .nav-brand { font-weight: 700; font-size: 16px; }
    .nav-links a { color: #90caf9; text-decoration: none; font-size: 13px; margin-left: 16px; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .section { background: #243447; border-radius: 10px; padding: 20px; margin-bottom: 16px; }
    .section-title { font-size: 15px; font-weight: 700; margin-bottom: 12px; }
    .preview { width: 100px; height: 100px; object-fit: cover; border-radius: 8px;
      margin-bottom: 12px; background: #1e2a3a; display: block; }
    .cover-preview { width: 100%; height: 100px; object-fit: cover; border-radius: 8px;
      margin-bottom: 12px; background: #1e2a3a; }
    input[type=file] { display: none; }
    .upload-btn { background: #1565C0; color: white; border: none; border-radius: 8px;
      padding: 10px 16px; font-size: 14px; cursor: pointer; display: inline-block; }
    .msg { color: #a5d6a7; font-size: 13px; margin-top: 8px; display: none; }
    .hint { color: #aaa; font-size: 12px; margin-bottom: 8px; }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="nav-brand">🧁 Nual Bakery — Admin</div>
    <div class="nav-links">
      <a href="/admin/orders">📥 ออเดอร์</a>
      <a href="/auth/logout">🚪 ออก</a>
    </div>
  </nav>
  <div class="container">
    <h2 style="margin-bottom:16px;">⚙️ ตั้งค่ารูปภาพ Hero</h2>

    <div class="section">
      <div class="section-title">Logo (รูปโปรไฟล์)</div>
      <img class="preview" id="logoPreview" src="/api/assets/logo" onerror="this.src=''" alt="Logo">
      <div class="hint">แนะนำขนาด 200×200px, PNG</div>
      <label class="upload-btn" for="logoFile">📷 เลือกรูป Logo</label>
      <input type="file" id="logoFile" accept="image/jpeg,image/png" onchange="uploadAsset('logo', this)">
      <div class="msg" id="logoMsg">✅ อัปโหลดเรียบร้อย!</div>
    </div>

    <div class="section">
      <div class="section-title">Cover / Banner</div>
      <img class="cover-preview" id="coverPreview" src="/api/assets/cover" onerror="this.src=''" alt="Cover">
      <div class="hint">แนะนำขนาด 1200×400px, JPG</div>
      <label class="upload-btn" for="coverFile">🖼 เลือกรูป Cover</label>
      <input type="file" id="coverFile" accept="image/jpeg,image/png" onchange="uploadAsset('cover', this)">
      <div class="msg" id="coverMsg">✅ อัปโหลดเรียบร้อย!</div>
    </div>
  </div>
  <script>
  async function uploadAsset(type, input) {
    const file = input.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`/api/assets/${type}`, { method: 'POST', body: fd });
    if (res.ok) {
      document.getElementById(type + 'Preview').src = `/api/assets/${type}?t=${Date.now()}`;
      const msg = document.getElementById(type + 'Msg');
      msg.style.display = 'block';
      setTimeout(() => { msg.style.display = 'none'; }, 3000);
    }
  }
  </script>
</body>
</html>
```

- [ ] **Step 5: Commit all templates**

```powershell
git add admin/
git commit -m "feat: admin HTML templates (login, orders list, order detail, settings)"
```

---

## Task 9: Routes — admin panel

**Files:**
- Create: `C:\Projects\snackbox-admin\routes\admin.js`

- [ ] **Step 1: Create routes/admin.js**

Write `C:\Projects\snackbox-admin\routes\admin.js`:

```js
'use strict';
const express = require('express');
const fs = require('fs');
const path = require('path');
const { requireAuth } = require('../middleware/auth');
const { getOrders, getOrder } = require('../services/sheets');

const router = express.Router();
const ADMIN_DIR = path.join(__dirname, '..', 'admin');

function readTemplate(name) {
  return fs.readFileSync(path.join(ADMIN_DIR, name), 'utf8');
}

// Login page
router.get('/login', (req, res) => {
  const error = req.query.error ? '<p class="err">ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง</p>' : '';
  const next = req.query.next ? `?next=${encodeURIComponent(req.query.next)}` : '';
  let html = readTemplate('login.html')
    .replace('{{ERROR_MSG}}', error)
    .replace('{{NEXT_PARAM}}', next);
  res.send(html);
});

// Redirect /admin → /admin/orders
router.get('/', requireAuth, (req, res) => res.redirect('/admin/orders'));

// Orders list
router.get('/orders', requireAuth, async (req, res) => {
  let orders = [];
  let errorHtml = '';
  try {
    orders = await getOrders();
  } catch (err) {
    console.error('getOrders failed:', err.message);
    errorHtml = '<p style="color:#ef9a9a;text-align:center;padding:20px;">ไม่สามารถโหลดออเดอร์ได้: ' + escHtml(err.message) + '</p>';
  }

  const rowsHtml = orders.length === 0 && !errorHtml
    ? '<div class="empty">ยังไม่มีออเดอร์</div>'
    : orders.map(o => {
        const itemsEnc = encodeURIComponent(JSON.stringify(o.items));
        return `
          <div class="order-row status-${o.status}">
            <div>
              <div class="order-id">${escHtml(o.orderNumber)} · คุณ${escHtml(o.customerName)} · ${escHtml(o.branchOrAddress)}</div>
              <div class="order-meta">${escHtml(o.pickupDate)} · ${o.items.map(i => escHtml(i.name) + '×' + i.qty).join(', ')} · ฿${o.total.toLocaleString()}</div>
            </div>
            <div class="order-actions">
              <button class="btn-fb" onclick="copyFB(this,'${escHtml(o.orderNumber)}','${escHtml(o.customerName)}','${escHtml(o.pickupDate)}','${escHtml(o.branchOrAddress)}','${itemsEnc}','${o.total}')">📋 Copy FB</button>
              <a class="btn-detail" href="/admin/orders/${encodeURIComponent(o.orderNumber)}">📄 รายละเอียด</a>
            </div>
          </div>`;
      }).join('');

  const html = readTemplate('orders.html').replace('{{ORDER_ROWS}}', errorHtml + rowsHtml);
  res.send(html);
});

// Order detail
router.get('/orders/:id', requireAuth, async (req, res) => {
  let order;
  try {
    order = await getOrder(decodeURIComponent(req.params.id));
  } catch (err) {
    return res.status(500).send('Error loading order: ' + escHtml(err.message));
  }
  if (!order) return res.status(404).send('<p style="color:white;padding:40px">ไม่พบออเดอร์นี้</p>');

  const itemsHtml = order.items.map(i =>
    `<div class="item-row">• ${escHtml(i.name)} × ${i.qty} ${i.juice ? '🍊' : ''} = ฿${(i.price * i.qty).toLocaleString()}</div>`
  ).join('');

  const fbMsg = buildFBMessage(order);

  const detailHtml = `
    <div class="section">
      <div class="section-title">📋 ข้อมูลออเดอร์</div>
      <div class="row"><span class="label">ออเดอร์</span><span class="val">${escHtml(order.orderNumber)}</span></div>
      <div class="row"><span class="label">วันที่สั่ง</span><span class="val">${escHtml(order.timestamp.slice(0,10))}</span></div>
      <div class="row"><span class="label">วันที่รับ</span><span class="val">${escHtml(order.pickupDate)}</span></div>
      <div class="row"><span class="label">วิธีรับ</span><span class="val">${order.method === 'branch' ? 'รับที่สาขา' : 'จัดส่ง'}</span></div>
      <div class="row"><span class="label">สาขา/ที่อยู่</span><span class="val">${escHtml(order.branchOrAddress)}</span></div>
      <div class="row"><span class="label">ลูกค้า</span><span class="val">${escHtml(order.customerName)}</span></div>
      <div class="row"><span class="label">โทร</span><span class="val">${escHtml(order.phone)}</span></div>
      ${order.org ? `<div class="row"><span class="label">หน่วยงาน</span><span class="val">${escHtml(order.org)}</span></div>` : ''}
    </div>
    <div class="section">
      <div class="section-title">🛒 รายการ</div>
      ${itemsHtml}
      <div class="row" style="margin-top:8px;"><span class="label">ยอดรวม</span><span class="val" style="color:#90caf9">฿${order.total.toLocaleString()}</span></div>
    </div>
    ${order.slipDriveUrl ? `
    <div class="section">
      <div class="section-title">🖼 สลิปการโอน</div>
      <a class="slip-link" href="${escHtml(order.slipDriveUrl)}" target="_blank" rel="noopener">เปิดดูสลิปใน Google Drive →</a>
    </div>` : ''}
    <div class="section">
      <div class="section-title">📘 Copy ข้อความ Facebook</div>
      <pre id="fbMsg" style="white-space:pre-wrap;color:#ddd;font-size:13px;line-height:1.7;margin-bottom:12px;">${escHtml(fbMsg)}</pre>
      <button class="btn-fb" id="copyBtn" onclick="copyFB()">📋 Copy ข้อความ FB</button>
    </div>`;

  const html = readTemplate('order.html')
    .replace('{{ORDER_ID}}', escHtml(order.orderNumber))
    .replace('{{ORDER_DETAIL_HTML}}', detailHtml);
  res.send(html);
});

// Settings page
router.get('/settings', requireAuth, (req, res) => {
  res.send(readTemplate('settings.html'));
});

function buildFBMessage(order) {
  const d = new Date(order.pickupDate + 'T12:00:00');
  const days = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
  const dateStr = `${days[d.getDay()]}ที่ ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()+543}`;
  const lines = order.items.map(i => `• ${i.name} × ${i.qty}`).join('\n');
  return `✅ นวลเบเกอรี่ยืนยันออเดอร์ #${order.orderNumber}\n\n📅 วันรับ: ${dateStr}\n📍 รับที่: ${order.branchOrAddress}\n👤 คุณ${order.customerName} / ${order.phone}\n\n${lines}\n💰 ยอดรวม ฿${order.total.toLocaleString()}\n\nขอบคุณที่สั่งซื้อนะคะ 🙏 ทางร้านจะเตรียมให้พร้อมในวันที่ระบุค่ะ\nหากมีข้อสงสัยทักมาได้เลยนะคะ`;
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = router;
```

- [ ] **Step 2: Commit**

```powershell
git add routes/admin.js
git commit -m "feat: admin routes — login page, orders list, order detail, settings"
```

---

## Task 10: Routes — asset serving and upload

**Files:**
- Create: `C:\Projects\snackbox-admin\routes\assets.js`

- [ ] **Step 1: Create routes/assets.js**

Write `C:\Projects\snackbox-admin\routes\assets.js`:

```js
'use strict';
const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { uploadAsset, getAssetBuffer } = require('../services/drive');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// GET /api/assets/logo
// GET /api/assets/cover
router.get('/:assetName', async (req, res) => {
  const name = req.params.assetName;
  if (!['logo', 'cover'].includes(name)) return res.status(404).end();

  try {
    const buf = await getAssetBuffer(name);
    if (!buf) return res.status(404).end();
    const mimeType = name === 'logo' ? 'image/png' : 'image/jpeg';
    res.set('Content-Type', mimeType);
    res.set('Cache-Control', 'public, max-age=300');
    res.send(buf);
  } catch (err) {
    console.error('getAssetBuffer failed:', err.message);
    res.status(500).end();
  }
});

// POST /api/assets/logo  (admin only)
// POST /api/assets/cover (admin only)
router.post('/:assetName', requireAuth, upload.single('file'), async (req, res) => {
  const name = req.params.assetName;
  if (!['logo', 'cover'].includes(name)) return res.status(404).end();
  if (!req.file) return res.status(400).json({ error: 'No file' });

  try {
    await uploadAsset(req.file.buffer, name, req.file.mimetype);
    res.json({ ok: true });
  } catch (err) {
    console.error('uploadAsset failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

- [ ] **Step 2: Commit**

```powershell
git add routes/assets.js
git commit -m "feat: /api/assets routes for logo and cover (read + admin upload)"
```

---

## Task 11: Main server.js

**Files:**
- Create: `C:\Projects\snackbox-admin\server.js`

- [ ] **Step 1: Create server.js**

Write `C:\Projects\snackbox-admin\server.js`:

```js
'use strict';
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

const ordersRouter = require('./routes/orders');
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');
const assetsRouter = require('./routes/assets');

const app = express();
const PORT = process.env.PORT || 3001;

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS — allow frontend GitHub Pages origin in production
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = ['http://localhost:3000', 'http://127.0.0.1:3000',
    'http://localhost:5500', 'null', 'file://'];
  // In dev, allow all; in prod restrict to your GitHub Pages domain
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Session
app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: './' }),
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
    httpOnly: true,
    sameSite: 'lax',
  },
}));

// Routes
app.use('/api/orders', ordersRouter);
app.use('/api/assets', assetsRouter);
app.use('/auth', authRouter);
app.use('/admin', adminRouter);

// Root → admin
app.get('/', (req, res) => res.redirect('/admin'));

app.listen(PORT, () => {
  console.log(`snackbox-admin running on http://localhost:${PORT}`);
});
```

- [ ] **Step 2: Start the server and verify it runs**

```powershell
cd C:\Projects\snackbox-admin
node server.js
```

Expected console output:
```
snackbox-admin running on http://localhost:3001
```

Open browser: `http://localhost:3001` → should redirect to `http://localhost:3001/admin/login`.

Login page should load with username/password fields.

- [ ] **Step 3: Test login**

Enter credentials from `.env` (default: `admin` / `change_me`). Should redirect to `/admin/orders`. Page should show "ยังไม่มีออเดอร์" (since no Google Sheets is connected yet).

- [ ] **Step 4: Commit**

```powershell
git add server.js
git commit -m "feat: Express server with session, CORS, all routes wired"
```

---

## Task 12: Connect frontend to backend and test full flow

- [ ] **Step 1: Start both servers**

Terminal 1 (backend):
```powershell
cd C:\Projects\snackbox-admin
node server.js
```

Terminal 2 (frontend — use VS Code Live Server or Python):
```powershell
cd C:\Projects\snackbox-order
python -m http.server 5500
```
Then open `http://localhost:5500` in browser.

- [ ] **Step 2: Test order submission (without Google/Telegram creds)**

1. Open `http://localhost:5500`
2. Select a menu item, add to cart
3. Complete steps 2/3 (pickup date, customer info)
4. On step 4, upload any image as slip, click "ยืนยัน"
5. Console (backend terminal) should show something like:

```
Sheets append failed: No access...   (expected — no Google creds yet)
Telegram failed: ...                 (expected — no Telegram token yet)
```

6. Response should still return `{ orderNumber: "NB-...", status: "ok" }` and frontend advances to step 5.

- [ ] **Step 3: Test admin panel login flow**

Open `http://localhost:3001`. Login. Settings page: `http://localhost:3001/admin/settings` should load with logo/cover upload buttons.

- [ ] **Step 4: Commit integration test notes**

```powershell
git add .
git commit -m "test: full local flow verified — orders API, admin login, settings"
```

---

## Self-Review: Spec Coverage

| Spec Section | Covered by Task |
|---|---|
| POST /api/orders (multipart) | Task 6 |
| Slip upload → Google Drive | Task 3 + Task 6 |
| Append row → Google Sheet | Task 2 + Task 6 |
| Telegram notification | Task 3 + Task 6 |
| Session auth (8h) | Task 4 + Task 11 |
| Admin orders list + Copy FB button | Task 9 |
| Admin order detail + slip link | Task 9 |
| Admin settings — upload logo/cover | Task 8 + Task 10 |
| Serve logo/cover via API | Task 10 |
| Local dev on localhost:3001 | Task 11 |
| .env config (no secrets in git) | Task 1 |
| CORS for GitHub Pages frontend | Task 11 |
| Order number NB-YYYYMMDD-XXXX | Task 5 |
| Error resilience (continue if Google/Telegram fails) | Task 6 |
