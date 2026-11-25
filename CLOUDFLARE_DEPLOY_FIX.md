# Cloudflare deployment — fixed storefront

Versi ini memperbaiki masalah saat `public/index.html` dibuka melalui Cloudflare.
Sebelumnya aplikasi langsung menghentikan `init()` dan menampilkan overlay
**Backend Apps Script Belum Aktif** karena `google.script.run` hanya tersedia di
Google Apps Script.

## Sekarang

- Halaman Toko Desain Digital tetap tampil di Cloudflare.
- Katalog 14 produk contoh tetap muncul.
- Pencarian, kategori, detail produk, keranjang, dan checkout demo memakai `localStorage`.
- Data demo tidak tersimpan ke Google Drive/Google Sheets.
- Jika aplikasi dibuka dari Google Apps Script, `google.script.run` tetap digunakan seperti sebelumnya.
- Backend nyata Google Drive + Sheets masih membutuhkan koneksi API/Apps Script.

## Deploy Cloudflare Workers

Pada folder yang berisi `wrangler.toml`:

```bash
npx wrangler deploy
```

Konfigurasi saat ini:

- Root directory: folder proyek ini
- Build command: kosong
- Deploy command: `npx wrangler deploy`
- Static assets: `./public`

## Penting untuk transaksi nyata

Cloudflare tidak menyediakan `google.script.run`. Jadi versi Cloudflare ini sengaja
menampilkan storefront terlebih dahulu agar tidak blank/terblokir. Untuk mengaktifkan
Google Drive, Google Sheets, upload desain, verifikasi transaksi, dan download file
asli dari Cloudflare, backend Apps Script harus dihubungkan melalui API/proxy.
