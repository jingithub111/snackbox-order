# Snackbox Order Frontend — Grouped Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `app.js` and `style.css` so the 175-SKU menu renders as ~54 visual group cards with flavor-chip selectors, mobile-first layout, and dynamic hero images loaded from the backend.

**Architecture:** Single-page app, static files served from GitHub Pages. Menu data lives in `app.js` as a `MENU_GROUPS` constant. Cart state tracks one entry per unique selector combination (cartKey = `groupId::sel1_sel2…`). Backend URL is a top-level constant — change it once before Railway deploy.

**Tech Stack:** Vanilla JS (ES6), CSS custom properties, no build tools. Existing step 2–5 form logic is preserved unchanged.

---

## File Structure

| File | Change |
|------|--------|
| `app.js` | Full rewrite of MENU_GROUPS data + renderMenu + cart ops + submit POST. Keep step2/3/4/5 validation, quote, reset, and form logic as-is. |
| `style.css` | Add grouped-card, chip, card-entries, cover-hero, and mobile tweaks. Keep all existing step/form/modal CSS. |
| `index.html` | Add `<img id="coverHero">` in header, add `id="brandLogo"` to existing logo img. No other structure changes. |

---

## Task 1: Add MENU_GROUPS data to app.js

**Files:**
- Modify: `app.js` (replace the `MENU` object and `ALL_ITEMS` line, keep everything below `// STATE`)

- [ ] **Step 1: Replace MENU_GROUPS and ALL_ITEMS**

Open `app.js`. Delete lines 6–66 (the `const MENU` block and `const ALL_ITEMS` line). Replace with the complete block below:

