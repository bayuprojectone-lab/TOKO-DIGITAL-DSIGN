const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
      if (url.pathname === "/api/health" && request.method === "GET") {
        return json({ ok: true, service: "TOKOKU API", backendConfigured: Boolean(env.APPS_SCRIPT_URL) });
      }
      if (url.pathname !== "/api/action" || request.method !== "POST") {
        return json({ ok: false, error: "API tidak ditemukan. Gunakan POST /api/action." }, 404);
      }
      if (!env.APPS_SCRIPT_URL) {
        return json({ ok: false, error: "Secret APPS_SCRIPT_URL belum dipasang pada Cloudflare Worker." }, 503);
      }
      let target;
      try {
        target = new URL(env.APPS_SCRIPT_URL);
        if (target.protocol !== "https:" || !/script\.google\.com$/.test(target.hostname)) {
          return json({ ok: false, error: "APPS_SCRIPT_URL harus berupa URL HTTPS Web App dari script.google.com." }, 500);
        }
      } catch (_) {
        return json({ ok: false, error: "APPS_SCRIPT_URL tidak valid." }, 500);
      }
      let body;
      try { body = await request.json(); }
      catch (_) { return json({ ok: false, error: "Body harus berupa JSON yang valid." }, 400); }
      if (!body || typeof body.action !== "string" || !body.action.trim()) {
        return json({ ok: false, error: "Nama action wajib diisi." }, 400);
      }
      try {
        const upstream = await fetch(target.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: body.action, args: body.args || {} }),
          redirect: "follow"
        });
        const raw = await upstream.text();
        let parsed;
        try { parsed = JSON.parse(raw); }
        catch (_) {
          return json({ ok: false, error: "Google Apps Script tidak mengembalikan JSON. Pastikan Web App sudah dideploy dengan akses Anyone dan URL berakhiran /exec.", upstreamStatus: upstream.status }, 502);
        }
        return json(parsed, upstream.ok ? 200 : upstream.status);
      } catch (err) {
        return json({ ok: false, error: "Gagal menghubungi Google Apps Script: " + (err && err.message ? err.message : String(err)) }, 502);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
