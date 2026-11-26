/**
 * ============================================================
 * Toko Desain Digital — Backend (Google Apps Script)
 * ============================================================
 * Backend nyata untuk aplikasi Toko Desain Digital.
 * - File disimpan di Google Drive (folder 01-09, auto-create)
 * - Database di Google Sheets (Produk, Transaksi, Backup, Activity)
 * - Akses download dicek berdasarkan status transaksi (paid/private)
 * - Admin function dilindungi ADMIN_TOKEN
 *
 * Deployment: lihat README_DEPLOY.md
 * ============================================================
 */

// ==================== CONFIG ====================
// TODO: ganti nilai ini sebelum deploy
var ADMIN_EMAIL   = 'bayuprojectapp@gmail.com';
var ADMIN_TOKEN   = 'TOKOBAYUDESIGNKURUNGANNYAWA1';  // minimal 24 char acak
var ROOT_FOLDER   = 'TOKO DESAIN DIGITAL';
var DB_NAME       = 'Toko_Desain_Digital_DB';

var CATEGORIES = [
  { code: '01', name: 'Banner dan Spanduk', short: 'Banner' },
  { code: '02', name: 'Undangan',           short: 'Undangan' },
  { code: '03', name: 'Poster dan Brosur',  short: 'Poster' },
  { code: '04', name: 'Logo',               short: 'Logo' },
  { code: '05', name: 'Twibbon',            short: 'Twibbon' },
  { code: '06', name: 'Sekolah',            short: 'Sekolah' },
  { code: '07', name: 'Template CDR',       short: 'CDR' }
];

var FOLDERS = CATEGORIES.concat([
  { code: '08', name: 'File Preview',         short: 'Preview', type: 'public' },
  { code: '09', name: 'Transaksi dan Backup', short: 'Backup',  type: 'private' }
]);

var SEED_PRODUCTS = [
  ['P001','01','Banner Promo Lebaran',25000,'PNG,CDR','Banner promo momentum Lebaran. Layout horizontal siap cetak 200x60 cm dengan ruang logo toko dan diskon.'],
  ['P002','01','Spanduk Buka Toko Baru',22000,'PNG,CDR','Spanduk grand opening dengan layout eye-catching. Termasuk slot foto produk dan tanggal promo.'],
  ['P003','02','Undangan Pernikahan Elegan',35000,'CDR,PDF','Undangan pernikahan klasik dengan ornamen floral. Layout dua lipat siap cetak A5.'],
  ['P004','02','Undangan Ulang Tahun Anak',18000,'PNG,CDR','Undangan ulang tahun tema warna-warni cocok untuk anak. Layout A6 siap cetak.'],
  ['P005','03','Poster Konser Musik',28000,'PNG,AI','Poster konser bergaya modern dengan tipografi besar. Ukuran A2 siap cetak.'],
  ['P006','03','Brosur Produk Kosmetik',20000,'CDR,PDF','Brosur tiga lipat untuk produk kosmetik. Layout profesional dengan ruang foto produk.'],
  ['P007','04','Logo Brand Coffee Shop',45000,'AI,SVG,PNG','Paket logo brand coffee shop lengkap: vektor AI, SVG, dan PNG transparan. Termasuk varian monochrome.'],
  ['P008','04','Logo Tech Startup Minimalis',50000,'AI,SVG','Logo tech startup dengan geometric mark. Paket vektor editable dan panduan penggunaan.'],
  ['P009','05','Twibbon Hari Guru',12000,'PNG','Frame twibbon Hari Guru untuk foto profil media sosial. PNG transparan 1080x1080.'],
  ['P010','05','Twibbon Kemerdekaan RI',12000,'PNG','Twibbon merah-putih untuk HUT RI. PNG transparan siap pakai.'],
  ['P011','06','Kartu Ujian Sekolah',15000,'CDR','Template kartu ujian sekolah editable. Layout standar dengan ruang foto dan data siswa.'],
  ['P012','06','Piagam Penghargaan Siswa',17000,'CDR','Piagam penghargaan siswa dengan ornamen klasik. CDR editable, siap cetak A4.'],
  ['P013','07','Template Brosur CDR Universal',30000,'CDR','Template CorelDRAW serbaguna untuk brosur. Lapisan terorganisir, mudah disesuaikan.'],
  ['P014','07','Template Banner CDR Multi Ukuran',32000,'CDR','Paket template banner CDR untuk berbagai ukuran (1x2, 2x1, 3x1 m). Editable penuh.']
];