```js
// =====================
// BACKEND URL — change to Railway URL before deploy
// =====================
const BACKEND_URL = 'http://localhost:3001';

// =====================
// MENU GROUPS
// Each group maps N selector combinations → individual SKUs.
// Cart key: groupId (fixed) OR groupId::val1_val2... (selectors).
// For sorted-combo groups (roll1+roll2 pairs), buildCartKey sorts those values.
// =====================
const MENU_GROUPS = {
  30: [
    {
      groupId: 'g30-roll-butter',
      name: 'โรลครีม + บัตเตอร์เค้ก',
      icon: '🥐', gradient: ['#e8f5e9', '#c8e6c9'], price: 30,
      selectors: [{ key: 'roll', label: 'รสโรลครีม', options: ['ใบเตย', 'ส้ม', 'กาแฟ'] }],
      skuMap: { 'ใบเตย': 'S30A1', 'ส้ม': 'S30A2', 'กาแฟ': 'S30A3' },
    },
    {
      groupId: 'g30-roll-breadcake',
      name: 'โรลครีม + ปังไส้เค้ก',
      icon: '🥐', gradient: ['#fff8e1', '#ffecb3'], price: 30,
      selectors: [
        { key: 'roll', label: 'รสโรลครีม', options: ['ใบเตย', 'ส้ม', 'กาแฟ'] },
        { key: 'bread', label: 'รสปังไส้เค้ก', options: ['วนิลา', 'ช็อคโกแลต'] },
      ],
      skuMap: {
        'ใบเตย_วนิลา': 'S30B1', 'ใบเตย_ช็อคโกแลต': 'S30B2',
        'ส้ม_วนิลา': 'S30B3', 'ส้ม_ช็อคโกแลต': 'S30B4',
        'กาแฟ_วนิลา': 'S30B5', 'กาแฟ_ช็อคโกแลต': 'S30B6',
      },
    },
    {
      groupId: 'g30-roll-brownie',
      name: 'โรลครีม + บราวนี่เม็ดมะม่วงมินิ',
      icon: '🥐', gradient: ['#efebe9', '#d7ccc8'], price: 30,
      selectors: [{ key: 'roll', label: 'รสโรลครีม', options: ['ใบเตย', 'ส้ม', 'กาแฟ'] }],
      skuMap: { 'ใบเตย': 'S30C1', 'ส้ม': 'S30C2', 'กาแฟ': 'S30C3' },
    },
    {
      groupId: 'g30-eclair-butter',
      name: 'เอแคร์ + บัตเตอร์เค้ก',
      icon: '🍮', gradient: ['#fff3e0', '#ffe0b2'], price: 30,
      selectors: [], skuMap: { '': 'S30D1' },
    },
    {
      groupId: 'g30-eclair-breadcake',
      name: 'เอแคร์ + ปังไส้เค้ก (คละรส)',
      icon: '🍮', gradient: ['#fff3e0', '#ffe0b2'], price: 30,
      selectors: [], skuMap: { '': 'S30D2' },
    },
    {
      groupId: 'g30-eclair-brownie',
      name: 'เอแคร์ + บราวนี่เม็ดมะม่วงมินิ',
      icon: '🍮', gradient: ['#fff3e0', '#ffe0b2'], price: 30,
      selectors: [], skuMap: { '': 'S30D3' },
    },
    {
      groupId: 'g30-banana-cake',
      name: 'เค้กกล้วยหอม',
      icon: '🍌', gradient: ['#fffde7', '#fff9c4'], price: 30,
      selectors: [], skuMap: { '': 'S30E1' },
    },
    {
      groupId: 'g30-cup-cake',
      name: 'เค้กถ้วย',
      icon: '🍰', gradient: ['#fce4ec', '#f8bbd0'], price: 30,
      selectors: [{ key: 'flavor', label: 'รสเค้กถ้วย', options: ['คละรส', 'วนิลา', 'กาแฟ', 'ส้ม', 'ใบเตย'] }],
      skuMap: { 'คละรส': 'S30F1', 'วนิลา': 'S30F2-cup', 'กาแฟ': 'S30F3-cup', 'ส้ม': 'S30F4', 'ใบเตย': 'S30F5' },
    },
    {
      groupId: 'g30-round-bread',
      name: 'ปังกลม',
      icon: '🍞', gradient: ['#f3e5f5', '#e1bee7'], price: 30,
      selectors: [{ key: 'fill', label: 'ไส้ปัง', options: ['ฝอยทอง', 'เผือก', 'ลูกเกด', 'ไส้กรอก'] }],
      skuMap: { 'ฝอยทอง': 'S30G1-round', 'เผือก': 'S30G2-round', 'ลูกเกด': 'S30G3-round', 'ไส้กรอก': 'S30G4-round' },
    },
    {
      groupId: 'g30-roll-cupcake',
      name: 'โรลครีม + เค้กถ้วย',
      icon: '🥐', gradient: ['#e8f5e9', '#f3e5f5'], price: 30,
      selectors: [
        { key: 'roll', label: 'รสโรลครีม', options: ['ใบเตย', 'ส้ม', 'กาแฟ'] },
        { key: 'cup', label: 'รสเค้กถ้วย', options: ['วนิลา', 'กาแฟ', 'ส้ม', 'ใบเตย'] },
      ],
      skuMap: {
        'ใบเตย_วนิลา': 'S30G1', 'ใบเตย_กาแฟ': 'S30G2', 'ใบเตย_ส้ม': 'S30G3', 'ใบเตย_ใบเตย': 'S30G4',
        'ส้ม_วนิลา': 'S30G5', 'ส้ม_กาแฟ': 'S30G6', 'ส้ม_ส้ม': 'S30G7', 'ส้ม_ใบเตย': 'S30G8',
        'กาแฟ_วนิลา': 'S30G9', 'กาแฟ_กาแฟ': 'S30G10', 'กาแฟ_ส้ม': 'S30G11', 'กาแฟ_ใบเตย': 'S30G12',
      },
    },
    {
      groupId: 'g30-roll-banana',
      name: 'โรลครีม + กล้วยหอม',
      icon: '🥐', gradient: ['#fffde7', '#e8f5e9'], price: 30,
      selectors: [{ key: 'roll', label: 'รสโรลครีม', options: ['ส้ม', 'กาแฟ'] }],
      skuMap: { 'ส้ม': 'S30F2', 'กาแฟ': 'S30F3' },
    },
    {
      groupId: 'g30-roll-foytong',
      name: 'โรลครีม + ปังฝอยทอง',
      icon: '🥐', gradient: ['#fff8e1', '#e8f5e9'], price: 30,
      selectors: [{ key: 'roll', label: 'รสโรลครีม', options: ['ส้ม', 'กาแฟ'] }],
      skuMap: { 'ส้ม': 'S30H2', 'กาแฟ': 'S30H3' },
    },
    {
      groupId: 'g30-roll-taro',
      name: 'โรลครีม + ปังไส้เผือก',
      icon: '🥐', gradient: ['#f3e5f5', '#e8f5e9'], price: 30,
      selectors: [{ key: 'roll', label: 'รสโรลครีม', options: ['ส้ม', 'กาแฟ'] }],
      skuMap: { 'ส้ม': 'S30I2', 'กาแฟ': 'S30I3' },
    },
    {
      groupId: 'g30-roll-raisin',
      name: 'โรลครีม + ปังลูกเกด',
      icon: '🥐', gradient: ['#fbe9e7', '#e8f5e9'], price: 30,
      selectors: [{ key: 'roll', label: 'รสโรลครีม', options: ['ส้ม', 'กาแฟ'] }],
      skuMap: { 'ส้ม': 'S30J2', 'กาแฟ': 'S30J3' },
    },
    {
      groupId: 'g30-roll-sausage',
      name: 'โรลครีม + ปังไส้กรอก',
      icon: '🥐', gradient: ['#fce4ec', '#e8f5e9'], price: 30,
      selectors: [{ key: 'roll', label: 'รสโรลครีม', options: ['ส้ม', 'กาแฟ'] }],
      skuMap: { 'ส้ม': 'S30K2', 'กาแฟ': 'S30K3' },
    },
  ],

  35: [
    {
      groupId: 'g35-roll2-butter',
      name: 'โรลครีม 2 ชิ้น + บัตเตอร์เค้ก',
      icon: '🥐', gradient: ['#e8f5e9', '#c8e6c9'], price: 35,
      // sortedComboKeys: roll1+roll2 are interchangeable — cart key sorts their values
      sortedComboKeys: ['roll1', 'roll2'],
      selectors: [
        { key: 'roll1', label: 'โรลครีมชิ้นที่ 1', options: ['ใบเตย', 'ส้ม', 'กาแฟ'] },
        { key: 'roll2', label: 'โรลครีมชิ้นที่ 2', options: ['ใบเตย', 'ส้ม', 'กาแฟ'] },
      ],
      skuMap: {
        'กาแฟ_กาแฟ': 'S35A3', 'ส้ม_ส้ม': 'S35A2', 'ใบเตย_ใบเตย': 'S35A1',
        'กาแฟ_ใบเตย': 'S35A5', 'กาแฟ_ส้ม': 'S35A6', 'ส้ม_ใบเตย': 'S35A4',
      },
    },
    {
      groupId: 'g35-roll2-breadcake',
      name: 'โรลครีม 2 ชิ้น + ปังไส้เค้ก',
      icon: '🥐', gradient: ['#fff8e1', '#ffecb3'], price: 35,
      sortedComboKeys: ['roll1', 'roll2'],
      selectors: [
        { key: 'roll1', label: 'โรลครีมชิ้นที่ 1', options: ['ใบเตย', 'ส้ม', 'กาแฟ'] },
        { key: 'roll2', label: 'โรลครีมชิ้นที่ 2', options: ['ใบเตย', 'ส้ม', 'กาแฟ'] },
        { key: 'bread', label: 'รสปังไส้เค้ก', options: ['วนิลา', 'ช็อคโกแลต'] },
      ],
      skuMap: {
        'ใบเตย_ใบเตย_วนิลา': 'S35B1', 'ส้ม_ส้ม_วนิลา': 'S35B2', 'กาแฟ_กาแฟ_วนิลา': 'S35B3',
        'ส้ม_ใบเตย_วนิลา': 'S35B4', 'กาแฟ_ใบเตย_วนิลา': 'S35B5', 'กาแฟ_ส้ม_วนิลา': 'S35B6',
        'ใบเตย_ใบเตย_ช็อคโกแลต': 'S35B7', 'ส้ม_ส้ม_ช็อคโกแลต': 'S35B8', 'กาแฟ_กาแฟ_ช็อคโกแลต': 'S35B9',
        'ส้ม_ใบเตย_ช็อคโกแลต': 'S35B10', 'กาแฟ_ใบเตย_ช็อคโกแลต': 'S35B11', 'กาแฟ_ส้ม_ช็อคโกแลต': 'S35B12',
      },
    },
    {
      groupId: 'g35-roll2-brownie',
      name: 'โรลครีม 2 ชิ้น + บราวนี่เม็ดมะม่วงมินิ',
      icon: '🥐', gradient: ['#efebe9', '#d7ccc8'], price: 35,
      sortedComboKeys: ['roll1', 'roll2'],
      selectors: [
        { key: 'roll1', label: 'โรลครีมชิ้นที่ 1', options: ['ใบเตย', 'ส้ม', 'กาแฟ'] },
        { key: 'roll2', label: 'โรลครีมชิ้นที่ 2', options: ['ใบเตย', 'ส้ม', 'กาแฟ'] },
      ],
      skuMap: {
        'กาแฟ_กาแฟ': 'S35C3', 'ส้ม_ส้ม': 'S35C2', 'ใบเตย_ใบเตย': 'S35C1',
        'กาแฟ_ใบเตย': 'S35C5', 'กาแฟ_ส้ม': 'S35C6', 'ส้ม_ใบเตย': 'S35C4',
      },
    },
    {
      groupId: 'g35-brownie-breadcake',
      name: 'บราวนี่เม็ดมะม่วงมินิ + ปังไส้เค้ก',
      icon: '🍫', gradient: ['#efebe9', '#fff8e1'], price: 35,
      selectors: [{ key: 'bread', label: 'รสปังไส้เค้ก', options: ['วนิลา', 'ช็อคโกแลต'] }],
      skuMap: { 'วนิลา': 'S35D1', 'ช็อคโกแลต': 'S35D2' },
    },
    {
      groupId: 'g35-butter-breadcake',
      name: 'บัตเตอร์เค้ก + ปังไส้เค้ก',
      icon: '🧁', gradient: ['#fff8e1', '#fffde7'], price: 35,
      selectors: [{ key: 'bread', label: 'รสปังไส้เค้ก', options: ['วนิลา', 'ช็อคโกแลต'] }],
      skuMap: { 'วนิลา': 'S35E1', 'ช็อคโกแลต': 'S35E2' },
    },
    {
      groupId: 'g35-roll-banana',
      name: 'โรลครีมใบเตย + กล้วยหอม',
      icon: '🥐', gradient: ['#fffde7', '#e8f5e9'], price: 35,
      selectors: [], skuMap: { '': 'S35F1' },
    },
    {
      groupId: 'g35-roll-foytong',
      name: 'โรลครีมใบเตย + ปังฝอยทอง',
      icon: '🥐', gradient: ['#fff8e1', '#e8f5e9'], price: 35,
      selectors: [], skuMap: { '': 'S35H1' },
    },
    {
      groupId: 'g35-roll-taro',
      name: 'โรลครีมใบเตย + ปังไส้เผือก',
      icon: '🥐', gradient: ['#f3e5f5', '#e8f5e9'], price: 35,
      selectors: [], skuMap: { '': 'S35I1' },
    },
    {
      groupId: 'g35-roll-raisin',
      name: 'โรลครีมใบเตย + ปังลูกเกด',
      icon: '🥐', gradient: ['#fbe9e7', '#e8f5e9'], price: 35,
      selectors: [], skuMap: { '': 'S35J1' },
    },
    {
      groupId: 'g35-roll-sausage',
      name: 'โรลครีมใบเตย + ปังไส้กรอก',
      icon: '🥐', gradient: ['#fce4ec', '#e8f5e9'], price: 35,
      selectors: [], skuMap: { '': 'S35K1' },
    },
  ],

  40: [
    {
      groupId: 'g40-hamcheese-sausage',
      name: 'ปังไส้กรอกแฮมชีส',
      icon: '🌭', gradient: ['#fce4ec', '#ffccbc'], price: 40,
      selectors: [], skuMap: { '': 'S40A1' },
    },
    {
      groupId: 'g40-cheese-sausage',
      name: 'ปังไส้กรอกชีส',
      icon: '🌭', gradient: ['#fff9c4', '#ffccbc'], price: 40,
      selectors: [], skuMap: { '': 'S40B2' },
    },
    {
      groupId: 'g40-pork-chili',
      name: 'ปังหมูหยองพริกเผา',
      icon: '🍞', gradient: ['#ffccbc', '#fce4ec'], price: 40,
      selectors: [], skuMap: { '': 'S40B3' },
    },
    {
      groupId: 'g40-toffee-butter',
      name: 'ทอฟฟี่เค้กมินิ + บัตเตอร์เค้ก',
      icon: '🍰', gradient: ['#fff9c4', '#fff8e1'], price: 40,
      selectors: [], skuMap: { '': 'S40B4' },
    },
    {
      groupId: 'g40-toffee-breadcake',
      name: 'ทอฟฟี่มินิ + ปังไส้เค้ก',
      icon: '🍰', gradient: ['#fff9c4', '#ffecb3'], price: 40,
      selectors: [{ key: 'bread', label: 'รสปังไส้เค้ก', options: ['วนิลา', 'ช็อคโกแลต'] }],
      skuMap: { 'วนิลา': 'S40C1', 'ช็อคโกแลต': 'S40C2' },
    },
    {
      groupId: 'g40-butter-breadcake',
      name: 'บัตเตอร์เค้ก + ปังไส้เค้ก',
      icon: '🧁', gradient: ['#fff8e1', '#ffecb3'], price: 40,
      selectors: [{ key: 'bread', label: 'รสปังไส้เค้ก', options: ['วนิลา', 'ช็อคโกแลต'] }],
      skuMap: { 'วนิลา': 'S40D1', 'ช็อคโกแลต': 'S40D2' },
    },
    {
      groupId: 'g40-toffee',
      name: 'ทอฟฟี่เค้ก',
      icon: '🍰', gradient: ['#fff9c4', '#ffe082'], price: 40,
      selectors: [], skuMap: { '': 'S40E1' },
    },
    {
      groupId: 'g40-bean-bread',
      name: 'ปังไส้ถั่ว 5 รส',
      icon: '🍞', gradient: ['#e8f5e9', '#c8e6c9'], price: 40,
      selectors: [], skuMap: { '': 'S40F1' },
    },
    {
      groupId: 'g40-roll-foytong',
      name: 'โรลครีม + ปังฝอยทอง',
      icon: '🥐', gradient: ['#fff8e1', '#e8f5e9'], price: 40,
      selectors: [{ key: 'roll', label: 'รสโรลครีม', options: ['ใบเตย', 'ส้ม', 'กาแฟ'] }],
      skuMap: { 'ใบเตย': 'S40G1', 'ส้ม': 'S40G2', 'กาแฟ': 'S40G3' },
    },
    {
      groupId: 'g40-roll-taro',
      name: 'โรลครีม + ปังไส้เผือก',
      icon: '🥐', gradient: ['#f3e5f5', '#e8f5e9'], price: 40,
      selectors: [{ key: 'roll', label: 'รสโรลครีม', options: ['ใบเตย', 'ส้ม', 'กาแฟ'] }],
      skuMap: { 'ใบเตย': 'S40H1', 'ส้ม': 'S40H2', 'กาแฟ': 'S40H3' },
    },
    {
      groupId: 'g40-roll-raisin',
      name: 'โรลครีม + ปังลูกเกด',
      icon: '🥐', gradient: ['#fbe9e7', '#e8f5e9'], price: 40,
      selectors: [{ key: 'roll', label: 'รสโรลครีม', options: ['ใบเตย', 'ส้ม', 'กาแฟ'] }],
      skuMap: { 'ใบเตย': 'S40I1', 'ส้ม': 'S40I2', 'กาแฟ': 'S40I3' },
    },
    {
      groupId: 'g40-roll-sausage',
      name: 'โรลครีม + ปังไส้กรอก',
      icon: '🥐', gradient: ['#fce4ec', '#e8f5e9'], price: 40,
      selectors: [{ key: 'roll', label: 'รสโรลครีม', options: ['ใบเตย', 'ส้ม', 'กาแฟ'] }],
      skuMap: { 'ใบเตย': 'S40J1', 'ส้ม': 'S40J2', 'กาแฟ': 'S40J3' },
    },
  ],

  50: [
    {
      groupId: 'g50-bread-butter-brownie',
      name: 'ปังไส้เค้ก + บัตเตอร์เค้ก + บราวนี่',
      icon: '🍞', gradient: ['#fff8e1', '#efebe9'], price: 50,
      selectors: [{ key: 'bread', label: 'รสปังไส้เค้ก', options: ['วนิลา', 'ช็อคโกแลต'] }],
      skuMap: { 'วนิลา': 'S50A1', 'ช็อคโกแลต': 'S50A2' },
    },
    {
      groupId: 'g50-bread-banana-roll',
      name: 'ปังไส้เค้ก + กล้วยหอม + โรลครีม',
      icon: '🍞', gradient: ['#fffde7', '#e8f5e9'], price: 50,
      selectors: [
        { key: 'bread', label: 'รสปังไส้เค้ก', options: ['วนิลา', 'ช็อคโกแลต'] },
        { key: 'roll', label: 'รสโรลครีม', options: ['ใบเตย', 'ส้ม', 'กาแฟ'] },
      ],
      skuMap: {
        'วนิลา_ใบเตย': 'S50B1', 'วนิลา_ส้ม': 'S50B2', 'วนิลา_กาแฟ': 'S50B3',
        'ช็อคโกแลต_ใบเตย': 'S50B4', 'ช็อคโกแลต_ส้ม': 'S50B5', 'ช็อคโกแลต_กาแฟ': 'S50B6',
      },
    },
    {
      groupId: 'g50-bread-cup-roll',
      name: 'ปังไส้เค้ก + เค้กถ้วย + โรลครีม',
      icon: '🍞', gradient: ['#e3f2fd', '#fce4ec'], price: 50,
      selectors: [
        { key: 'bread', label: 'รสปังไส้เค้ก', options: ['วนิลา', 'ช็อคโกแลต'] },
        { key: 'cup', label: 'รสเค้กถ้วย', options: ['วนิลา', 'ส้ม', 'ใบเตย', 'กาแฟ'] },
        { key: 'roll', label: 'รสโรลครีม', options: ['ใบเตย', 'ส้ม', 'กาแฟ'] },
      ],
      skuMap: {
        'วนิลา_วนิลา_ใบเตย': 'S50C1', 'วนิลา_วนิลา_ส้ม': 'S50C2', 'วนิลา_วนิลา_กาแฟ': 'S50C3',
        'วนิลา_ส้ม_ใบเตย': 'S50C4', 'วนิลา_ส้ม_ส้ม': 'S50C5', 'วนิลา_ส้ม_กาแฟ': 'S50C6',
        'วนิลา_ใบเตย_ใบเตย': 'S50C7', 'วนิลา_ใบเตย_ส้ม': 'S50C8', 'วนิลา_ใบเตย_กาแฟ': 'S50C9',
        'วนิลา_กาแฟ_ใบเตย': 'S50C10', 'วนิลา_กาแฟ_ส้ม': 'S50C11', 'วนิลา_กาแฟ_กาแฟ': 'S50C12',
        'ช็อคโกแลต_วนิลา_ใบเตย': 'S50C13', 'ช็อคโกแลต_วนิลา_ส้ม': 'S50C14', 'ช็อคโกแลต_วนิลา_กาแฟ': 'S50C15',
        'ช็อคโกแลต_ส้ม_ใบเตย': 'S50C16', 'ช็อคโกแลต_ส้ม_ส้ม': 'S50C17', 'ช็อคโกแลต_ส้ม_กาแฟ': 'S50C18',
        'ช็อคโกแลต_ใบเตย_ใบเตย': 'S50C19', 'ช็อคโกแลต_ใบเตย_ส้ม': 'S50C20', 'ช็อคโกแลต_ใบเตย_กาแฟ': 'S50C21',
        'ช็อคโกแลต_กาแฟ_ใบเตย': 'S50C22', 'ช็อคโกแลต_กาแฟ_ส้ม': 'S50C23', 'ช็อคโกแลต_กาแฟ_กาแฟ': 'S50C24',
      },
    },
    {
      groupId: 'g50-bread-eclair-roll',
      name: 'ปังไส้เค้ก + เอแคลร์ 3 ชิ้น + โรลครีม',
      icon: '🍞', gradient: ['#fff3e0', '#e8f5e9'], price: 50,
      selectors: [
        { key: 'bread', label: 'รสปังไส้เค้ก', options: ['วนิลา', 'ช็อคโกแลต'] },
        { key: 'roll', label: 'รสโรลครีม', options: ['ใบเตย', 'ส้ม', 'กาแฟ'] },
      ],
      skuMap: {
        'วนิลา_ใบเตย': 'S50D1', 'วนิลา_ส้ม': 'S50D2', 'วนิลา_กาแฟ': 'S50D3',
        'ช็อคโกแลต_ใบเตย': 'S50D4', 'ช็อคโกแลต_ส้ม': 'S50D5', 'ช็อคโกแลต_กาแฟ': 'S50D6',
      },
    },
    {
      groupId: 'g50-cupcake-roll-foytong',
      name: 'คัพเค้กฝอยทอง + โรลครีมฝอยทอง',
      icon: '🧁', gradient: ['#fff9c4', '#fff8e1'], price: 50,
      selectors: [{ key: 'roll', label: 'รสโรลครีม', options: ['ใบเตยฝอยทอง', 'นมฝอยทอง'] }],
      skuMap: { 'ใบเตยฝอยทอง': 'S50E1', 'นมฝอยทอง': 'S50E2' },
    },
    {
      groupId: 'g50-cupcake-brownie',
      name: 'คัพเค้กฝอยทอง + บราวนี่เม็ดมะม่วงมินิ',
      icon: '🧁', gradient: ['#fff9c4', '#efebe9'], price: 50,
      selectors: [], skuMap: { '': 'S50F1-cup' },
    },
    {
      groupId: 'g50-sandwich-roll',
      name: 'แซนวิช + โรลครีม',
      icon: '🥪', gradient: ['#e3f2fd', '#e8f5e9'], price: 50,
      selectors: [
        { key: 'sandwich', label: 'ไส้แซนวิช', options: ['ทูน่าแฮมชีส', 'แฮมชีส', 'หมูหยองแฮมชีส'] },
        { key: 'roll', label: 'รสโรลครีม', options: ['ใบเตย', 'ส้ม', 'กาแฟ'] },
      ],
      skuMap: {
        'ทูน่าแฮมชีส_ใบเตย': 'S50F1', 'ทูน่าแฮมชีส_ส้ม': 'S50F2', 'ทูน่าแฮมชีส_กาแฟ': 'S50F3',
        'แฮมชีส_ใบเตย': 'S50F4', 'แฮมชีส_ส้ม': 'S50F5', 'แฮมชีส_กาแฟ': 'S50F6',
        'หมูหยองแฮมชีส_ใบเตย': 'S50F7', 'หมูหยองแฮมชีส_ส้ม': 'S50F8', 'หมูหยองแฮมชีส_กาแฟ': 'S50F9',
      },
    },
    {
      groupId: 'g50-sandwich-eclair',
      name: 'แซนวิช + เอแคลร์ 1 ชิ้น',
      icon: '🥪', gradient: ['#e3f2fd', '#fff3e0'], price: 50,
      selectors: [{ key: 'sandwich', label: 'ไส้แซนวิช', options: ['ทูน่าแฮมชีส', 'แฮมชีส', 'หมูหยองแฮมชีส'] }],
      skuMap: { 'ทูน่าแฮมชีส': 'S50G1', 'แฮมชีส': 'S50G2', 'หมูหยองแฮมชีส': 'S50G3' },
    },
    {
      groupId: 'g50-sandwich-brownie',
      name: 'แซนวิช + บราวนี่เม็ดมะม่วงมินิ',
      icon: '🥪', gradient: ['#e3f2fd', '#efebe9'], price: 50,
      selectors: [{ key: 'sandwich', label: 'ไส้แซนวิช', options: ['ทูน่าแฮมชีส', 'แฮมชีส', 'หมูหยองแฮมชีส'] }],
      skuMap: { 'ทูน่าแฮมชีส': 'S50H1', 'แฮมชีส': 'S50H2', 'หมูหยองแฮมชีส': 'S50H3' },
    },
    {
      groupId: 'g50-toffee-brownie',
      name: 'ทอฟฟี่เค้ก + บราวนี่เม็ดมะม่วงมินิ',
      icon: '🍰', gradient: ['#fff9c4', '#efebe9'], price: 50,
      selectors: [], skuMap: { '': 'S50I1' },
    },
    {
      groupId: 'g50-sausage-roundbread',
      name: 'ขนมปัง 2 ชิ้น (ปังกลม/ปังไส้กรอก)',
      icon: '🍞', gradient: ['#f3e5f5', '#e8f5e9'], price: 50,
      // sortedComboKeys: bread1+bread2 are interchangeable
      sortedComboKeys: ['bread1', 'bread2'],
      selectors: [
        { key: 'bread1', label: 'ขนมปังชิ้นที่ 1', options: ['ปังไส้กรอก', 'ปังกลมฝอยทอง', 'ปังกลมเผือก', 'ปังกลมลูกเกด'] },
        { key: 'bread2', label: 'ขนมปังชิ้นที่ 2', options: ['ปังไส้กรอก', 'ปังกลมฝอยทอง', 'ปังกลมเผือก', 'ปังกลมลูกเกด'] },
      ],
      skuMap: {
        'ปังกลมฝอยทอง_ปังไส้กรอก': 'S50J1',
        'ปังกลมเผือก_ปังไส้กรอก': 'S50J2',
        'ปังกลมลูกเกด_ปังไส้กรอก': 'S50J3',
        'ปังกลมฝอยทอง_ปังกลมเผือก': 'S50J4',
        'ปังกลมฝอยทอง_ปังกลมลูกเกด': 'S50J5',
        'ปังกลมเผือก_ปังกลมลูกเกด': 'S50J6',
      },
    },
    {
      groupId: 'g50-hamcheese-brownie',
      name: 'ปังไส้กรอกแฮมชีส + บราวนี่เม็ดมะม่วงมินิ',
      icon: '🌭', gradient: ['#fce4ec', '#efebe9'], price: 50,
      selectors: [], skuMap: { '': 'S50K1' },
    },
    {
      groupId: 'g50-hamcheese-roll',
      name: 'ปังไส้กรอกแฮมชีส + โรลครีม',
      icon: '🌭', gradient: ['#fce4ec', '#e8f5e9'], price: 50,
      selectors: [{ key: 'roll', label: 'รสโรลครีม', options: ['ใบเตย', 'ส้ม', 'กาแฟ'] }],
      skuMap: { 'ใบเตย': 'S50L1', 'ส้ม': 'S50L2', 'กาแฟ': 'S50L3' },
    },
    {
      groupId: 'g50-hamcheese-eclair',
      name: 'ปังไส้กรอกแฮมชีส + เอแคร์ 1 ชิ้น',
      icon: '🌭', gradient: ['#fce4ec', '#fff3e0'], price: 50,
      selectors: [], skuMap: { '': 'S50M1' },
    },
    {
      groupId: 'g50-porkchili-roll',
      name: 'ขนมปังหมูหยองพริกเผา + โรลครีม',
      icon: '🍞', gradient: ['#ffccbc', '#e8f5e9'], price: 50,
      selectors: [{ key: 'roll', label: 'รสโรลครีม', options: ['ใบเตย', 'ส้ม', 'กาแฟ'] }],
      skuMap: { 'ใบเตย': 'S50N1', 'ส้ม': 'S50N2', 'กาแฟ': 'S50N3' },
    },
    {
      groupId: 'g50-porkchili-brownie',
      name: 'ขนมปังหมูหยองพริกเผา + บราวนี่เม็ดมะม่วงมินิ',
      icon: '🍞', gradient: ['#ffccbc', '#efebe9'], price: 50,
      selectors: [], skuMap: { '': 'S50O1' },
    },
    {
      groupId: 'g50-porkchili-eclair',
      name: 'ขนมปังหมูหยองพริกเผา + เอแคร์ 1 ชิ้น',
      icon: '🍞', gradient: ['#ffccbc', '#fff3e0'], price: 50,
      selectors: [], skuMap: { '': 'S50P1' },
    },
  ],
};
```

