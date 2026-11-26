# Toko Desain Digital — Marketplace Desain Kreatif (Versi Asli)

Frontend **asli** (tanpa mode demo) untuk **Toko Desain Digital**. Tampilan
banyak warna, banyak panel fungsional, dan sudah dirapikan. Frontend hanya
berkomunikasi dengan backend **Google Apps Script** lewat `google.script.run` —
data nyata di Google Drive + Google Sheets.

## Sifat aplikasi (asli, bukan demo)

- **Tidak ada data palsu / mode demo.** Tidak ada `DEMO_PRODUCTS`, tidak ada
  `localStorage` untuk katalog/transaksi, tidak ada `DEMO_ADMIN_TOKEN`.
- Frontend memanggil fungsi backend `Code.gs` persis dengan konvensi asli:
  - tanpa argumen: `getCatalog`, `getFolderStats`, `getDriveConnection`
  - argumen primitive: `getProduct(id)`, `getOrders(email)`, `getBackups(token)`, `getActivity(token)`
  - 3 argumen primitive: `getDownloadData(pid, fmt, tid)`
  - argumen objek `params`: `uploadDesign`, `createTransaction`, `verifyTransaction`, `cancelTransaction`, `getTransactionsAdmin`, `deleteProduct`, `updateProduct`, `createBackup`
- Produk hanya menampilkan field nyata dari backend: `id, cat, title, price, formats, desc, previewId, previewUrl` (tidak ada `oldPrice`/`rating`/`sold` palsu).
- **Keranjang** disimpan di `localStorage` — ini pola standar e-commerce (cart sisi klien sampai checkout), bukan demo.
- Saat frontend dibuka **tanpa** Apps Script (file biasa / host statik tanpa proxy), tidak menampilkan data palsu. Yang muncul adalah halaman **"Deployment Required"** yang jujur berisi 5 langkah deploy + link ke `script.google.com`.

## Banyak panel fungsional (15+)

1. Top announcement bar (marquee promo)
2. Navbar (logo gradient, search, 5 nav, role toggle Pembeli/Admin)
3. Status bar (indikator Drive nyata, jumlah file & produk, badge Apps Script)
4. Hero (gradient, 4 statistik, CTA)
5. Feature row (6 kartu keunggulan)
6. Category chips (7 kategori + Semua)
7. Flash sale strip
8. Marketplace 3-kolom: sidebar kategori + promo + pembayaran | grid produk + sort | mini-cart + terlaris + trust
9. Stats counter (4 kartu)
10. Testimonials (3 kartu)
11. FAQ accordion (6)
12. Newsletter
13. Footer 4-kolom + social + pembayaran
14. Product detail modal (preview, harga, format, fitur, add-to-cart & beli)
15. Cart (qty +/−, hapus, kode promo HEMAT10, ringkasan)
16. Checkout (data pembeli + 4 metode pembayaran → createTransaction ke Sheets)
17. Orders (riwayat dari Sheets + tombol download file asli saat status Lunas)
18. Admin 5-tab: Dashboard (stat cards + activity + chart), Transaksi (verifikasi/batal), Kelola Desain (edit/hapus), Upload (drag-drop + preview), Google Drive (folder tree + tiles + backup)

## Deploy (Google Apps Script — backend nyata)

1. Buka https://script.google.com → **New project**
2. Hapus isi default, paste seluruh **`Code.gs`**
3. **+ → HTML** → beri nama `Index` (tanpa ekstensi) → paste isi **`index.html`**
4. **Project Settings** ⚙️ → centang "Show appsscript.json manifest file in editor" → paste **`appsscript.json`**
5. Edit `Code.gs` bagian CONFIG:
   - `ADMIN_EMAIL` → email Anda
   - `ADMIN_TOKEN` → string acak minimal 24 karakter
6. Pilih function `initSystem` di dropdown → **Run** (otorisasi sekali)
   - Folder `TOKO DESAIN DIGITAL` + 9 sub-folder dibuat di Google Drive
   - Spreadsheet `Toko_Desain_Digital_DB` dibuat dengan 14 produk awal (sheet Produk/Transaksi/Backup/Activity)
7. **Deploy → New deployment → Web app**
   - Execute as: **Me** · Who has access: **Anyone**
8. Buka URL Web App → frontend otomatis memakai `google.script.run` → katalog, transaksi, dan file nyata dari Drive + Sheets

## Struktur folder Apps Script (otomatis)

```
Google Drive / TOKO DESAIN DIGITAL/
├── 01 Banner dan Spanduk/   (private — file asli)
├── 02 Undangan/             (private)
├── 03 Poster dan Brosur/    (private)
├── 04 Logo/                 (private)
├── 05 Twibbon/              (private)
├── 06 Sekolah/              (private)
├── 07 Template CDR/         (private)
├── 08 File Preview/         (public — preview ber-watermark)
└── 09 Transaksi dan Backup/ (private — backup Sheets)

Google Sheets / Toko_Desain_Digital_DB
├── Produk     (id, cat, title, price, formats, desc, fileId, previewId, previewUrl, createdAt)
├── Transaksi  (id, buyer, email, items, total, date, status, payMethod, verifiedAt)
├── Backup     (id, date, size, note)
└── Activity   (ts, text)
```

## Catatan untuk Cloudflare / host statik

Frontend ini hanya berjalan penuh di Apps Script. Jika di-host di Cloudflare
Pages / GitHub Pages tanpa proxy ke Apps Script, frontend akan menampilkan
halaman **"Deployment Required"** (bukan data palsu). Untuk menjalankan dari
Cloudflare, hubungkan ke Apps Script via proxy `src/index.js` dengan menyet
env `APPS_SCRIPT_URL`.

## File dalam paket

```
TOKO-DIGITAL-DSIGN-PREMIUM/
├── index.html          ← frontend asli (paste ke Apps Script sebagai "Index")
├── public/index.html   ← frontend asli (untuk host statik / Cloudflare)
├── Code.gs             ← backend Apps Script (tidak diubah)
├── appsscript.json     ← manifest Apps Script
├── wrangler.toml       ← konfigurasi Cloudflare Workers
└── src/index.js        ← proxy Cloudflare → Apps Script
```

`index.html` dan `public/index.html` identik.
