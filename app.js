'use strict';

// =====================
// BACKEND — Google Apps Script Web App
// Deploy Code.gs → copy Web App URL here
// =====================
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbwOsT2WXazDAPb0X-cqXHRM1JLtG4J_cris6NhsCAeL6KnqSETMw9BB7FkL5fk7lEKt/exec';

// reCAPTCHA v3 site key — public, safe to expose in source code
// Secret key lives only in Code.gs (server-side)
const RECAPTCHA_SITE_KEY = '6Ld8wCEtAAAAAObPj8hbN9sjZyyd3Ha2gplMJPV5';

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

// =====================
// STATE
// cart: { [cartKey]: { qty, juice, price, displayName } }
// currentSelections: { [groupId]: { [selectorKey]: value } }
// =====================
const state = {
  cart: {},
  currentSelections: {},
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

// Escape a value for safe embedding inside a JS string literal within an HTML attribute.
// Prevents breaking out of both the JS string and the HTML attribute context.
function escapeJsAttr(str) {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildDisplayName(group, selections) {
  if (!group.selectors || group.selectors.length === 0) return group.name;
  const parts = group.selectors.map(s => selections[s.key]).filter(Boolean);
  return `${group.name} (${parts.join(' + ')})`;
}

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

function getSelections(group) {
  if (!state.currentSelections[group.groupId]) {
    state.currentSelections[group.groupId] = {};
    (group.selectors || []).forEach(s => {
      state.currentSelections[group.groupId][s.key] = s.options[0];
    });
  }
  return state.currentSelections[group.groupId];
}

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

function findGroup(groupId) {
  for (const tier of Object.values(MENU_GROUPS)) {
    const g = tier.find(g => g.groupId === groupId);
    if (g) return g;
  }
  return null;
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
      <div class="chip-label">${escapeHtml(selector.label)}:</div>
      <div class="chip-group">
        ${selector.options.map(opt => `
          <button class="chip ${sel[selector.key] === opt ? 'chip-active' : ''}"
            onclick="selectChip('${escapeJsAttr(group.groupId)}', '${escapeJsAttr(selector.key)}', '${escapeJsAttr(opt)}')">
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
          <div class="juice-toggle ${v.juice ? 'juice-on' : 'juice-off'}" onclick="toggleJuice('${escapeJsAttr(k)}')">
            🍊 ${v.juice ? 'น้ำส้ม' : 'ไม่รับ'}
          </div>
          <div class="qty-row">
            <button class="qty-btn" onclick="changeQty('${escapeJsAttr(k)}', -1)">−</button>
            <span class="qty-num">${v.qty}</span>
            <button class="qty-btn" onclick="changeQty('${escapeJsAttr(k)}', 1)">+</button>
          </div>
        </div>
      </div>`).join('');

  return `
    <div class="group-card ${groupTotal > 0 ? 'has-item' : ''}" id="card-${escapeHtml(group.groupId)}">
      <div class="card-img-wrap" style="background:linear-gradient(135deg,${group.gradient[0]},${group.gradient[1]})">
        ${groupTotal > 0 ? `<div class="group-badge">${groupTotal}</div>` : ''}
        <img class="card-img" src="assets/products/${escapeHtml(group.groupId)}.jpg"
          onerror="this.style.display='none'" alt="${escapeHtml(group.name)}">
        <div class="card-icon-fallback">${group.icon}</div>
      </div>
      <div class="card-content">
        <div class="card-name">${escapeHtml(group.name)}</div>
        <div class="card-price">฿${group.price} / ชุด</div>
        ${chipRows}
        <div class="card-add-row">
          <button class="btn-add-to-cart" onclick="addToCart('${escapeJsAttr(group.groupId)}')">+ เพิ่ม</button>
        </div>
        ${entriesList ? `<div class="card-entries">${entriesList}</div>` : ''}
      </div>
    </div>`;
}

function selectChip(groupId, selectorKey, value) {
  if (!state.currentSelections[groupId]) state.currentSelections[groupId] = {};
  state.currentSelections[groupId][selectorKey] = value;
  renderMenu(state.currentTier);
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

function updateCartBar() {
  const totalQty = getCartItems().reduce((s, v) => s + v.qty, 0);
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

function getRecaptchaToken() {
  return new Promise((resolve) => {
    if (typeof grecaptcha === 'undefined') { resolve(''); return; }
    grecaptcha.ready(() => {
      grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit_order' }).then(resolve);
    });
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function submitOrder() {
  if (document.getElementById('website').value) return;
  const btn = document.getElementById('step4Submit');
  btn.disabled = true;
  btn.textContent = 'กำลังส่งข้อมูล...';

  try {
    const payload = buildOrderPayload();
    payload.recaptchaToken = await getRecaptchaToken();

    if (state.slipFile) {
      payload.slipBase64 = await fileToBase64(state.slipFile);
      payload.slipName = state.slipFile.name;
      payload.slipType = state.slipFile.type;
    }

    // Content-Type: text/plain avoids CORS preflight on GAS web apps
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Server error ${res.status}`);
    const data = await res.json();

    document.getElementById('orderNumber').textContent = data.orderNumber;
    goToStep(5);
    startCountdown(btn);
  } catch (err) {
    console.error('submitOrder failed:', err);
    document.getElementById('orderNumber').textContent = generateOrderNumber();
    alert('ส่งออเดอร์แล้ว! กรุณาแจ้ง Admin ทาง Facebook ด้วยนะคะ (ระบบส่งข้อมูลพบปัญหาชั่วคราว)');
    goToStep(5);
    startCountdown(btn);
  }
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
  state.currentSelections = {};
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

  state.cart = data.cart || {};
  renderMenu(state.currentTier);
  updateCartBar();

  if (data.date) document.getElementById('pickupDate').value = data.date;
  if (data.method === 'delivery') {
    const r = document.querySelector('input[value="delivery"]');
    if (r) r.checked = true;
  }
  if (data.branch) document.getElementById('branchSelect').value = data.branch;
  if (data.address) document.getElementById('deliveryAddress').value = data.address;

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