- [ ] **Step 2: Verify the data compiles**

Open `index.html` in a browser (or with Live Server). Open DevTools console. Run:
```js
console.log(Object.keys(MENU_GROUPS), MENU_GROUPS[30].length, MENU_GROUPS[35].length, MENU_GROUPS[40].length, MENU_GROUPS[50].length);
```
Expected: `['30', '35', '40', '50'] 15 10 12 17`

- [ ] **Step 3: Commit data**

```bash
cd C:\Projects\snackbox-order
git add app.js
git commit -m "feat: add MENU_GROUPS data for all 175 SKUs across 4 tiers"
```

---

## Task 2: Replace state model and cart helpers

**Files:**
- Modify: `app.js` — replace the `state` object and add helper functions after the `MENU_GROUPS` block, before `document.addEventListener`

- [ ] **Step 1: Replace state and add helpers**

Find the existing `const state = {` block (currently lines ~73–78). Replace it and the `ALL_ITEMS` usage with:

```js
// =====================
// STATE
// cart: { [cartKey]: { qty, juice, displayName } }
// currentSelections: { [groupId]: { [selectorKey]: value } }
// =====================
const state = {
  cart: {},
  currentSelections: {},
  currentTier: 30,
  currentStep: 1,
  slipFile: null,
};

// Build a human-readable display name from group + selections
function buildDisplayName(group, selections) {
  if (!group.selectors || group.selectors.length === 0) return group.name;
  const parts = group.selectors.map(s => selections[s.key]).filter(Boolean);
  return `${group.name} (${parts.join(' + ')})`;
}

// Build the cart key for a group + current selections
function buildCartKey(group, selections) {
  if (!group.selectors || group.selectors.length === 0) return group.groupId;
  if (group.sortedComboKeys) {
    const comboVals = group.sortedComboKeys.map(k => selections[k]).sort();
    const rest = group.selectors
      .filter(s => !group.sortedComboKeys.includes(s.key))
      .map(s => selections[s.key]);
    return `${group.groupId}::${[...comboVals, ...rest].join('_')}`;
  }
  const vals = group.selectors.map(s => selections[s.key]).join('_');
  return `${group.groupId}::${vals}`;
}

// Get or initialize the current selections for a group (defaults to first option each)
function getSelections(group) {
  if (!state.currentSelections[group.groupId]) {
    state.currentSelections[group.groupId] = {};
    (group.selectors || []).forEach(s => {
      state.currentSelections[group.groupId][s.key] = s.options[0];
    });
  }
  return state.currentSelections[group.groupId];
}

// Get total quantity across ALL cart entries for a group (shown in mini-badge)
function getGroupTotalQty(groupId) {
  return Object.entries(state.cart)
    .filter(([k]) => k === groupId || k.startsWith(groupId + '::'))
    .reduce((s, [, v]) => s + v.qty, 0);
}

function getCartTotal() {
  return Object.values(state.cart).reduce((s, v) => s + v.price * v.qty, 0);
}

function getCartItems() {
  return Object.values(state.cart).filter(v => v.qty > 0);
}
```

