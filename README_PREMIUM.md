# Toko Desain Digital — Premium Colorful Marketplace

Versi premium dari storefront **Toko Desain Digital**. Tampilan dibuat **banyak warna**
dan **banyak panel fungsional**, siap dipublikasikan dengan tampilan yang lebih menarik.

## Apa yang baru

Frontend `index.html` ditulis ulang total sebagai satu file mandiri (self-contained,
inline CSS + JS, tanpa build step) dengan **15+ panel fungsional**:

1. **Top announcement bar** — marquee promo berjalan + status bantuan
2. **Navbar** — logo gradient bersinar, search, 5 nav button, role toggle Pembeli/Admin
3. **Status bar** — indikator backend (Apps Script Live / Demo), jumlah file & produk
4. **Hero** — gradient multi-warna, badge, heading gradient, 2 CTA, 4 statistik
5. **Feature row** — 6 kartu keunggulan dengan top-border warna-warni
6. **Category chips** — 7 kategori + "Semua", ikon warna gradient per kategori
7. **Flash sale strip** — banner promo diskon per kategori
8. **Marketplace 3-kolom**:
   - **Sidebar kiri**: daftar kategori (ikon gradient), promo banner, metode pembayaran
   - **Tengah**: header + sort dropdown + grid/list toggle + grid produk 4 kolom
   - **Sidebar kanan**: mini-cart, top sellers (ranking), trust badges
9. **Stats counter** — 4 kartu angka dengan gradient berbeda
10. **Testimonials** — 3 kartu review pelanggan
11. **FAQ accordion** — 6 pertanyaan interaktif
12. **Newsletter** — panel CTA berlangganan email
13. **Footer** — 4 kolom (brand+social, kategori, bantuan, pembayaran) + bottom bar
14. **Product detail modal** — preview, harga, format, fitur, add-to-cart & beli sekarang
15. **Cart** — qty +/−, hapus, kode promo (HEMAT10), ringkasan, checkout
16. **Checkout** — data pembeli + 4 metode pembayaran + ringkasan
17. **Orders** — riwayat transaksi + tombol download file asli (status Lunas)
18. **Admin panel (5 tab)**: Dashboard (stat cards + activity + mini chart), Transaksi
    (verifikasi/batal), Kelola Desain (edit/hapus), Upload (drag-drop + preview),
    Google Drive (folder tree + tiles + backup)

## Dua mode operasi (otomatis)

- **Mode NYATA** (Google Apps Script): saat dibuka dari URL Web App Apps Script,
  frontend memakai `google.script.run` → `Code.gs`. Data di Google Drive + Sheets.
- **Mode DEMO** (file statik / Cloudflare / hosting lain): saat `google.script.run`
  tidak tersedia, frontend otomatis memakai **data demo tertanam (14 produk)** +
  `localStorage` untuk cart, transaksi, dan backup. Toko langsung tampil lengkap
  dan bisa dipublikasikan ke Cloudflare Pages, GitHub Pages, Netlify, dll.

  Token admin demo: `DEMO1234` (ditampilkan di modal login admin saat mode demo).

## Perbaikan bug dari versi sebelumnya

- `</div>iv>` typo di navbar (HTML rusak) → diperbaiki
- `getElementById('cartCount')` / `getElementById('cartBtn')` merujuk elemen yang
  tidak ada → error setiap update cart / switch role → diperbaiki
- `findProduct(c.id)` di mini-cart salah (cart menyimpan `pid`, bukan `id`) →
  mini-cart tidak pernah menampilkan item → diperbaiki
- `init()` memblokir seluruh halaman dengan overlay "Backend Apps Script Belum Aktif"
  saat dibuka sebagai file statik → diganti dengan fallback demo data sehingga
  storefront langsung tampil dan **bisa dipublikasikan** tanpa backend

## Deploy

### Opsi A — Google Apps Script (backend nyata Drive + Sheets)

1. Buka https://script.google.com → New project
2. Paste `Code.gs` ke editor
3. + → HTML → beri nama `Index` → paste isi `index.html`
4. Project Settings → centang "Show appsscript.json" → paste `appsscript.json`
5. Edit `ADMIN_EMAIL` dan `ADMIN_TOKEN` di bagian CONFIG `Code.gs`
6. Run `initSystem` (otorisasi sekali)
7. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone
8. Buka URL web app — frontend otomatis memakai mode NYATA

### Opsi B — Cloudflare Pages / Workers (storefront publik)

1. Folder ini berisi `public/index.html` + `wrangler.toml` + `src/index.js`
2. `npx wrangler deploy` (atau sambungkan repo ke Cloudflare Pages, root = `public`)
3. Frontend tampil di mode DEMO (data di localStorage)
4. Untuk backend nyata dari Cloudflare: set env `APPS_SCRIPT_URL` ke URL Web App
   Apps Script Anda — `src/index.js` mem-proxy `/api/*` ke Apps Script

### Opsi C — Hosting statik mana pun

Upload `index.html` ke GitHub Pages / Netlify / Vercel / hosting biasa.
Buka langsung — mode DEMO aktif, toko lengkap dengan 14 produk contoh.

## File dalam paket

```
TOKO-DIGITAL-DSIGN-PREMIUM/
├── index.html          ← frontend premium (paste ke Apps Script sebagai "Index")
├── public/index.html   ← frontend premium (untuk Cloudflare / hosting statik)
├── Code.gs             ← backend Apps Script (tidak diubah)
├── appsscript.json     ← manifest Apps Script
├── wrangler.toml       ← konfigurasi Cloudflare Workers
└── src/index.js        ← proxy Cloudflare → Apps Script
```

`index.html` dan `public/index.html` identik — file yang sama bisa dipakai
untuk Apps Script maupun hosting statik.