// ==================== Routing ====================
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'app';
  if (action === 'app') {
    return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Toko Desain Digital')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  // JSON API (untuk caller eksternal)
  var result;
  try {
    switch (action) {
      case 'catalog':    result = getCatalog(); break;
      case 'product':    result = getProduct(e.parameter.id); break;
      case 'orders':     result = getOrders(e.parameter.buyer); break;
      case 'folders':    result = getFolderStats(); break;
      case 'backups':    result = getBackups(e.parameter.token); break;
      default:           throw new Error('Aksi tidak dikenal: ' + action);
    }
  } catch (err) {
    result = { error: err.message };
  }
  return jsonOut(result);
}

function doPost(e) {
  // API untuk Cloudflare Worker dan webhook eksternal.
  // Format Cloudflare: { action: 'namaFungsi', args: {...} }
  var result;
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var action = body.action;
    var args = body.args || body;

    switch (action) {
      case 'checkout':
      case 'createTransaction':
        result = createTransaction(args); break;
      case 'verifyWebhook':
      case 'verifyTransaction':
        result = verifyTransaction(args); break;
      case 'cancelTransaction':
        result = cancelTransaction(args); break;
      case 'getTransactionsAdmin':
        result = getTransactionsAdmin(args); break;
      case 'getDownloadData':
        result = getDownloadData(args.pid, args.fmt, args.tid); break;
      case 'deleteProduct':
        result = deleteProduct(args); break;
      case 'updateProduct':
        result = updateProduct(args); break;
      case 'uploadDesign':
        result = uploadDesign(args); break;
      case 'getFolderStats':
        result = getFolderStats(); break;
      case 'getDriveConnection':
        result = getDriveConnection(); break;
      case 'createBackup':
        result = createBackup(args); break;
      case 'getBackups':
        result = getBackups(args.token); break;
      case 'getActivity':
        result = getActivity(args.token); break;
      case 'getCatalog':
        result = getCatalog(); break;
      case 'getProduct':
        result = getProduct(args.id || args); break;
      case 'getOrders':
        result = getOrders(args.buyer || args.email || args); break;
      default:
        throw new Error('Aksi POST tidak dikenal: ' + action);
    }
  } catch (err) {
    result = { error: err.message };
  }
  return jsonOut(result);
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==================== Auth ====================
function normalizeAdminToken(token) {
  return String(token == null ? '' : token).trim();
}

function isAdmin(token) {
  var received = normalizeAdminToken(token);
  var expected = normalizeAdminToken(ADMIN_TOKEN);
  return received !== '' && expected !== '' && received === expected;
}

function requireAdmin(token) {
  if (!isAdmin(token)) {
    throw new Error('Tidak diizinkan: admin token salah');
  }
  return true;
}

// ==================== Initialization ====================
function initSystem() {
  var root = getOrCreateRootFolder();
  var folders = {};
  FOLDERS.forEach(function (f) {
    folders[f.code] = getOrCreateSubFolder(root, f.code + ' ' + f.name);
  });

  var ss = getOrCreateDb();
  ensureSheet(ss, 'Produk',    ['id','cat','title','price','formats','desc','fileId','previewId','previewUrl','createdAt']);
  ensureSheet(ss, 'Transaksi', ['id','buyer','email','items','total','date','status','payMethod','verifiedAt']);
  ensureSheet(ss, 'Backup',    ['id','date','size','note']);
  ensureSheet(ss, 'Activity',  ['ts','text']);

  var prodSheet = ss.getSheetByName('Produk');
  if (prodSheet.getLastRow() < 2) seedProducts(prodSheet);

  logActivity('initSystem dijalankan — folder & DB siap');
  return { ok: true, rootUrl: root.getUrl(), dbUrl: ss.getUrl(), folderCount: Object.keys(folders).length };
}