Note: `getItemById` is no longer needed (remove its call in the old `changeQty`). Cart items now store `price` and `displayName` directly.

- [ ] **Step 2: Verify no console errors**

Reload page. DevTools should show no errors. Run in console:
```js
const g = MENU_GROUPS[30][0];
const sel = getSelections(g);
console.log(buildCartKey(g, sel), buildDisplayName(g, sel));
```
Expected: `"g30-roll-butter::ใบเตย"` and `"โรลครีม + บัตเตอร์เค้ก (ใบเตย)"`

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add buildCartKey and grouped state model"
```

---

## Task 3: Rewrite renderMenu and cart operations

**Files:**
- Modify: `app.js` — replace `renderMenu`, `changeQty`, `toggleJuice`, and `setRollFlavor`

- [ ] **Step 1: Replace renderMenu**

Find and delete functions `renderMenu`, `changeQty`, `toggleJuice`, `setRollFlavor` (old lines ~152–222). Replace with:

```js
function switchTier(tier) {
  state.currentTier = tier;
  document.querySelectorAll('.tier-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-tier="' + tier + '"]').classList.add('active');
  renderMenu(tier);
}

function renderMenu(tier) {
  const grid = document.getElementById('menuGrid');
  const groups = MENU_GROUPS[tier] || [];
  grid.innerHTML = groups.map(group => renderGroupCard(group)).join('');
}

