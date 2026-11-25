# Panduan Deployment — Toko Desain Digital (Aplikasi Nyata)

Aplikasi nyata berbasis **Google Apps Script + Google Drive + Google Sheets**. Setelah deploy, Anda mendapat URL publik yang dapat diakses siapa saja untuk berbelanja desain.

## Prasyarat

- Akun Google (Gmail atau Google Workspace)
- Browser modern (Chrome / Firefox / Edge / Safari)
- Ruang Google Drive yang cukup (untuk file desain + backup)

## Arsitektur setelah deploy

```
Akun Google Anda
├── Apps Script Project "Toko Desain Digital"
│   ├── Code.gs          (backend logic — file ini)
│   ├── Index.html       (frontend UI — file ini)
│   └── appsscript.json  (manifest & scopes — file ini)
├── Google Drive
│   └── TOKO DESAIN DIGITAL/  (folder root, auto-create saat initSystem)
│       ├── 01 Banner dan Spanduk/
│       ├── 02 Undangan/
│       ├── 03 Poster dan Brosur/
│       ├── 04 Logo/
│       ├── 05 Twibbon/
│       ├── 06 Sekolah/
│       ├── 07 Template CDR/
│       ├── 08 File Preview/        (public, anyone-with-link)
│       └── 09 Transaksi dan Backup/ (private)
└── Google Sheets
    └── Toko_Desain_Digital_DB  (auto-create saat initSystem)
        ├── sheet Produk
        ├── sheet Transaksi
        ├── sheet Backup
        └── sheet Activity
```

## Langkah Deploy (±15 menit)

### 1. Buat project Apps Script baru

1. Buka https://script.google.com → klik **New project**
2. Editor akan terbuka dengan file `Code.gs` kosong
3. Hapus isi default, **paste seluruh isi file `Code.gs`** dari package ini

### 2. Tambahkan file HTML frontend

1. Di editor Apps Script, klik ikon **+** di samping "Files" → pilih **HTML**
2. Beri nama: `Index` (tanpa ekstensi — Apps Script akan beri `.html` otomatis)
3. Hapus isi default, **paste seluruh isi file `Index.html`** dari package ini

### 3. Tambahkan manifest

1. Klik ikon **gear** ⚙️ (Project Settings) di sidebar kiri
2. Centang **"Show appsscript.json manifest file in editor"**
3. Kembali ke editor, buka file `appsscript.json`
4. **Paste isi file `appsscript.json`** dari package ini (gantikan default)

### 4. Konfigurasi admin

Buka file `Code.gs`, edit baris berikut (di bagian CONFIG paling atas):

```javascript
var ADMIN_EMAIL = 'email-anda@gmail.com';        // email Anda
var ADMIN_TOKEN = 'token-rahasia-yang-kuat-32char'; // ganti dengan string acak minimal 24 karakter
```

> Cara generate token acak: buka https://passwordsgenerator.net atau jalankan di console browser:
> ```js
> Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2,'0')).join('')
> ```

### 5. Jalankan initSystem (sekali saja)

1. Di editor Apps Script, pastikan function `initSystem` dipilih di dropdown (sebelah tombol **Run**)
2. Klik **Run**
3. **Penting**: Saat pertama kali run, Google akan meminta otorisasi:
   - Klik **Review permissions** → pilih akun Anda
   - Klik **Advanced** (di bawah "Google hasn't verified this app")
   - Klik **Go to Toko Desain Digital (unsafe)**
   - Klik **Allow**
4. Setelah run sukses, cek **Execution log** → harus ada pesan `initSystem dijalankan — folder & DB siap`
5. Cek Google Drive Anda → folder `TOKO DESAIN DIGITAL` dengan 9 sub-folder sudah dibuat
6. Cek Google Sheets → spreadsheet `Toko_Desain_Digital_DB` sudah dibuat dengan 14 produk awal

### 6. Deploy sebagai Web App

1. Klik **Deploy** (kanan atas) → **New deployment**
2. Klik ikon **gear** ⚙️ di samping "Select type" → pilih **Web app**
3. Isi:
   - **Description**: `Toko Desain Digital v1.0`
   - **Execute as**: **Me** (akun Anda — agar bisa akses Drive & Sheets Anda)
   - **Who has access**: **Anyone** (publik bisa akses tanpa login Google)
4. Klik **Deploy**
5. Otorisasi lagi jika diminta (sama seperti langkah 5)
6. **Catat Web app URL** — format: `https://script.google.com/macros/s/XXXXXXX/exec`
   - Ini adalah URL aplikasi Anda. Buka di browser → aplikasi siap dipakai!

### 7. Test aplikasi

Buka URL web app di browser:

**Sebagai Pembeli (default):**
- Katalog 14 produk tampil dengan preview
- Klik produk → detail → "Tambah ke Keranjang"
- Buka keranjang → "Lanjut ke Checkout"
- Isi data + email + pilih pembayaran → "Bayar Sekarang"
- Pesanan dibuat dengan status "Menunggu Verifikasi" di Google Sheets

**Sebagai Admin:**
- Klik toggle "Admin" (kanan atas)
- Masukkan ADMIN_TOKEN yang Anda set di langkah 4
- Dashboard menampilkan statistik (produk, transaksi, pendapatan, pending)
- Tab **Transaksi** → klik **Verifikasi** pada pesanan pending → status jadi "Lunas"
- Tab **Upload** → upload desain baru (pilih file + isi form) → produk baru masuk katalog + file masuk folder kategori
- Tab **Kelola Desain** → edit harga / hapus produk
- Tab **Google Drive** → lihat struktur folder + file count + tombol "Backup Sekarang"
- Switch kembali ke Pembeli → buka "Pesanan Saya" → masukkan email yang dipakai checkout → tombol **Download** muncul untuk transaksi "Lunas"