function getOrCreateRootFolder() {
  var it = DriveApp.getFoldersByName(ROOT_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(ROOT_FOLDER);
}

function getOrCreateSubFolder(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function getRootFolder() {
  var it = DriveApp.getFoldersByName(ROOT_FOLDER);
  if (!it.hasNext()) throw new Error('Jalankan initSystem() dulu untuk membuat struktur folder');
  return it.next();
}

function getCategoryFolder(code) {
  var root = getRootFolder();
  var meta = (CATEGORIES.filter(function (c) { return c.code === code; })[0]) ||
             (FOLDERS.filter(function (f) { return f.code === code; })[0]);
  if (!meta) throw new Error('Kategori tidak dikenal: ' + code);
  return getOrCreateSubFolder(root, code + ' ' + meta.name);
}

function getOrCreateDb() {
  var it = DriveApp.getFilesByName(DB_NAME);
  if (it.hasNext()) return SpreadsheetApp.openById(it.next().getId());
  var ss = SpreadsheetApp.create(DB_NAME);
  try { DriveApp.getFileById(ss.getId()).moveTo(getOrCreateRootFolder()); } catch (e) {}
  return ss;
}

function ensureSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function setFilePublic(file) {
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
}

// ==================== Sheet helpers ====================
function headersOf(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

function sheetToObjects(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  return values.slice(1).map(function (row) {
    var obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i]; });
    return obj;
  });
}

function findRowIdx(sheet, id) {
  var headers = headersOf(sheet);
  var idCol = headers.indexOf('id') + 1;
  var values = sheet.getRange(2, idCol, sheet.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (values[i][0] === id) return i + 2; // +2 karena header di row 1, data mulai row 2
  }
  return -1;
}

// ==================== Catalog ====================
function getCatalog() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('td_catalog_v2');
  if (cached) {
    try { return JSON.parse(cached); } catch (e) {}
  }

  var sheet = getOrCreateDb().getSheetByName('Produk');
  var rows = sheetToObjects(sheet);
  var result = { products: rows.map(function (p) {
    // previewUrl historically contains Drive's viewer URL. Return the public
    // file ID as well so the frontend can use Drive's lightweight thumbnail API.
    return {
      id: p.id, cat: p.cat, title: p.title, price: Number(p.price),
      formats: String(p.formats).split(',').map(function (s) { return s.trim(); }),
      desc: p.desc,
      previewId: String(p.previewId || ''),
      previewUrl: p.previewUrl || ''
    };
  })};

  try { cache.put('td_catalog_v2', JSON.stringify(result), 60); } catch (e) {}
  return result;
}

function getProduct(id) {
  var sheet = getOrCreateDb().getSheetByName('Produk');
  var rows = sheetToObjects(sheet);
  var p = rows.filter(function (r) { return r.id === id; })[0];
  if (!p) throw new Error('Produk tidak ditemukan: ' + id);
  return {
    id: p.id, cat: p.cat, title: p.title, price: Number(p.price),
    formats: String(p.formats).split(',').map(function (s) { return s.trim(); }),
    desc: p.desc,
    previewId: String(p.previewId || ''),
    previewUrl: p.previewUrl || ''
  };
}

// ==================== Upload (admin) ====================
function uploadDesign(params) {
  requireAdmin(params.token);
  if (!params.name || !params.base64 || !params.cat) throw new Error('Field wajib kurang: name, base64, cat');
  if (!params.title) throw new Error('Judul wajib diisi');
  if (!params.price || params.price < 1000) throw new Error('Harga minimal Rp 1000');

  var catFolder = getCategoryFolder(params.cat);
  var raw = params.base64.split(',').pop();
  var bytes = Utilities.base64Decode(raw);
  var blob = Utilities.newBlob(bytes, params.mimeType || 'application/octet-stream', params.name);
  var file = catFolder.createFile(blob);
  try { file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE); } catch (e) {}

  // Preview ke folder 08 (public)
  var previewFolder = getCategoryFolder('08');
  var previewFile, previewUrl;
  if (params.mimeType && params.mimeType.indexOf('image/') === 0) {
    // Untuk image: copy ke preview folder, set public
    previewFile = previewFolder.createFile(blob);
    setFilePublic(previewFile);
    previewUrl = previewFile.getUrl();
  } else {
    // Untuk non-image (CDR/AI/PSD/PDF): buat SVG placeholder preview
    var svg = generatePreviewSvg(params.cat, params.title);
    var svgBlob = Utilities.newBlob(svg, 'image/svg+xml', params.title.replace(/\s+/g,'_') + '_preview.svg');
    previewFile = previewFolder.createFile(svgBlob);
    setFilePublic(previewFile);
    previewUrl = previewFile.getUrl();
  }

  var ss = getOrCreateDb();
  var sheet = ss.getSheetByName('Produk');
  var pid = 'P' + String(Date.now() % 1000000).padStart(6, '0');
  sheet.appendRow([
    pid, params.cat, params.title, Number(params.price),
    (params.formats || ['PNG']).join(','), params.desc || '',
    file.getId(), previewFile.getId(), previewUrl, new Date().toISOString()
  ]);
  logActivity('Upload ' + pid + ' "' + params.title + '" → folder ' + params.cat);
  try { CacheService.getScriptCache().remove('td_catalog_v2'); } catch (e) {}
  return { ok: true, id: pid, fileId: file.getId(), previewUrl: previewUrl, previewId: previewFile.getId() };
}

