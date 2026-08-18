// Decap CMS GitHub OAuth 代理 —— 回调换取 token 并交还 Decap
// GitHub 回调：{base_url}/callback?code=...&state=...
export const onRequest: PagesFunction = async (ctx) => {
  const url = new URL(ctx.request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") || "";

  const clientId = ctx.env.OAUTH_CLIENT_ID;
  const clientSecret = ctx.env.OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return new Response("缺少 OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET 环境变量", { status: 500 });
  }

  // 从 /auth 阶段写入的 cookie 取回 admin 回跳地址
  const cookie = ctx.request.headers.get("Cookie") || "";
  const m = cookie.match(/decap_redirect=([^;]+)/);
  const adminUrl = m ? decodeURIComponent(m[1]) : "https://blog.neutronstar.fun/admin/";

  if (!code) {
    return Response.redirect(adminUrl, 302);
  }

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
  const tokenData = (await tokenRes.json()) as { access_token?: string };
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    return new Response("换取 GitHub token 失败", { status: 400 });
  }

  // Decap 的 github 后端从 URL fragment 读取 access_token
  const fragment = new URLSearchParams({
    access_token: accessToken,
    state,
    token_type: "bearer",
  }).toString();
  const sep = adminUrl.includes("#") ? "&" : "#";
  return Response.redirect(adminUrl + sep + fragment, 302);
};
