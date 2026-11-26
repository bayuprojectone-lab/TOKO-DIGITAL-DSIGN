# TOKOKU — Toko Desain Digital

Paket ini menggunakan **Cloudflare Worker + static assets** untuk frontend dan **Google Apps Script + Google Sheets + Google Drive** untuk backend/data. Frontend tidak lagi bergantung pada `google.script.run`; semua operasi dikirim ke Worker melalui `POST /api/action`.

## 1. Siapkan Google Apps Script

1. Buka https://script.google.com dan buat project.
2. Salin seluruh `Code.gs` ke file `Code.gs`.
3. Pada bagian CONFIG, isi `ADMIN_EMAIL` dan ganti `ADMIN_TOKEN` dengan token acak baru minimal 32 karakter. Jangan gunakan token contoh yang ada di repo.
4. Pilih fungsi `initSystem` lalu klik **Run** dan selesaikan izin Google. Fungsi ini membuat folder Drive dan spreadsheet database.
5. Deploy → **New deployment** → pilih **Web app**.
6. Execute as: **Me**. Who has access: **Anyone**.
7. Klik Deploy, setujui izin, lalu salin URL Web App yang berakhiran `/exec`.
8. Setiap kali mengubah `Code.gs`, buka Deploy → Manage deployments → Edit (ikon pensil) → pilih **New version** → Deploy. URL `/exec` biasanya tetap sama.

`appsscript.json` tersedia sebagai manifest opsional untuk zona waktu dan scope. Aktifkan tampilan manifest melalui Project Settings bila perlu.

## 2. Siapkan Cloudflare Worker

File `wrangler.toml` sudah mengatur Worker `tokoku` dan static assets dari folder `public`.

1. Di terminal, masuk ke folder hasil ekstrak yang berisi `wrangler.toml`.
2. Jalankan `npx wrangler login`.
3. Pasang URL Apps Script sebagai secret (gunakan URL `/exec` yang baru disalin):

```bash
npx wrangler secret put APPS_SCRIPT_URL
```

Saat diminta, tempel URL Web App Apps Script. Jangan menaruh URL/token rahasia di HTML publik.
4. Deploy:

```bash
npx wrangler deploy
```

5. Buka URL Worker yang ditampilkan Wrangler.

## 3. Tes koneksi

Buka `https://URL-WORKER-ANDA/api/health`. Hasil yang diharapkan:

```json
{"ok":true,"service":"TOKOKU API","backendConfigured":true}
```

Jika `backendConfigured:false`, secret belum dipasang pada Worker yang benar. Jika health true tetapi katalog gagal, periksa URL Web App Apps Script, status deployment (Anyone), dan jalankan `initSystem` satu kali.

## 4. Endpoint

- `GET /api/health` — status konfigurasi Worker.
- `POST /api/action` — meneruskan action dan argumen ke `doPost(e)` Apps Script.
- Semua halaman statis dilayani dari `public/`.

## 5. Catatan penting

- Jangan deploy file HTML secara terpisah dari Worker configurasi ini; jalankan `wrangler deploy` dari folder yang berisi `wrangler.toml`.
- Gunakan URL Apps Script `/exec`, bukan URL editor `/edit` atau URL test `/dev`.
- Pastikan `ADMIN_TOKEN` sudah diganti di Apps Script, lalu gunakan token yang sama saat masuk panel admin.
- Jangan bagikan token admin atau URL rahasia ke publik.
- Data transaksi, katalog, dan file disimpan di layanan Google sesuai fungsi yang ada di `Code.gs`.