function generatePreviewSvg(cat, title) {
  var palettes = {
    '01': ['#f59e0b','#dc2626'], '02': ['#ec4899','#8b5cf6'],
    '03': ['#06b6d4','#3b82f6'], '04': ['#10b981','#059669'],
    '05': ['#8b5cf6','#6366f1'], '06': ['#f97316','#ea580c'],
    '07': ['#0ea5e9','#0284c7']
  };
  var c = palettes[cat] || ['#64748b','#475569'];
  var initials = (title || '?').split(' ').slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
  var esc = function (s) { return String(s).replace(/[<>&"']/g, function (ch) {
    return ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'})[ch];
  }); };
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="' + c[0] + '"/><stop offset="1" stop-color="' + c[1] + '"/>' +
    '</linearGradient></defs>' +
    '<rect width="400" height="300" fill="url(#g)"/>' +
    '<circle cx="200" cy="130" r="55" fill="white" opacity="0.18"/>' +
    '<text x="200" y="145" font-size="38" font-weight="900" fill="white" text-anchor="middle" font-family="Arial">' + esc(initials) + '</text>' +
    '<text x="200" y="210" font-size="14" font-weight="700" fill="white" text-anchor="middle" opacity="0.95" font-family="Arial">' + esc(title.substring(0, 30)) + '</text>' +
    '<rect x="0" y="280" width="400" height="20" fill="black" opacity="0.25"/>' +
    '<text x="200" y="294" font-size="10" fill="white" text-anchor="middle" opacity="0.85" font-family="Arial">PREVIEW — File asli setelah pembelian</text>' +
    '</svg>';
}

// ==================== Transactions ====================
function createTransaction(params) {
  if (!params.buyer) throw new Error('Nama pembeli wajib');
  if (!params.email) throw new Error('Email pembeli wajib');
  if (!params.items || !params.items.length) throw new Error('Keranjang kosong');
  if (!params.total) throw new Error('Total wajib');

  var ss = getOrCreateDb();
  var sheet = ss.getSheetByName('Transaksi');
  var tid = 'T' + String(Date.now()).slice(-10);
  sheet.appendRow([
    tid, params.buyer, params.email, JSON.stringify(params.items),
    Number(params.total), new Date().toISOString().slice(0, 10),
    'pending', params.payMethod || 'transfer', ''
  ]);
  logActivity('Pesanan baru ' + tid + ' dari ' + params.buyer + ' (' + formatRp(params.total) + ')');
  return { ok: true, id: tid, status: 'pending' };
}

function verifyTransaction(params) {
  requireAdmin(params.token);
  var ss = getOrCreateDb();
  var sheet = ss.getSheetByName('Transaksi');
  var idx = findRowIdx(sheet, params.id);
  if (idx === -1) throw new Error('Transaksi tidak ditemukan: ' + params.id);
  var headers = headersOf(sheet);
  var statusCol = headers.indexOf('status') + 1;
  var verifiedCol = headers.indexOf('verifiedAt') + 1;
  var current = sheet.getRange(idx, statusCol).getValue();
  if (current === 'paid') throw new Error('Sudah diverifikasi');
  sheet.getRange(idx, statusCol).setValue('paid');
  sheet.getRange(idx, verifiedCol).setValue(new Date().toISOString().slice(0, 10));
  logActivity('Transaksi ' + params.id + ' diverifikasi → Lunas');
  return { ok: true, id: params.id, status: 'paid' };
}

