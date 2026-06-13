'use strict';

// =====================
// MENU DATA
// =====================
const MENU = {
  30: [
    { id: 'a1', name: 'โรลครีม (คละรส) + บัตเตอร์เค้ก + น้ำส้ม', icon: '🥐', price: 30 },
    { id: 'a2', name: 'โรลครีม (คละรส) + ปังไส้เค้ก (คละรส)', icon: '🥐', price: 30 },
    { id: 'a3', name: 'โรลครีม (คละรส) + บราวนี่เม็ดมะม่วงมินิ', icon: '🥐', price: 30 },
    { id: 'a4', name: 'เอแคร์ + บัตเตอร์เค้ก', icon: '🍮', price: 30 },
    { id: 'a5', name: 'เอแคร์ + ปังไส้เค้ก (คละรส)', icon: '🍮', price: 30 },
    { id: 'a6', name: 'เอแคร์ + บราวนี่เม็ดมะม่วงมินิ', icon: '🍮', price: 30 },
    { id: 'a7', name: 'เค้กกล้วยหอม', icon: '🍌', price: 30 },
    { id: 'a8', name: 'เค้กถ้วย (คละรส)', icon: '🍰', price: 30 },
    { id: 'a9', name: 'ปังกลม 1 ชิ้น (คละรส)', icon: '🍞', price: 30 },
  ],
  35: [
    { id: 'b1', name: 'บราวนี่เม็ดมะม่วงมินิ + ปังไส้เค้ก', icon: '🍫', price: 35 },
    { id: 'b2', name: 'บัตเตอร์เค้ก + ปังไส้เค้ก', icon: '🧁', price: 35 },
    { id: 'b3', name: 'โรลครีม 2 ชิ้น (คละรส) + บัตเตอร์เค้ก', icon: '🥐', price: 35 },
    { id: 'b4', name: 'โรลครีม 2 ชิ้น (คละรส) + ปังไส้เค้ก (คละรส)', icon: '🥐', price: 35 },
    { id: 'b5', name: 'โรลครีม 2 ชิ้น (คละรส) + บราวนี่เม็ดมะม่วงมินิ', icon: '🥐', price: 35 },
    { id: 'b6', name: 'โรลครีม 1 ชิ้น (คละรส) + กล้วยหอม', icon: '🥐', price: 35 },
    { id: 'b7', name: 'โรลครีม 1 ชิ้น (คละรส) + เค้กถ้วย (คละรส)', icon: '🥐', price: 35 },
    { id: 'b8', name: 'โรลครีม 1 ชิ้น (คละรส) + ปังฝอยทอง', icon: '🥐', price: 35 },
    { id: 'b9', name: 'โรลครีม 1 ชิ้น (คละรส) + ปังไส้เผือก', icon: '🥐', price: 35 },
    { id: 'b10', name: 'โรลครีม 1 ชิ้น (คละรส) + ปังลูกเกด', icon: '🥐', price: 35 },
    { id: 'b11', name: 'โรลครีม 1 ชิ้น (คละรส) + ปังไส้กรอก', icon: '🥐', price: 35 },
  ],
  40: [
    { id: 'c1', name: 'ปังไส้กรอกแฮมชีส', icon: '🌭', price: 40 },
    { id: 'c2', name: 'ปังไส้กรอกชีส', icon: '🌭', price: 40 },
    { id: 'c3', name: 'ปังหมูหยองพริกเผา', icon: '🍞', price: 40 },
    { id: 'c4', name: 'ทอฟฟี่เค้กมินิ + บัตเตอร์เค้ก', icon: '🍰', price: 40 },
    { id: 'c5', name: 'ทอฟฟี่มินิ + ปังไส้เค้ก (คละรส)', icon: '🍰', price: 40 },
    { id: 'c6', name: 'บัตเตอร์เค้ก + ปังไส้เค้ก (คละรส)', icon: '🧁', price: 40 },
    { id: 'c7', name: 'ทอฟฟี่เค้ก', icon: '🍰', price: 40 },
    { id: 'c8', name: 'ปังไส้ถั่ว 5 รส', icon: '🍞', price: 40 },
    { id: 'c9', name: 'โรลครีม 1 ชิ้น (คละรส) + ปังฝอยทอง', icon: '🥐', price: 40 },
    { id: 'c10', name: 'โรลครีม 1 ชิ้น (คละรส) + ปังไส้เผือก', icon: '🥐', price: 40 },
    { id: 'c11', name: 'โรลครีม 1 ชิ้น (คละรส) + ปังลูกเกด', icon: '🥐', price: 40 },
    { id: 'c12', name: 'โรลครีม 1 ชิ้น (คละรส) + ปังไส้กรอก', icon: '🥐', price: 40 },
  ],
  50: [
    { id: 'd1', name: 'ปังไส้เค้ก (คละรส) + บัตเตอร์เค้ก + บราวนี่เม็ดมะม่วงมินิ', icon: '🍞', price: 50 },
    { id: 'd2', name: 'ปังไส้เค้ก (คละรส) + เค้กกล้วยหอม + โรลครีม (คละ)', icon: '🍞', price: 50 },
    { id: 'd3', name: 'ปังไส้เค้ก (คละรส) + เค้กถ้วย (คละ) + โรลครีม (คละ)', icon: '🍞', price: 50 },
    { id: 'd4', name: 'ปังไส้เค้ก (คละรส) + เอแคร์ 3 ชิ้น + โรลครีม (คละ)', icon: '🍞', price: 50 },
    { id: 'd5', name: 'คัพเค้กฝอยทอง 1 ชิ้น + โรลฝอยทอง (คละชิ้น)', icon: '🧁', price: 50 },
    { id: 'd6', name: 'คัพเค้กฝอยทอง 1 ชิ้น + บราวนี่เม็ดมะม่วงมินิ', icon: '🧁', price: 50 },
    { id: 'd7', name: 'แซนวิช 1 ชิ้น (คละ) + โรลครีม (คละ)', icon: '🥪', price: 50 },
    { id: 'd8', name: 'แซนวิช 1 ชิ้น (คละ) + เอแคร์ 1 ชิ้น', icon: '🥪', price: 50 },
    { id: 'd9', name: 'แซนวิช 1 ชิ้น + บราวนี่เม็ดมะม่วงมินิ', icon: '🥪', price: 50 },
    { id: 'd10', name: 'ทอฟฟี่เค้ก + บราวนี่เม็ดมะม่วงมินิ', icon: '🍰', price: 50 },
    { id: 'd11', name: 'ขนมปัง 2 ชิ้น (คละ)', icon: '🍞', price: 50 },
    { id: 'd12', name: 'ปังไส้กรอกแฮมชีส + บราวนี่เม็ดมะม่วงมินิ', icon: '🌭', price: 50 },
    { id: 'd13', name: 'ปังไส้กรอกแฮมชีส + โรลครีม (คละ)', icon: '🌭', price: 50 },
    { id: 'd14', name: 'ปังไส้กรอกแฮมชีส + เอแคร์ 1 ชิ้น', icon: '🌭', price: 50 },
    { id: 'd15', name: 'ขนมปังหมูหยองพริกเผา + โรลครีม (คละ)', icon: '🍞', price: 50 },
    { id: 'd16', name: 'ขนมปังหมูหยองพริกเผา + บราวนี่เม็ดมะม่วงมินิ', icon: '🍞', price: 50 },
    { id: 'd17', name: 'ขนมปังหมูหยองพริกเผา + เอแคร์ 1 ชิ้น', icon: '🍞', price: 50 },
  ]
};

