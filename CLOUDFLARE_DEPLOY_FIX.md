# Cloudflare deployment repair

The Wrangler error "Could not detect a directory containing static files" is fixed
by this package's `wrangler.toml` and `public/index.html`.

## Cloudflare build settings
- Root directory: `TOKO DESAIN` (or the folder containing `wrangler.toml`)
- Build command: leave blank
- Deploy command: `npx wrangler deploy`
- `wrangler.toml` points static assets to `./public`

If the repository is already rooted at the contents of `TOKO DESAIN`, use that repository root
and ensure `wrangler.toml` and `public/index.html` are committed there.

## Important backend limitation
This application was originally built for Google Apps Script. Cloudflare can now publish
the HTML assets, but Apps Script-specific calls such as `google.script.run` do not run
inside Cloudflare. To make checkout, admin upload, Google Sheets, and Drive operations
fully work from the Cloudflare URL, the frontend must be connected to a deployed Apps
Script API or its backend migrated to Cloudflare Worker endpoints. The original
`Code.gs`, `appsscript.json`, and `README_DEPLOY.md` are preserved in this ZIP.
