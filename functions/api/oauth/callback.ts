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
    const ghErr = url.searchParams.get("error");
    const ghDesc = url.searchParams.get("error_description");
    console.error(
      "GitHub 回调未带 code，query=",
      url.search,
      "cookie=",
      cookie,
    );
    if (ghErr) {
      // GitHub 在授权回调里直接回了 error（最常见 redirect_uri_mismatch / access_denied），
      // 把它透传给前端，避免静默弹回登录界面让人摸不着头脑。
      return new Response(
        `GitHub 授权回调报错：error=${ghErr}` +
          (ghDesc ? `；${ghDesc}` : "") +
          `\n（state=${state}）`,
        { status: 400 },
      );
    }
    return Response.redirect(adminUrl, 302);
  }

  let tokenData: { access_token?: string; error?: string; error_description?: string };
  try {
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
    tokenData = (await tokenRes.json()) as typeof tokenData;
  } catch (e) {
    return new Response(
      "调用 GitHub 换取 token 时异常：" + (e instanceof Error ? e.message : String(e)),
      { status: 502 },
    );
  }
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    // 把 GitHub 返回的真实错误透传出来，方便排查（最常见的就是 client_secret 不匹配 / code 已用过）
    const detail =
      (tokenData.error ? `error=${tokenData.error}` : "") +
      (tokenData.error_description ? `; ${tokenData.error_description}` : "");
    console.error("GitHub token exchange failed:", detail, "clientId=", clientId);
    return new Response("换取 GitHub token 失败：" + (detail || "GitHub 未返回 access_token"), {
      status: 400,
    });
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
