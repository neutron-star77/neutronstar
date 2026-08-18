// Decap CMS GitHub OAuth 代理 —— 回调换取 token，并通过 NetlifyAuthenticator 弹窗协议回传
// GitHub 回跳：{base_url}/api/oauth/callback?code=...&state=...
//
// 关键：本函数运行在【弹窗】里。必须用品窗 postMessage 把 token 发回主窗口（window.opener），
// 而不能重定向到 admin#access_token —— NetlifyAuthenticator 等的是 postMessage，不是 URL fragment。
//
// 协议（来自 Decap v3.3.3 NetlifyAuthenticator）：
//   主窗口先监听 handshake：收到 "authorizing:github" 且 r.origin === base_url 后，注册真正的回调监听；
//   随后收到 "authorization:github:success:<json>" 即登录成功（json 需含 {token}），
//   收到 "authorization:github:error:<json>" 即登录失败。
export const onRequest: PagesFunction = async (ctx) => {
  const url = new URL(ctx.request.url);
  const code = url.searchParams.get("code");
  const ghError = url.searchParams.get("error");
  const ghErrorDesc = url.searchParams.get("error_description");

  const clientId = ctx.env.OAUTH_CLIENT_ID;
  const clientSecret = ctx.env.OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return renderPopup(null, "缺少 OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET 环境变量");
  }

  if (!code) {
    const msg = ghError
      ? `GitHub 授权失败：${ghError}${ghErrorDesc ? " - " + ghErrorDesc : ""}`
      : "GitHub 未回传 code（可能你取消了授权）";
    return renderPopup(null, msg);
  }

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
    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      const detail =
        (tokenData.error ? `error=${tokenData.error}` : "") +
        (tokenData.error_description ? `; ${tokenData.error_description}` : "");
      return renderPopup(null, "换取 GitHub token 失败：" + (detail || "GitHub 未返回 access_token"));
    }
    return renderPopup(accessToken, null);
  } catch (e) {
    return renderPopup(null, "调用 GitHub 换取 token 时异常：" + (e instanceof Error ? e.message : String(e)));
  }
};

// 在【弹窗】里渲染脚本：先握手 "authorizing:github"，再回传 success/error。
function renderPopup(token: string | null, errMsg: string | null): Response {
  const payload = token
    ? "authorization:github:success:" + JSON.stringify({ token })
    : "authorization:github:error:" + JSON.stringify({ message: errMsg || "未知错误" });
  const html = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Decap 登录中…</title></head>
<body>
<script>
(function () {
  var payload = ${JSON.stringify(payload)};
  try {
    if (window.opener) {
      // 先发握手信号（主窗口据此注册回调监听），再发真正的 token / error
      window.opener.postMessage("authorizing:github", location.origin);
      window.opener.postMessage(payload, location.origin);
      window.close();
    } else {
      document.body.textContent = payload;
    }
  } catch (e) {
    document.body.textContent = "回调脚本出错：" + (e && e.message ? e.message : e);
  }
})();
</script>
</body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