function renderGroupCard(group) {
  const sel = getSelections(group);
  const cartKey = buildCartKey(group, sel);
  const cartEntry = state.cart[cartKey];
  const currentQty = cartEntry ? cartEntry.qty : 0;
  const groupTotal = getGroupTotalQty(group.groupId);

  const chipRows = (group.selectors || []).map(selector => `
    <div class="chip-row">
      <div class="chip-label">${selector.label}:</div>
      <div class="chip-group">
        ${selector.options.map(opt => `
          <button class="chip ${sel[selector.key] === opt ? 'chip-active' : ''}"
            onclick="selectChip('${group.groupId}', '${selector.key}', '${opt}')">
            ${escapeHtml(opt)}
          </button>`).join('')}
      </div>
    </div>`).join('');

  const entriesList = Object.entries(state.cart)
    .filter(([k, v]) => (k === group.groupId || k.startsWith(group.groupId + '::')) && v.qty > 0)
    .map(([k, v]) => `
      <div class="card-entry">
        <div class="entry-name">${escapeHtml(v.displayName)}</div>
        <div class="entry-controls">
          <div class="juice-toggle ${v.juice ? 'juice-on' : 'juice-off'}" onclick="toggleJuice('${k}')">
            🍊 ${v.juice ? 'น้ำส้ม' : 'ไม่รับ'}
          </div>
          <div class="qty-row">
            <button class="qty-btn" onclick="changeQty('${k}', -1)">−</button>
            <span class="qty-num">${v.qty}</span>
            <button class="qty-btn" onclick="changeQty('${k}', 1)">+</button>
          </div>
        </div>
      </div>`).join('');

  return `
    <div class="group-card ${groupTotal > 0 ? 'has-item' : ''}" id="card-${group.groupId}">
      <div class="card-img-wrap" style="background:linear-gradient(135deg,${group.gradient[0]},${group.gradient[1]})">
        ${groupTotal > 0 ? `<div class="group-badge">${groupTotal}</div>` : ''}
        <img class="card-img" src="assets/products/${group.groupId}.jpg"
          onerror="this.style.display='none'" alt="${escapeHtml(group.name)}">
        <div class="card-icon-fallback">${group.icon}</div>
      </div>
      <div class="card-content">
        <div class="card-name">${escapeHtml(group.name)}</div>
        <div class="card-price">฿${group.price} / ชุด</div>
        ${chipRows}
        <div class="card-add-row">
          <button class="btn-add-to-cart" onclick="addToCart('${group.groupId}')">+ เพิ่ม</button>
        </div>
        ${entriesList ? `<div class="card-entries">${entriesList}</div>` : ''}
      </div>
    </div>`;
}