function cancelTransaction(params) {
  requireAdmin(params.token);
  var ss = getOrCreateDb();
  var sheet = ss.getSheetByName('Transaksi');
  var idx = findRowIdx(sheet, params.id);
  if (idx === -1) throw new Error('Transaksi tidak ditemukan: ' + params.id);
  var headers = headersOf(sheet);
  sheet.getRange(idx, headers.indexOf('status') + 1).setValue('cancelled');
  logActivity('Transaksi ' + params.id + ' dibatalkan');
  return { ok: true, id: params.id, status: 'cancelled' };
}

function getTransactionsAdmin(params) {
  requireAdmin(params.token);
  var sheet = getOrCreateDb().getSheetByName('Transaksi');
  var rows = sheetToObjects(sheet);
  return { transactions: rows.reverse().map(function (t) {
    return {
      id: t.id, buyer: t.buyer, email: t.email, date: t.date,
      status: t.status, total: Number(t.total), payMethod: t.payMethod,
      items: JSON.parse(t.items || '[]'), verifiedAt: t.verifiedAt || ''
    };
  })};
}

function getOrders(email) {
  if (!email) throw new Error('Email wajib untuk melihat pesanan');
  var sheet = getOrCreateDb().getSheetByName('Transaksi');
  var rows = sheetToObjects(sheet);
  var mine = rows.filter(function (r) { return r.email === email; });
  return { orders: mine.reverse().map(function (t) {
    return {
      id: t.id, buyer: t.buyer, date: t.date, status: t.status,
      total: Number(t.total), payMethod: t.payMethod,
      items: JSON.parse(t.items || '[]'), verifiedAt: t.verifiedAt || ''
    };
  })};
}

// ==================== Download (access-checked) ====================
function getDownloadData(pid, fmt, tid) {
  if (!pid || !fmt || !tid) throw new Error('Parameter kurang: pid, fmt, tid');
  var ss = getOrCreateDb();
  var tSheet = ss.getSheetByName('Transaksi');
  var tRows = sheetToObjects(tSheet);
  var t = tRows.filter(function (r) { return r.id === tid; })[0];
  if (!t) throw new Error('Transaksi tidak ditemukan');
  if (t.status !== 'paid') throw new Error('Belum lunas — file terkunci');

  var items = JSON.parse(t.items || '[]');
  var hasItem = items.some(function (i) { return i.pid === pid; });
  if (!hasItem) throw new Error('Produk tidak ada dalam transaksi ini');

  var pSheet = ss.getSheetByName('Produk');
  var pRows = sheetToObjects(pSheet);
  var p = pRows.filter(function (r) { return r.id === pid; })[0];
  if (!p) throw new Error('Produk tidak ditemukan');
  if (!p.fileId) throw new Error('File belum diupload untuk produk ini');

  var file = DriveApp.getFileById(p.fileId);
  var blob = file.getBlob();
  var bytes = blob.getBytes();
  var b64 = Utilities.base64Encode(bytes);
  logActivity('Download ' + pid + ' (' + fmt + ') untuk transaksi ' + tid);
  return {
    filename: p.id + '_' + String(p.title).replace(/\s+/g, '_') + '.' + String(fmt).toLowerCase(),
    mimeType: blob.getContentType(),
    base64: b64
  };
}

// ==================== Manage (admin) ====================
function deleteProduct(params) {
  requireAdmin(params.token);
  var ss = getOrCreateDb();
  var sheet = ss.getSheetByName('Produk');
  var idx = findRowIdx(sheet, params.id);
  if (idx === -1) throw new Error('Produk tidak ditemukan');
  var p = sheetToObjects(sheet)[idx - 2];
  // Trash file & preview
  try { if (p.fileId)    DriveApp.getFileById(p.fileId).setTrashed(true); } catch (e) {}
  try { if (p.previewId) DriveApp.getFileById(p.previewId).setTrashed(true); } catch (e) {}
  sheet.deleteRow(idx);
  logActivity('Produk ' + params.id + ' dihapus (file di-trash)');
  return { ok: true };
}