const ALL_ITEMS = Object.values(MENU).flat();

// =====================
// STATE
// cart: { itemId: { qty: number, juice: boolean } }
// กล่องเบรครวมอยู่ทุกชุดแล้ว ไม่ต้องเลือก
// =====================
const state = {
  cart: {},
  currentTier: 30,
  currentStep: 1,
  slipFile: null,
};

// =====================
// INIT
// =====================
document.addEventListener('DOMContentLoaded', () => {
  renderMenu(30);
  setMinPickupDate();
  checkQuoteInHash();
});

// =====================
// HELPERS
// =====================
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getItemById(id) {
  return ALL_ITEMS.find(m => m.id === id);
}

const ROLL_FLAVORS = ['คละรส (ไม่ระบุ)', 'ใบเตย', 'ส้ม', 'กาแฟ', 'วนิลา'];

function hasRollCream(item) {
  return item.name.includes('โรลครีม');
}

function getCartTotal() {
  return Object.entries(state.cart).reduce((s, [id, v]) => {
    const item = getItemById(id);
    return s + (item ? item.price * v.qty : 0);
  }, 0);
}

function getCartItems() {
  return Object.entries(state.cart).map(([id, v]) => {
    const item = getItemById(id);
    return { ...item, qty: v.qty, juice: v.juice, rollFlavor: v.rollFlavor || null };
  });
}