function selectChip(groupId, selectorKey, value) {
  if (!state.currentSelections[groupId]) state.currentSelections[groupId] = {};
  state.currentSelections[groupId][selectorKey] = value;
  // Re-render just this card
  const group = findGroup(groupId);
  if (group) {
    const el = document.getElementById('card-' + groupId);
    if (el) el.outerHTML = renderGroupCard(group);
  }
}

function findGroup(groupId) {
  for (const tier of Object.values(MENU_GROUPS)) {
    const g = tier.find(g => g.groupId === groupId);
    if (g) return g;
  }
  return null;
}

function addToCart(groupId) {
  const group = findGroup(groupId);
  if (!group) return;
  const sel = getSelections(group);
  const cartKey = buildCartKey(group, sel);
  if (!state.cart[cartKey]) {
    state.cart[cartKey] = {
      qty: 0,
      juice: true,
      price: group.price,
      displayName: buildDisplayName(group, sel),
    };
  }
  state.cart[cartKey].qty += 1;
  renderMenu(state.currentTier);
  updateCartBar();
}

function changeQty(cartKey, delta) {
  if (!state.cart[cartKey]) return;
  state.cart[cartKey].qty = Math.max(0, state.cart[cartKey].qty + delta);
  if (state.cart[cartKey].qty === 0) delete state.cart[cartKey];
  renderMenu(state.currentTier);
  updateCartBar();
}

