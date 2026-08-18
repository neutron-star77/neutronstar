// NeutronStar Worker 入口：
//  - 托管 Astro 构建产物(dist 静态资源)
//  - 处理 Decap CMS 的 GitHub OAuth 代理 (/api/oauth/auth、/api/oauth/callback)
// 这样 /admin 与 OAuth 接口同域，Decap 登录可用。
interface Env {
  ASSETS: Fetcher;
  OAUTH_CLIENT_ID: string;
  OAUTH_CLIENT_SECRET: string;
}

const SITE = "https://blog.neutronstar.fun";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 发起 GitHub 授权
    if (url.pathname === "/api/oauth/auth") {
      const redirectUri = url.searchParams.get("redirect_uri") || SITE + "/admin/";
      const state = url.searchParams.get("state") || "";
      const clientId = env.OAUTH_CLIENT_ID;
      if (!clientId) return new Response("缺少 OAUTH_CLIENT_ID 环境变量", { status: 500 });

      const setCookie = `decap_redirect=${encodeURIComponent(redirectUri)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`;
      const gh =
        "https://github.com/login/oauth/authorize?" +
        new URLSearchParams({
          client_id: clientId,
          redirect_uri: url.origin + "/api/oauth/callback",
          scope: "repo",
          state,
          allow_signup: "false",
        }).toString();
      return new Response(null, {
        status: 302,
        headers: { Location: gh, "Set-Cookie": setCookie },
      });
    }

    // GitHub 回调：换 token 后回跳 Decap
    if (url.pathname === "/api/oauth/callback") {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state") || "";
      const clientId = env.OAUTH_CLIENT_ID;
      const clientSecret = env.OAUTH_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        return new Response("缺少 OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET 环境变量", { status: 500 });
      }

      const cookie = request.headers.get("Cookie") || "";
      const m = cookie.match(/decap_redirect=([^;]+)/);
      const adminUrl = m ? decodeURIComponent(m[1]) : SITE + "/admin/";

      if (!code) return Response.redirect(adminUrl, 302);

      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: url.origin + "/api/oauth/callback",
        }),
      });
      const tokenData: { access_token?: string } = await tokenRes.json();
      const accessToken = tokenData.access_token;
      if (!accessToken) return new Response("换取 GitHub token 失败", { status: 400 });

      // Decap 的 github 后端从 URL fragment 读取 access_token
      const fragment = new URLSearchParams({
        access_token: accessToken,
        state,
        token_type: "bearer",
      }).toString();
      const sep = adminUrl.includes("#") ? "&" : "#";
      return Response.redirect(adminUrl + sep + fragment, 302);
    }

    // 其余请求交给 Astro 静态资源
    return env.ASSETS.fetch(request);
  },
};