// =====================
// STEP NAVIGATION
// =====================
function goToStep(n) {
  document.getElementById('step' + state.currentStep).classList.remove('active');
  document.getElementById('step' + n).classList.add('active');
  state.currentStep = n;
  updateProgress(n);
  document.getElementById('progressWrap').style.display = n === 1 ? 'none' : 'block';
  if (n === 4) renderOrderSummary();
  if (n === 5) renderConfirmSummary();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress(n) {
  for (let i = 1; i <= 5; i++) {
    const dot = document.querySelector('#ps' + i + ' .ps-dot');
    if (!dot) continue;
    dot.classList.remove('active', 'done');
    if (i < n) dot.classList.add('done');
    else if (i === n) dot.classList.add('active');
  }
}

// =====================
// MENU RENDERING
// =====================
function switchTier(tier) {
  state.currentTier = tier;
  document.querySelectorAll('.tier-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-tier="' + tier + '"]').classList.add('active');
  renderMenu(tier);
}

function renderMenu(tier) {
  const grid = document.getElementById('menuGrid');
  const items = MENU[tier];
  grid.innerHTML = items.map(item => {
    const cartItem = state.cart[item.id] || { qty: 0, juice: true };
    const hasItem = cartItem.qty > 0;
    const juiceOn = cartItem.juice;

    return `
      <div class="menu-card ${hasItem ? 'has-item' : ''}" id="card-${item.id}">
        <div class="card-body">
          <div class="card-icon">${item.icon}</div>
          <div class="card-info">
            <div class="card-name">${item.name}</div>
            <div class="card-price">฿${item.price} / ชุด</div>
          </div>
          <div class="card-qty">
            <button class="qty-btn" onclick="changeQty('${item.id}', -1)" ${cartItem.qty === 0 ? 'disabled' : ''}>−</button>
            <span class="qty-num">${cartItem.qty}</span>
            <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
          </div>
        </div>
        ${hasItem ? `
        <div class="card-options">
          <div class="option-label">🍊 น้ำส้ม</div>
          <div class="juice-toggle ${juiceOn ? 'juice-on' : 'juice-off'}" onclick="toggleJuice('${item.id}')">
            <span class="juice-emoji">🍊</span>
            <span class="juice-text">${juiceOn ? 'รับน้ำส้ม' : 'ไม่รับน้ำส้ม'}</span>
            <span class="juice-status">${juiceOn ? '✓' : '✗'}</span>
          </div>
          ${hasRollCream(item) ? `
          <div class="roll-flavor-row">
            <div class="option-label">🥐 รสโรลครีม (ไม่บังคับ)</div>
            <select class="roll-flavor-select" onchange="setRollFlavor('${item.id}', this.value)">
              ${ROLL_FLAVORS.map(f => `<option value="${f}" ${(cartItem.rollFlavor || 'คละรส (ไม่ระบุ)') === f ? 'selected' : ''}>${f}</option>`).join('')}
            </select>
          </div>` : ''}
        </div>` : ''}
      </div>`;
  }).join('');
}

function changeQty(id, delta) {
  if (!state.cart[id]) {
    const item = getItemById(id);
    state.cart[id] = { qty: 0, juice: true, rollFlavor: hasRollCream(item) ? 'คละรส (ไม่ระบุ)' : null };
  }
  state.cart[id].qty = Math.max(0, state.cart[id].qty + delta);
  if (state.cart[id].qty === 0) delete state.cart[id];
  renderMenu(state.currentTier);
  updateCartBar();
}

function setRollFlavor(id, flavor) {
  if (!state.cart[id]) return;
  state.cart[id].rollFlavor = flavor;
}

// FIX: ใช้ div onclick แทน label+checkbox ป้องกัน double-fire
function toggleJuice(id) {
  if (!state.cart[id]) return;
  state.cart[id].juice = !state.cart[id].juice;
  renderMenu(state.currentTier);
}

function updateCartBar() {
  const entries = Object.entries(state.cart);
  const totalQty = entries.reduce((s, [, v]) => s + v.qty, 0);
  const totalPrice = getCartTotal();

  const bar = document.getElementById('cartBar');
  if (totalQty === 0) { bar.style.display = 'none'; return; }
  bar.style.display = 'flex';
  document.getElementById('cartCount').textContent = `${totalQty} รายการ`;
  document.getElementById('cartTotal').textContent = `฿${totalPrice.toLocaleString()}`;
}

// =====================
// STEP 2 VALIDATION
// =====================
function setMinPickupDate() {
  const input = document.getElementById('pickupDate');
  const min = new Date();
  min.setDate(min.getDate() + 3);
  input.min = min.toISOString().split('T')[0];
}

function toggleDelivery() {
  const method = document.querySelector('input[name="deliveryMethod"]:checked').value;
  const total = getCartTotal();
  const deliveryRadio = document.getElementById('deliveryRadio');
  const deliveryCard = document.getElementById('radioDelivery');
  const desc = document.getElementById('deliveryDesc');

  if (total < 4000) {
    deliveryCard.classList.add('disabled-option');
    deliveryRadio.disabled = true;
    desc.textContent = `ต้องสั่งขั้นต่ำ ฿4,000 (ยอดปัจจุบัน ฿${total.toLocaleString()})`;
    if (method === 'delivery') {
      document.querySelector('input[value="branch"]').checked = true;
    }
  } else {
    deliveryCard.classList.remove('disabled-option');
    deliveryRadio.disabled = false;
    desc.textContent = 'ฟรี! เมื่อสั่งครบ ฿4,000 ขึ้นไป';
  }

  const isBranch = document.querySelector('input[name="deliveryMethod"]:checked').value === 'branch';
  document.getElementById('branchGroup').style.display = isBranch ? 'block' : 'none';
  document.getElementById('deliveryGroup').style.display = isBranch ? 'none' : 'block';
  validateStep2();
}

function validateStep2() {
  const dateVal = document.getElementById('pickupDate').value;
  const method = document.querySelector('input[name="deliveryMethod"]:checked').value;
  const branch = document.getElementById('branchSelect').value;
  const address = document.getElementById('deliveryAddress').value.trim();

  const dayEl = document.getElementById('dateDayName');
  if (dateVal) {
    const days = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
    const d = new Date(dateVal + 'T12:00:00');
    dayEl.style.display = 'block';
    dayEl.textContent = `วัน${days[d.getDay()]}ที่ ${d.getDate()} — กรุณาตรวจสอบว่าไม่ตรงกับวันหยุดนักขัตฤกษ์`;
  } else {
    dayEl.style.display = 'none';
  }

  let ok = !!dateVal;
  if (method === 'branch') ok = ok && !!branch;
  else ok = ok && address.length > 5;
  document.getElementById('step2Next').disabled = !ok;
}

// =====================
// STEP 3 VALIDATION
// =====================
function toggleTaxInvoice() {
  const show = document.getElementById('taxInvoiceCheck').checked;
  document.getElementById('taxInvoiceForm').style.display = show ? 'block' : 'none';
  validateStep3();
}

function validateStep3() {
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const phoneOk = /^[0-9]{9,10}$/.test(phone);
  const taxReq = document.getElementById('taxInvoiceCheck').checked;
  let taxOk = true;
  if (taxReq) {
    const co = document.getElementById('taxCompany').value.trim();
    const tid = document.getElementById('taxId').value.trim();
    const tadr = document.getElementById('taxAddress').value.trim();
    taxOk = co && /^[0-9]{13}$/.test(tid) && tadr;
  }
  document.getElementById('step3Next').disabled = !(name && phoneOk && taxOk);
}

// =====================
// STEP 4 SLIP UPLOAD
// =====================
function handleSlipUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowed.includes(file.type)) {
    alert('รองรับเฉพาะไฟล์ JPG, PNG หรือ PDF เท่านั้น');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    alert('ขนาดไฟล์เกิน 5MB กรุณาเลือกไฟล์ขนาดเล็กลง');
    return;
  }
  state.slipFile = file;
  document.getElementById('slipPreview').style.display = 'block';
  document.getElementById('slipFileName').textContent = file.name;
  document.getElementById('step4Submit').disabled = false;
}