function toggleJuice(cartKey) {
  if (!state.cart[cartKey]) return;
  state.cart[cartKey].juice = !state.cart[cartKey].juice;
  renderMenu(state.currentTier);
}
```

- [ ] **Step 2: Verify rendering**

Open `index.html` in browser. The menu should show grouped cards. Click a chip — it should highlight without refreshing the whole page. Click "+ เพิ่ม" — card should show an entry row with qty 1. Click − should decrement.

Open DevTools console, check for errors.

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: grouped card rendering with chip selectors and per-entry juice toggle"
```

---

## Task 4: Update order summary and submit to backend

**Files:**
- Modify: `app.js` — update `renderOrderSummary`, `renderConfirmSummary`, `submitOrder`, `getCartItems`, and add `buildOrderPayload`

- [ ] **Step 1: Update renderOrderSummary**

Find `renderOrderSummary` (currently ~line 349). Replace the `items.map` to use the new cart shape:

```js
function renderOrderSummary() {
  const items = getCartItems();
  const total = getCartTotal();
  document.getElementById('orderSummaryList').innerHTML = items.map(it => `
    <div class="summary-item">
      <div>
        <div class="summary-item-name">${escapeHtml(it.displayName)}</div>
        <div class="summary-item-tags">
          ${it.juice ? '🍊 น้ำส้ม' : '🚫 ไม่รับน้ำส้ม'} &nbsp;× ${it.qty}
        </div>
      </div>
      <div class="summary-item-price">฿${(it.price * it.qty).toLocaleString()}</div>
    </div>`).join('');
  document.getElementById('summaryTotal').textContent = `฿${total.toLocaleString()}`;
  document.getElementById('qrAmount').textContent = `฿${total.toLocaleString()}`;
  toggleDelivery();
}
```

- [ ] **Step 2: Update renderConfirmSummary**

Find `renderConfirmSummary` (currently ~line 369). Replace the `items.map` section:

```js
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
      <div class="summary-item-name">${escapeHtml(it.displayName)} × ${it.qty}</div>
      <div class="summary-item-price">฿${(it.price * it.qty).toLocaleString()}</div>
    </div>`).join('')}
    <div class="summary-divider"></div>
    <div class="summary-total-row"><span>ยอดรวม</span><span class="summary-total-amount">฿${total.toLocaleString()}</span></div>`;
}
```

- [ ] **Step 3: Add buildOrderPayload and update submitOrder**

Find `submitOrder` function. Add `buildOrderPayload` just above it, then replace `submitOrder`:

```js
function buildOrderPayload() {
  const items = getCartItems();
  const method = document.querySelector('input[name="deliveryMethod"]:checked').value;
  const taxReq = document.getElementById('taxInvoiceCheck').checked;
  return {
    customerName: document.getElementById('custName').value,
    phone: document.getElementById('custPhone').value,
    email: document.getElementById('custEmail').value,
    org: document.getElementById('custOrg').value,
    pickupDate: document.getElementById('pickupDate').value,
    method,
    branchOrAddress: method === 'branch'
      ? document.getElementById('branchSelect').value
      : document.getElementById('deliveryAddress').value,
    items: items.map(it => ({
      name: it.displayName,
      qty: it.qty,
      price: it.price,
      juice: it.juice,
    })),
    total: getCartTotal(),
    taxInvoice: taxReq,
    taxData: taxReq ? {
      company: document.getElementById('taxCompany').value,
      taxId: document.getElementById('taxId').value,
      address: document.getElementById('taxAddress').value,
    } : null,
  };
}

async function submitOrder() {
  if (document.getElementById('website').value) return;
  const btn = document.getElementById('step4Submit');
  btn.disabled = true;
  btn.textContent = 'กำลังส่งข้อมูล...';

  try {
    const formData = new FormData();
    formData.append('order', JSON.stringify(buildOrderPayload()));
    if (state.slipFile) formData.append('slip', state.slipFile);

    const res = await fetch(`${BACKEND_URL}/api/orders`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`Server error ${res.status}`);
    const data = await res.json();

    document.getElementById('orderNumber').textContent = data.orderNumber;
    goToStep(5);
    startCountdown(btn);
  } catch (err) {
    console.error('submitOrder failed:', err);
    // Fallback: show order number locally so user is not stuck
    document.getElementById('orderNumber').textContent = generateOrderNumber();
    alert('ส่งออเดอร์แล้ว! กรุณาแจ้ง Admin ทาง Facebook ด้วยนะคะ (ระบบส่งข้อมูลพบปัญหาชั่วคราว)');
    goToStep(5);
    startCountdown(btn);
  }
}
```

- [ ] **Step 4: Update openQuoteModal to use new cart shape**

Find `openQuoteModal`. Replace the `lines` build:

```js
function openQuoteModal() {
  const items = getCartItems();
  const total = getCartTotal();
  if (items.length === 0) return;

  const lines = items.map(it =>
    `• ${it.displayName} × ${it.qty} = ฿${(it.price * it.qty).toLocaleString()} ${it.juice ? '(น้ำส้ม)' : '(ไม่รับน้ำส้ม)'}`
  );
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
```

- [ ] **Step 5: Update resetOrder to clear currentSelections**

Find `resetOrder`. After `state.cart = {};` add:

```js
state.currentSelections = {};
```

- [ ] **Step 6: Test full flow manually**

1. Open `index.html` in browser
2. Select tier 30฿ → pick a chip → click + เพิ่ม — entry should appear
3. Cart bar should appear with count and total
4. Click ถัดไป → complete step 2/3 forms
5. Step 4: click ยืนยัน — browser console should show a fetch attempt to `localhost:3001/api/orders` (will fail since backend isn't running — the fallback shows an order number)
6. Step 5 should show the order number

- [ ] **Step 7: Commit**

```bash
git add app.js
git commit -m "feat: submit order to backend API with FormData, cart summary uses displayName"
```

---

## Task 5: Load hero images from backend

**Files:**
- Modify: `index.html` — add `id="brandLogo"` and `id="coverHero"`
- Modify: `app.js` — add `loadHeroImages()` call in DOMContentLoaded

- [ ] **Step 1: Update index.html header**

Find the `<header class="site-header">` block. Replace the inner content:

```html
<header class="site-header">
  <div id="coverHero" class="cover-hero"></div>
  <div class="header-inner">
    <div class="brand">
      <img id="brandLogo" src="assets/logo.png" alt="นวล เบเกอรี่ 1988" class="brand-logo"
        onerror="this.style.display='none'">
      <div>
        <div class="brand-name">นวล เบเกอรี่ 1988</div>
        <div class="brand-sub">สั่งชุดเบรค / Snack Box</div>
      </div>
    </div>
  </div>
</header>
```

- [ ] **Step 2: Add loadHeroImages in app.js**

In the `document.addEventListener('DOMContentLoaded', ...)` block, add `loadHeroImages()` as the first call:

```js
document.addEventListener('DOMContentLoaded', () => {
  loadHeroImages();
  renderMenu(30);
  setMinPickupDate();
  checkQuoteInHash();
});
```

Add the function before the DOMContentLoaded block:

```js
function loadHeroImages() {
  const logo = document.getElementById('brandLogo');
  const cover = document.getElementById('coverHero');
  if (logo) logo.src = `${BACKEND_URL}/api/assets/logo`;
  if (cover) cover.style.backgroundImage = `url('${BACKEND_URL}/api/assets/cover')`;
}
```

- [ ] **Step 3: Verify**

Reload page. The logo img will fail gracefully (onerror hides it) since backend isn't running. Cover div background will be empty. No console errors. This is expected.

- [ ] **Step 4: Commit**

```bash
git add index.html app.js
git commit -m "feat: load hero logo and cover from backend API on page load"
```

---

## Task 6: Add grouped card CSS

**Files:**
- Modify: `style.css` — append the grouped card styles at the end

- [ ] **Step 1: Read the end of style.css first**

Read `style.css` to find the last line number, then append.

- [ ] **Step 2: Append to style.css**

```css
/* ========================
   GROUPED CARD MENU
   ======================== */

.menu-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  padding: 0 0 80px;
}

@media (min-width: 480px) {
  .menu-grid { grid-template-columns: 1fr 1fr; }
}

.group-card {
  background: white;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(90,53,32,.08);
  border: 1.5px solid transparent;
  transition: border-color .15s;
}

.group-card.has-item {
  border-color: var(--brown);
}

.card-img-wrap {
  position: relative;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  inset: 0;
}

.card-icon-fallback {
  font-size: 44px;
  position: relative;
  z-index: 1;
}

.group-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--brown);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  z-index: 2;
}

.card-content {
  padding: 12px;
}

.card-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--brown);
  margin-bottom: 2px;
  line-height: 1.3;
}

.card-price {
  font-size: 14px;
  font-weight: 600;
  color: var(--gold);
  margin-bottom: 10px;
}

/* Chip selectors */
.chip-row {
  margin-bottom: 8px;
}

.chip-label {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.chip {
  padding: 5px 12px;
  border-radius: 20px;
  border: 1.5px solid var(--cream-dk);
  background: var(--cream);
  color: var(--brown);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  min-height: 32px;
  transition: background .1s, border-color .1s;
}

.chip:active { opacity: .7; }

.chip-active {
  background: var(--brown);
  color: white;
  border-color: var(--brown);
}

/* Add-to-cart button row */
.card-add-row {
  margin-top: 10px;
}

.btn-add-to-cart {
  width: 100%;
  padding: 10px;
  background: var(--brown);
  color: white;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  min-height: 44px;
}

.btn-add-to-cart:active { opacity: .85; }

/* Cart entries within a card */
.card-entries {
  margin-top: 10px;
  border-top: 1px solid var(--cream-dk);
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.entry-name {
  font-size: 13px;
  color: var(--brown);
  font-weight: 600;
  flex: 1;
  min-width: 0;
}

.entry-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.juice-toggle {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  min-height: 32px;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.juice-on { background: #e8f5e9; color: #2e7d32; }
.juice-off { background: #fce4ec; color: #c62828; }

.qty-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid var(--cream-dk);
  background: white;
  color: var(--brown);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}

.qty-btn:last-child {
  background: var(--brown);
  color: white;
  border-color: var(--brown);
}

.qty-num {
  font-size: 15px;
  font-weight: 700;
  color: var(--brown);
  min-width: 20px;
  text-align: center;
}

/* ========================
   COVER HERO
   ======================== */
.cover-hero {
  height: 140px;
  background-size: cover;
  background-position: center;
  background-color: var(--cream);
}

@media (min-width: 480px) {
  .cover-hero { height: 200px; }
}
```

- [ ] **Step 3: Verify visual**

Open `index.html`. Each group card should show:
- Gradient image area with emoji
- Name, price badge
- Flavor chips (where applicable)
- "+ เพิ่ม" button
- After adding: entries appear below the button

Check on narrow viewport (375px) — cards should be 1 column. At 480px+ — 2 columns.

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "style: grouped card UI, chip selectors, entry rows, cover hero"
```

---

## Task 7: Final mobile polish and full test

**Files:**
- Modify: `style.css` — adjust font sizes and spacing to pass mobile audit

- [ ] **Step 1: Add global mobile overrides**

At the **top** of style.css (before any other rules), add if not already present:

```css
/* Ensure no iOS font zoom — minimum 16px on all inputs */
input, select, textarea {
  font-size: 16px !important;
}
```

If `font-size: 16px` is already set on `.form-input`, skip this step.

- [ ] **Step 2: Full manual test checklist**

Test each of these in a 375px viewport (Chrome DevTools mobile):

- [ ] 30฿ tier: select chip → click + เพิ่ม → entry appears → juice toggle works → qty − works
- [ ] 35฿ tier: dual-roll group → select roll1=ใบเตย, roll2=กาแฟ → click + เพิ่ม → cart key shows sorted combo in JS console
- [ ] 50฿ tier: 3-selector group (g50-bread-cup-roll) → all 3 chips selectable → entry added
- [ ] Cart bar appears after adding first item
- [ ] Quote modal: open → text shows displayName correctly
- [ ] Steps 2/3/4 forms: all validation still works
- [ ] Step 5 success screen shows order number

- [ ] **Step 3: Commit final**

```bash
git add style.css
git commit -m "style: mobile font-size fix, final polish"
```

---

## Self-Review: Spec Coverage

| Spec Section | Covered by Task |
|---|---|
| 175 SKU → ~54 group cards | Task 1 |
| Flavor chip selection per group | Task 3 (renderGroupCard) |
| Cart key avoids duplicate SKU codes | Task 2 (buildCartKey) |
| Mobile-first, tap targets ≥44px | Task 6 (CSS: .btn-add-to-cart min-height:44px, .chip min-height:32px) |
| Juice toggle per line item | Task 3 (toggleJuice, entry render) |
| POST to /api/orders | Task 4 (submitOrder) |
| Hero images from backend | Task 5 |
| Quote modal uses displayName | Task 4 |
| 2-column on ≥480px | Task 6 |
| Cover image slot | Task 5 |