## Verifikasi data di backend

- **File desain**: Google Drive → folder `TOKO DESAIN DIGITAL` → folder kategori (01-07)
- **Preview**: folder `08 File Preview` (sharing: anyone-with-link)
- **Backup**: folder `09 Transaksi dan Backup` (setelah klik "Backup Sekarang")
- **Database**: Google Sheets → spreadsheet `Toko_Desain_Digital_DB`
  - Sheet `Produk`: 14 produk awal (file asli kosong — upload ulang untuk mengisi)
  - Sheet `Transaksi`: semua transaksi pembeli
  - Sheet `Backup`: daftar backup
  - Sheet `Activity`: log aktivitas (maks 100 baris terakhir)

## Akses kontrol & keamanan

| Resource | Akses | Mekanisme |
|----------|-------|-----------|
| Katalog + preview | Publik (anonymous) | doGet `action=catalog` |
| Buat transaksi | Publik (anonymous) | createTransaction via google.script.run |
| Lihat pesanan by email | Publik, filter by email | getOrders(email) |
| Download file asli | Dicek server-side | getDownloadData → cek status=paid + produk ada di transaksi |
| Upload / verifikasi / hapus / backup | Admin only | requireAdmin(token) — token dicek di Code.gs |
| File asli di Drive folder 01-07 | Private (hanya owner) | setSharing PRIVATE saat upload |
| File preview di Drive folder 08 | Anyone-with-link | setSharing ANYONE_WITH_LINK |

**File asli TIDAK pernah public** — download hanya bisa lewat endpoint `getDownloadData` yang memvalidasi status pembayaran.

## Update aplikasi

Untuk update kode (perbaikan bug / fitur baru):

1. Edit file di Apps Script editor
2. Klik **Deploy** → **Manage deployments**
3. Klik ikon **edit** ✏️ pada deployment aktif
4. Pilih **Version: New version** → isi description → **Deploy**
5. URL tetap sama, user langsung dapat versi baru

> Catatan: jika hanya edit kode tanpa new deployment, perubahan tidak langsung live untuk user publik (hanya testing mode). Selalu **New deployment** untuk rilis.

## Integrasi payment gateway nyata (opsional)

Untuk verifikasi pembayaran otomatis (bukan manual admin):

1. Daftar Midtrans / Xendit / Mayar
2. Set webhook URL ke: `https://script.google.com/macros/s/XXX/exec` (URL web app Anda)
3. Tambah handler di `doPost` Code.gs untuk menerima webhook:
   ```javascript
   case 'paymentWebhook':
     // validasi signature dari gateway
     // jika sukses, panggil verifyTransaction({ token: INTERNAL_TOKEN, id: body.order_id })
     break;
   ```
4. Frontend redirect ke payment gateway URL saat checkout

## Troubleshooting

**"Backend Apps Script tidak tersedia"** di frontend
- Anda membuka `Index.html` sebagai file lokal. Deploy dulu sebagai Web App, akses via URL `/exec`.

**Error "Authorization required"**
- Jalankan `initSystem()` dari editor sekali lagi untuk re-authorize.

**Produk tidak muncul setelah upload**
- Cek sheet `Produk` di spreadsheet — row baru harus ada
- Cek folder kategori di Drive — file harus ada
- Cek Execution log di Apps Script untuk error

**Download gagal "Belum lunas"**
- Verifikasi transaksi dulu di Admin → Transaksi → klik Verifikasi
- Atau cek sheet Transaksi, kolom `status` harus `paid`

**File terlalu besar saat upload**
- Apps Script batas ~10MB per request. Untuk file lebih besar, gunakan Drive Picker API atau upload langsung via Drive API resumable.

**Token admin lupa**
- Buka Code.gs di editor, lihat nilai `ADMIN_TOKEN`. Atau set token baru, save, deploy ulang.

## Backup & restore

- **Manual**: Admin → tab Google Drive → "Backup Sekarang" → snapshot spreadsheet dibuat di folder 09
- **File desain**: sudah aman di Google Drive Anda (folder root `TOKO DESAIN DIGITAL`)
- **Restore backup**: buka spreadsheet backup di folder 09, copy data ke sheet utama, atau restore file dari Drive trash

## Estimasi biaya

- **Google Apps Script**: gratis (quota harian cukup untuk toko kecil-menengah)
- **Google Drive**: 15GB gratis (cukup untuk ribuan file desain vektor)
- **Google Sheets**: gratis (limit 10 juta cell — cukup untuk jutaan transaksi)

Untuk volume tinggi (>100 transaksi/hari), pertimbangkan upgrade Google Workspace atau migrasi ke Cloud SQL.

## File dalam package ini

```
toko_desain_real/
├── Code.gs              ← backend (paste ke Apps Script editor)
├── Index.html           ← frontend (paste sebagai HTML file di Apps Script)
├── appsscript.json      ← manifest (paste ke appsscript.json setelah di-enable)
└── README_DEPLOY.md     ← panduan ini
```

## Bantuan

Jika ada masalah, cek:
1. **Apps Script editor → Executions** — log error per eksekusi
2. **Google Drive** — folder & file ada atau tidak
3. **Google Sheets** — data tersimpan atau tidak
4. Browser **DevTools → Console** — error frontend

URL aplikasi setelah deploy: `https://script.google.com/macros/s/XXXXXXX/exec`


## Cloudflare

`public/index.html` adalah versi Cloudflare yang tidak lagi menampilkan overlay
"Backend Apps Script Belum Aktif". Di Cloudflare, katalog/keranjang/checkout demo
menggunakan localStorage. Untuk operasi nyata Google Drive + Google Sheets, gunakan
Web App Apps Script atau hubungkan backend melalui API/proxy.
