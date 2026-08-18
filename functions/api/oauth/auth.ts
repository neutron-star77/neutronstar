// Decap CMS GitHub OAuth 代理 —— 发起授权
// Decap 标准 GitHub 登录走 NetlifyAuthenticator：它用 window.open 打开弹窗到
//   {base_url}/{auth_endpoint}?provider=github&site_id=...&scope=repo
// 本函数把弹窗重定向到 GitHub 授权页即可（不需要 state/redirect_uri 回传逻辑）。
export const onRequest: PagesFunction = async (ctx) => {
  const url = new URL(ctx.request.url);
  const params = url.searchParams;
  const scope = params.get("scope") || "repo";

  const clientId = ctx.env.OAUTH_CLIENT_ID;
  if (!clientId) {
    return new Response("缺少 OAUTH_CLIENT_ID 环境变量", { status: 500 });
  }

  const githubAuth =
    "https://github.com/login/oauth/authorize?" +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: url.origin + "/api/oauth/callback",
      scope,
      state: crypto.randomUUID(),
      allow_signup: "false",
    }).toString();

  return Response.redirect(githubAuth, 302);
};
