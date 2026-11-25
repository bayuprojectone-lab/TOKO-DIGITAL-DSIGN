const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    // API Cloudflare
    if (url.pathname.startsWith("/api/")) {

      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: corsHeaders
        });
      }

      if (!env.APPS_SCRIPT_URL) {
        return new Response(
          JSON.stringify({
            error: "APPS_SCRIPT_URL belum dikonfigurasi"
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      }

      let targetUrl = env.APPS_SCRIPT_URL;

      // /api/catalog
      if (url.pathname === "/api/catalog") {
        targetUrl += "?action=catalog";
      }

      // /api/product?id=P001
      else if (url.pathname === "/api/product") {
        targetUrl += "?action=product&id=" +
          encodeURIComponent(url.searchParams.get("id") || "");
      }

      // /api/orders?buyer=email
      else if (url.pathname === "/api/orders") {
        targetUrl += "?action=orders&buyer=" +
          encodeURIComponent(url.searchParams.get("buyer") || "");
      }

      // POST /api/checkout
      else if (url.pathname === "/api/checkout") {

        const body = await request.text();

        const response = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: body
        });

        return new Response(await response.text(), {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      else {
        return new Response(
          JSON.stringify({
            error: "API tidak ditemukan"
          }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      }

      const response = await fetch(targetUrl);

      return new Response(await response.text(), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }

    // Selain /api → tampilkan website dari public/
    return env.ASSETS.fetch(request);
  }
};