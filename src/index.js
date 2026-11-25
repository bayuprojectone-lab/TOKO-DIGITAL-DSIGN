const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }

      if (!env.APPS_SCRIPT_URL) {
        return new Response(
          JSON.stringify({ error: "APPS_SCRIPT_URL belum dikonfigurasi" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          }
        );
      }

      let targetUrl = env.APPS_SCRIPT_URL;

      if (url.pathname === "/api/catalog" && request.method === "GET") {
        targetUrl += "?action=catalog";
        return proxyGet(targetUrl);
      }

      if (url.pathname === "/api/product" && request.method === "GET") {
        targetUrl += "?action=product&id=" +
          encodeURIComponent(url.searchParams.get("id") || "");
        return proxyGet(targetUrl);
      }

      if (url.pathname === "/api/orders" && request.method === "GET") {
        targetUrl += "?action=orders&buyer=" +
          encodeURIComponent(url.searchParams.get("buyer") || "");
        return proxyGet(targetUrl);
      }

      // Semua fungsi lain dari frontend dikirim sebagai POST:
      // { action: "namaFungsi", args: {...} }
      if (url.pathname === "/api/action" && request.method === "POST") {
        const body = await request.text();

        const response = await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body
        });

        return new Response(await response.text(), {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      // Tetap dukung endpoint checkout lama
      if (url.pathname === "/api/checkout" && request.method === "POST") {
        const body = await request.text();

        const response = await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body
        });

        return new Response(await response.text(), {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      return new Response(
        JSON.stringify({ error: "API tidak ditemukan" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    return env.ASSETS.fetch(request);
  }
};

async function proxyGet(targetUrl) {
  const response = await fetch(targetUrl);

  return new Response(await response.text(), {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}