function removeSlip() {
  state.slipFile = null;
  document.getElementById('slipFile').value = '';
  document.getElementById('slipPreview').style.display = 'none';
  document.getElementById('step4Submit').disabled = true;
}

// =====================
// ORDER SUMMARY
// =====================
function renderOrderSummary() {
  const items = getCartItems();
  const total = getCartTotal();
  document.getElementById('orderSummaryList').innerHTML = items.map(it => `
    <div class="summary-item">
      <div>
        <div class="summary-item-name">${escapeHtml(it.name)}</div>
        <div class="summary-item-tags">
          ${it.juice ? '🍊 น้ำส้ม' : '🚫 ไม่รับน้ำส้ม'} &nbsp;
          📦 กล่องเบรค &nbsp;× ${it.qty}
          ${it.rollFlavor && it.rollFlavor !== 'คละรส (ไม่ระบุ)' ? `&nbsp; 🥐 รส${escapeHtml(it.rollFlavor)}` : ''}
        </div>
      </div>
      <div class="summary-item-price">฿${(it.price * it.qty).toLocaleString()}</div>
    </div>`).join('');
  document.getElementById('summaryTotal').textContent = `฿${total.toLocaleString()}`;
  document.getElementById('qrAmount').textContent = `฿${total.toLocaleString()}`;
  toggleDelivery();
}

function renderConfirmSummary() {
  const items = getCartItems();
  const total = getCartTotal();
  const method = document.querySelector('input[name="deliveryMethod"]:checked').value;
  const branch = escapeHtml(document.getElementById('branchSelect').value);
  const address = escapeHtml(document.getElementById('deliveryAddress').value);
  const date = escapeHtml(document.getElementById('pickupDate').value);
  const custName = escapeHtml(document.getElementById('custName').value);
  const custPhone = escapeHtml(document.getElementById('custPhone').value);

  document.getElementById('confirmSummary').innerHTML = `
    <div class="summary-item"><span>วันที่รับ</span><span>${date}</span></div>
    <div class="summary-item"><span>${method === 'branch' ? 'สาขา' : 'จัดส่งไปที่'}</span><span>${method === 'branch' ? branch : address}</span></div>
    <div class="summary-item"><span>ผู้สั่ง</span><span>${custName} ${custPhone}</span></div>
    <div class="summary-divider"></div>
    ${items.map(it => `
    <div class="summary-item">
      <div class="summary-item-name">${escapeHtml(it.name)} × ${it.qty}</div>
      <div class="summary-item-price">฿${(it.price * it.qty).toLocaleString()}</div>
    </div>`).join('')}
    <div class="summary-divider"></div>
    <div class="summary-total-row"><span>ยอดรวม</span><span class="summary-total-amount">฿${total.toLocaleString()}</span></div>`;
}

// =====================
// SUBMIT ORDER
// =====================
function generateOrderNumber() {
  const d = new Date();
  const ymd = d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `NB-${ymd}-${seq}`;
}

function submitOrder() {
  if (document.getElementById('website').value) return;
  const btn = document.getElementById('step4Submit');
  btn.disabled = true;
  btn.textContent = 'กำลังส่งข้อมูล...';
  setTimeout(() => {
    const orderNum = generateOrderNumber();
    document.getElementById('orderNumber').textContent = orderNum;
    goToStep(5);
    startCountdown(btn);
  }, 1500);
}

function startCountdown(btn) {
  let sec = 30;
  const cd = document.getElementById('submitCountdown');
  cd.style.display = 'block';
  const iv = setInterval(() => {
    sec--;
    cd.textContent = `สามารถสั่งใหม่ได้ใน ${sec} วินาที`;
    if (sec <= 0) {
      clearInterval(iv);
      cd.style.display = 'none';
      btn.disabled = false;
      btn.textContent = 'ยืนยันการสั่งซื้อ';
    }
  }, 1000);
}

// =====================
// RESET
// =====================
function resetOrder() {
  state.cart = {};
  state.slipFile = null;
  document.getElementById('slipFile').value = '';
  document.getElementById('slipPreview').style.display = 'none';
  document.getElementById('step4Submit').disabled = true;
  document.getElementById('custName').value = '';
  document.getElementById('custPhone').value = '';
  document.getElementById('custEmail').value = '';
  document.getElementById('custOrg').value = '';
  document.getElementById('taxInvoiceCheck').checked = false;
  document.getElementById('taxInvoiceForm').style.display = 'none';
  document.getElementById('pickupDate').value = '';
  document.querySelector('input[value="branch"]').checked = true;
  document.getElementById('branchSelect').value = '';
  document.getElementById('branchGroup').style.display = 'block';
  document.getElementById('deliveryGroup').style.display = 'none';
  document.getElementById('step2Next').disabled = true;
  document.getElementById('step3Next').disabled = true;
  history.replaceState(null, '', window.location.pathname);
  goToStep(1);
  renderMenu(30);
  switchTier(30);
  updateCartBar();
}

// =====================
// SAVE AS QUOTE
// =====================
function buildQuoteData() {
  return {
    cart: state.cart,
    date: document.getElementById('pickupDate').value,
    method: document.querySelector('input[name="deliveryMethod"]:checked')?.value || 'branch',
    branch: document.getElementById('branchSelect').value,
    address: document.getElementById('deliveryAddress').value,
    name: document.getElementById('custName').value,
    phone: document.getElementById('custPhone').value,
    org: document.getElementById('custOrg').value,
  };
}

function encodeQuote(data) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  } catch {
    return null;
  }
}

function decodeQuote(encoded) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch {
    return null;
  }
}

function openQuoteModal() {
  const items = getCartItems();
  const total = getCartTotal();
  if (items.length === 0) return;

  // Build text summary
  const lines = items.map(it => {
    const flavorNote = it.rollFlavor && it.rollFlavor !== 'คละรส (ไม่ระบุ)' ? ` รสโรลครีม: ${it.rollFlavor}` : '';
    return `• ${it.name} × ${it.qty} = ฿${(it.price * it.qty).toLocaleString()} ${it.juice ? '(น้ำส้ม)' : '(ไม่รับน้ำส้ม)'}${flavorNote}`;
  });
  lines.push(`\nยอดรวม: ฿${total.toLocaleString()}`);

  const dateVal = document.getElementById('pickupDate').value;
  if (dateVal) lines.unshift(`📅 วันที่รับ: ${dateVal}`);
  const branch = document.getElementById('branchSelect').value;
  if (branch) lines.unshift(`📍 สาขา: ${branch}`);
  const org = document.getElementById('custOrg').value;
  if (org) lines.unshift(`🏢 ${org}`);

  document.getElementById('quoteSummaryText').textContent = lines.join('\n');
  document.getElementById('quoteModal').style.display = 'flex';
  document.getElementById('quoteCopyConfirm').style.display = 'none';
}

function closeQuoteModal() {
  document.getElementById('quoteModal').style.display = 'none';
}

function closeQuoteModalOutside(e) {
  if (e.target === document.getElementById('quoteModal')) closeQuoteModal();
}

function copyQuoteLink() {
  const data = buildQuoteData();
  const encoded = encodeQuote(data);
  if (!encoded) return;
  const url = window.location.href.split('#')[0] + '#q=' + encoded;
  navigator.clipboard.writeText(url).then(() => {
    showCopyConfirm('ลิงก์คัดลอกแล้ว! ส่งให้ผู้อนุมัติได้เลย 🎉');
  }).catch(() => {
    // Fallback for non-HTTPS
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showCopyConfirm('ลิงก์คัดลอกแล้ว! ส่งให้ผู้อนุมัติได้เลย 🎉');
  });
}

function copyQuoteText() {
  const text = document.getElementById('quoteSummaryText').textContent;
  const fullText = `🧁 Quote ชุดเบรค — นวล เบเกอรี่ 1988\n\n${text}\n\nสั่งได้ที่: ${window.location.href.split('#')[0]}`;
  navigator.clipboard.writeText(fullText).then(() => {
    showCopyConfirm('คัดลอกข้อความแล้ว! วางใน LINE ได้เลย 📋');
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = fullText;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showCopyConfirm('คัดลอกข้อความแล้ว! วางใน LINE ได้เลย 📋');
  });
}

function showCopyConfirm(msg) {
  const el = document.getElementById('quoteCopyConfirm');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}

// =====================
// LOAD QUOTE FROM URL
// =====================
function checkQuoteInHash() {
  const hash = window.location.hash;
  if (!hash.startsWith('#q=')) return;
  const encoded = hash.slice(3);
  const data = decodeQuote(encoded);
  if (!data || !data.cart || Object.keys(data.cart).length === 0) return;
  document.getElementById('quoteBanner').style.display = 'flex';
}

function loadQuoteFromHash() {
  const hash = window.location.hash;
  if (!hash.startsWith('#q=')) return;
  const data = decodeQuote(hash.slice(3));
  if (!data) return;

  // Restore cart
  state.cart = data.cart || {};
  renderMenu(state.currentTier);
  updateCartBar();

  // Restore step 2 fields
  if (data.date) document.getElementById('pickupDate').value = data.date;
  if (data.method === 'delivery') {
    const r = document.querySelector('input[value="delivery"]');
    if (r) r.checked = true;
  }
  if (data.branch) document.getElementById('branchSelect').value = data.branch;
  if (data.address) document.getElementById('deliveryAddress').value = data.address;

  // Restore step 3 fields
  if (data.name) document.getElementById('custName').value = data.name;
  if (data.phone) document.getElementById('custPhone').value = data.phone;
  if (data.org) document.getElementById('custOrg').value = data.org;

  dismissQuoteBanner();
  validateStep2();
  validateStep3();
  toggleDelivery();
  setMinPickupDate();
}

function dismissQuoteBanner() {
  document.getElementById('quoteBanner').style.display = 'none';
}