function updateProduct(params) {
  requireAdmin(params.token);
  var ss = getOrCreateDb();
  var sheet = ss.getSheetByName('Produk');
  var idx = findRowIdx(sheet, params.id);
  if (idx === -1) throw new Error('Produk tidak ditemukan');
  var headers = headersOf(sheet);
  if (params.price !== undefined) sheet.getRange(idx, headers.indexOf('price') + 1).setValue(Number(params.price));
  if (params.title !== undefined) sheet.getRange(idx, headers.indexOf('title') + 1).setValue(params.title);
  if (params.desc  !== undefined) sheet.getRange(idx, headers.indexOf('desc')  + 1).setValue(params.desc);
  logActivity('Produk ' + params.id + ' diperbarui');
  return { ok: true };
}

// ==================== Folders & Backup ====================
function getFolderStats() {
  var root = getRootFolder();
  var stats = {};
  var totalFiles = 0;
  FOLDERS.forEach(function (f) {
    var it = root.getFoldersByName(f.code + ' ' + f.name);
    var count = 0;
    if (it.hasNext()) count = it.next().getFiles().length;
    stats[f.code] = { name: f.name, count: count };
    totalFiles += count;
  });
  return { folders: stats, total: totalFiles };
}

function getDriveConnection() {
  // Selalu connected jika initSystem sudah jalan (folder root ada)
  var it = DriveApp.getFoldersByName(ROOT_FOLDER);
  var connected = it.hasNext();
  var info = { connected: connected };
  if (connected) {
    var stats = getFolderStats();
    info.folderCount = Object.keys(stats.folders).length;
    info.totalFiles = stats.total;
  }
  return info;
}

function createBackup(params) {
  requireAdmin(params.token);
  var ss = getOrCreateDb();
  var backupFolder = getCategoryFolder('09');
  var bkId = 'BK' + String(Date.now()).slice(-10);
  var copy = DriveApp.getFileById(ss.getId()).makeCopy('Backup_' + bkId, backupFolder);
  var sizeKB = Math.round(copy.getSize() / 1024) + 'KB';
  var bSheet = ss.getSheetByName('Backup');
  bSheet.appendRow([bkId, new Date().toISOString().slice(0, 10), sizeKB, 'Backup manual']);
  logActivity('Backup ' + bkId + ' dibuat (' + sizeKB + ') → folder 09');
  return { ok: true, id: bkId, url: copy.getUrl(), size: sizeKB };
}

function getBackups(token) {
  requireAdmin(token);
  var sheet = getOrCreateDb().getSheetByName('Backup');
  var rows = sheetToObjects(sheet);
  return { backups: rows.reverse().map(function (b) {
    return { id: b.id, date: b.date, size: b.size, note: b.note };
  })};
}

// ==================== Activity ====================
function logActivity(text) {
  try {
    var ss = getOrCreateDb();
    var sheet = ss.getSheetByName('Activity');
    sheet.appendRow([new Date().toISOString(), text]);
    if (sheet.getLastRow() > 100) sheet.deleteRow(2);
  } catch (e) {}
}

function getActivity(token) {
  requireAdmin(token);
  var sheet = getOrCreateDb().getSheetByName('Activity');
  var rows = sheetToObjects(sheet);
  return { activity: rows.slice(-15).reverse().map(function (r) {
    return { ts: r.ts, text: r.text };
  })};
}

// ==================== Seed ====================
function seedProducts(sheet) {
  SEED_PRODUCTS.forEach(function (p) {
    var id = p[0], cat = p[1], title = p[2], price = p[3], formats = p[4], desc = p[5];
    // Buat SVG preview di folder 08 (public)
    var svg = generatePreviewSvg(cat, title);
    var previewFolder = getCategoryFolder('08');
    var blob = Utilities.newBlob(svg, 'image/svg+xml', id + '_preview.svg');
    var previewFile = previewFolder.createFile(blob);
    setFilePublic(previewFile);
    // fileId kosong (produk seed tidak punya file asli; admin upload ulang untuk mengisi)
    sheet.appendRow([
      id, cat, title, Number(price), formats, desc, '',
      previewFile.getId(), previewFile.getUrl(), new Date().toISOString()
    ]);
  });
  logActivity('Seed 14 produk awal');
}

// ==================== Util ====================
function formatRp(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }
