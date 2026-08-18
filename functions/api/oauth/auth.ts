// Decap CMS GitHub OAuth 代理 —— 发起授权
// 对应 Decap 配置里的 base_url = https://blog.neutronstar.fun/api/oauth
// Decap 会请求 {base_url}/auth?redirect_uri=<admin>&state=<state>&scope=repo
export const onRequest: PagesFunction = async (ctx) => {
  const url = new URL(ctx.request.url);
  const params = url.searchParams;
  const redirectUri = params.get("redirect_uri") || "https://blog.neutronstar.fun/admin/";
  const state = params.get("state") || "";

  const clientId = ctx.env.OAUTH_CLIENT_ID;
  if (!clientId) {
    return new Response("缺少 OAUTH_CLIENT_ID 环境变量", { status: 500 });
  }

  // 记住最终要跳回的 admin 地址（GitHub 回调时只带 code+state）
  const setCookie = `decap_redirect=${encodeURIComponent(redirectUri)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`;

  const githubAuth =
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
    headers: { Location: githubAuth, "Set-Cookie": setCookie },
  });
};
