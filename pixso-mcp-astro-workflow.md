# Pixso × MCP × Astro：Mizuki 设计稿改造完整链路

> 目标：把 Mizuki 二次元博客的设计稿导入 Pixso → 在 Pixso 里做"二次元 × 科幻 HUD"融合改造 → 通过 Pixso MCP 让 AI 编程助手（Cursor / Claude Code / CodeBuddy / Trae）直接生成可落地的 Astro + Tailwind 代码。

---

## 0. 为什么是 Pixso 而不是 Figma MCP

| 维度 | Figma 官方 Dev Mode MCP | Pixso MCP |
|---|---|---|
| 免费额度 | 极低（约 6 次/月）[citation:8] | 免费、无次数限制[citation:16] |
| 协议 | SSE，需 Token + 权限配置 | 本地 HTTP，开箱即用[citation:2] |
| 输出模式 | 结构化数据 | 结构化数据 + D2C+ 组件映射[citation:2] |
| 设计稿来源 | 仅 Figma | Figma 导入 + 自有设计[citation:8][citation:23] |
| 中文生态 | 弱 | 强，文档全中文[citation:16] |
| 还原度实测 | ~90% | ~90%，易用性更优[citation:16] |

**结论**：个人开发者做"设计稿 → AI → Astro 代码"这条路，Pixso MCP 是当前最务实的国内替代方案[citation:8]。Figma 负责出设计稿，Pixso 负责承接 AI 转代码链路。

---

## 1. 完整链路总览

```
┌──────────────┐   导入    ┌──────────────┐   MCP     ┌──────────────────┐   生成    ┌──────────────┐
│  Mizuki 设计  │ ──────→ │   Pixso 设计稿  │ ──────→ │  AI 编程助手     │ ──────→ │  Astro + Tailwind │
│  (Figma/PSD) │          │  (改造后 HUD)   │          │  Cursor/Claude/  │          │  可运行代码      │
└──────────────┘          └──────────────┘          │  CodeBuddy/Trae  │          └──────────────┘
                                                    └──────────────────┘
                                                          ↑
                                                  设计令牌 + 提示词工程
```

四步走：**导入 → 改造 → 建令牌 → MCP 出码**。

---

## 2. 阶段一：把 Mizuki 设计稿导入 Pixso

### 2.1 路径 A：从 Figma 导入（推荐）

Mizuki 的设计源文件大概率在 Figma 社区。步骤：

1. 在 Figma 打开 Mizuki 文件 → `File → Save local copy` → 下载为 `.fig` 文件[citation:23]
2. 安装 Pixso 桌面端（≥ 2.2.0，官网 pixso.cn 下载）[citation:2][citation:16]
3. 登录 Pixso → 工作台 → 点 `导入文件` → 选 `.fig` → 等待进度条完成[citation:23]
4. 导入后文件出现在「我的草稿」，图层结构、组件、变体、Auto Layout 都会保留[citation:16][citation:23]

### 2.2 路径 B：从 Mizuki 截图/HTML 逆向

如果没有 Figma 源文件：
1. 把 Mizuki 博客截图或导出 HTML
2. 用 Pixso 的 `code_to_design` 工具（需本地 MCP）把网页代码反向转为可编辑设计稿[citation:6]
3. 或用 Pixso 内置的 `html.to.design` 类插件导入

### 2.3 验证导入成功

- [ ] 图层树结构完整（不出现大量"Frame 1 / Group 2"无名图层）
- [ ] 组件（按钮、卡片、导航栏）识别为 Component
- [ ] Auto Layout 约束保留
- [ ] 文字样式、颜色样式可单独查看

> ⚠️ **坑 1：图层命名混乱**
> 导入后大量图层是 "Rectangle 123" 这种无意义名字。Pixso MCP 是**靠语义化命名**来生成好代码的，命名越烂，AI 生成的代码越差[citation:3][citation:11]。
> **解决**：导入后用 Pixso 的批量重命名功能，按"组件类型_状态_位置"规范重命名（如 `btn-primary-hover`、`card-post-md3`）。

> ⚠️ **坑 2：Figma 私有字体丢失**
> Mizuki 用的 Noto Sans JP / Quicksand 在 Pixso 里可能回退为默认字体。
> **解决**：在 Pixso 字体面板替换为本机已安装的对应字体，或上传字体文件。

---

## 3. 阶段二：在 Pixso 里做"二次元 × 科幻 HUD"融合改造

这是设计工作，不是编码。目标是在 Pixso 里把改造后的视觉效果**画出来**，让 MCP 后续能精准读取。

### 3.1 改造清单（对照 Mizuki 原组件）

| Mizuki 原组件 | Pixso 改造动作 | 设计令牌命名 |
|---|---|---|
| 顶部导航栏 | 改为直角 HUD 面板 + 等宽字体 | `--hud-nav-bg`、`--font-mono` |
| 文章卡片 | 保留圆角 MD3 + 叠加 HUD 四角括号 | `--radius-md3`、`--hud-corner-cyan` |
| 全屏 Banner | 下方加扫描线装饰层 | `--scanline-opacity`、`--scan-speed` |
| 侧边栏 | 改为 HUD 状态面板样式 | `--glass-bg`、`--glass-border` |
| 代码块 | 标题栏改为 `[~/file.tsx]` 风格 | `--code-header-bg` |
| 背景 | 加星空粒子图层（静态示意） | `--bg-stars-color` |
| 配色 | 加霓虹青/品红变量 | `--hud-cyan`、`--hud-magenta` |

### 3.2 关键设计原则

**双轨令牌制**[citation:3]：
- **sakura 轨**：保留 Mizuki 的粉樱色系（二次元内核）
- **hud 轨**：新增霓虹青/品红/深空灰（科幻外壳）

在 Pixso 里用「**变量（Variables）**」功能建立这两组颜色变量，命名为 `color/sakura/200`、`color/hud/cyan` 等[citation:15]。**这一步极其关键**——Pixso MCP 的 `get_variables` / `get_variable_sets` 工具会直接读取这些变量，生成 CSS 自定义属性[citation:6][citation:10]。

### 3.3 具体改造步骤

1. **建变量组**：Pixso 左侧面板 → 变量 → 新建 `sakura` 和 `hud` 两组颜色变量[citation:15]
2. **改组件**：逐个打开 Mizuki 的组件，把硬编码颜色替换为变量引用
3. **加 HUD 装饰**：新建图层画四角括号（2px 线段）、扫描线（渐变矩形）、状态条
4. **做变体**：为每个组件建 `default / hud-mode` 两个变体，方便对比[citation:6]
5. **语义化命名**：所有图层、组件、变量用清晰英文命名

### 3.4 验证改造完成

- [ ] 所有颜色来自变量，无硬编码 hex
- [ ] 每个组件有 `default` 和 `hud` 两个变体
- [ ] 图层命名全部语义化
- [ ] 用 Auto Layout 表达响应式意图[citation:3][citation:11]
- [ ] 导出一张完整页面截图，肉眼确认"二次元 × 科幻"效果达标

> ⚠️ **坑 3：变量没绑定到图层**
> 在 Pixso 里定义了变量，但图层仍用固定颜色。MCP 读取时只会拿到"固定值"而非变量名，生成的代码就没有 `var(--token)`。
> **解决**：用 `set_fill_style` / `set_text_style` 等 MCP 工具批量绑定变量[citation:6]，或在 Pixso UI 里逐个"应用变量"。

> ⚠️ **坑 4：HUD 装饰层阻挡交互**
> 扫描线、四角括号等装饰图层如果盖在按钮上方，生成的代码会继承这种结构，导致点击失效。
> **解决**：装饰图层放在最底层或用"不阻挡点击"的图层属性。后续 Astro 代码里也要设 `pointer-events: none`。

---

## 4. 阶段三：启用 Pixso MCP 并接入 AI 编程助手

### 4.1 启用 Pixso 本地 MCP 服务

1. 打开 Pixso 桌面端（保持运行！）[citation:2][citation:7]
2. 打开改造好的设计文件（保持文件为当前激活状态）[citation:6]
3. 左上角菜单 → `Pixso MCP` → `打开本地 MCP 服务器`[citation:12][citation:16]
4. 画布底部出现提示：`MCP 服务器已开启，地址: http://127.0.0.1:3667/mcp`[citation:16]

> ⚠️ **坑 5：Pixso 客户端必须全程开着**
> MCP 是本地服务，关掉 Pixso 客户端 = 服务断开 = AI 拿不到数据[citation:7][citation:8]。
> **解决**：开发期间 Pixso 常驻后台，或用 PM2 类工具保活（参考 Figma MCP 的保活建议[citation:5]）。

### 4.2 在 AI 编程助手端配置 MCP

Pixso MCP 支持 Cursor / Claude Code / CodeBuddy / Trae / VS Code / Windsurf 等主流 IDE[citation:2][citation:7]。

**Cursor 配置**（最常用）[citation:12][citation:16]：
```json
// ~/.cursor/mcp.json 或项目级 .cursor/mcp.json
{
  "mcpServers": {
    "Pixso MCP": {
      "url": "http://localhost:3667/mcp",
      "headers": {}
    }
  }
}
```
保存后回 Cursor Settings → MCP，看到 Pixso MCP 圆点变绿 = 连接成功[citation:12][citation:16]。

**Claude Code 配置**[citation:2][citation:7]：
```bash
claude mcp add --transport http pixso-desktop http://127.0.0.1:3667/mcp
```

**CodeBuddy 配置**[citation:2]：
```json
{
  "mcpServers": {
    "pixso": {
      "type": "http",
      "url": "http://127.0.0.1:3667/mcp"
    }
  }
}
```

**Trae / VS Code / Windsurf**：参考官方文档对应配置[citation:2][citation:20]。

### 4.3 验证 MCP 连通

在 IDE 的终端或 MCP 面板执行：
```bash
curl http://127.0.0.1:3667/mcp
```
返回 JSON 描述即正常。或在 AI 对话框直接问："当前 Pixso 选中了什么节点？"能正确回答即通。

> ⚠️ **坑 6：端口冲突**
> 3667 被占用时服务起不来。
> **解决**：在 Pixso 设置里改 MCP 端口，同步改 IDE 配置。

> ⚠️ **坑 7：IDE 版本过低**
> VS Code 需 ≥ 1.99、Cursor 需支持 MCP 协议[citation:7]。
> **解决**：先升级 IDE。

---

## 5. 阶段四：让 AI 生成改造后的 Astro 代码

这是核心环节。Pixso MCP 提供两类工具[citation:6][citation:10]：

### 5.1 可用工具速查

| 工具 | 模式 | 用途 |
|---|---|---|
| `design_to_code` | 本地 MCP | **核心**：把选中节点转成前端代码（HTML/React/Vue/ArkUI/Flutter）[citation:2][citation:6] |
| `refine_generated_code` | 本地 MCP | 对生成的代码做优化（通常自动触发）[citation:6] |
| `get_node_dsl` | 本地/远程 | 获取节点 DSL（图层树、布局、样式、内容）[citation:6][citation:10] |
| `get_screenshot` | 本地 MCP | 截图当前设计，用于视觉对齐[citation:6] |
| `get_export_image` | 本地 MCP | 导出 PNG/SVG/WebP 资源[citation:6] |
| `get_all_components` | 本地 MCP | 查看文件全部组件[citation:6] |
| `get_variants` | 本地/远程 | 查看组件变体（状态/尺寸/主题）[citation:6][citation:10] |
| `get_local_styles` | 本地/远程 | 查看本地样式[citation:6][citation:10] |
| `get_variable_sets` / `get_variables` | 本地/远程 | **关键**：读取设计令牌[citation:6][citation:10] |
| `set_fill_style` / `set_text_style` | 本地 MCP | 写回样式（反向操作）[citation:6] |
| `code_to_design` | 本地 MCP | 代码转设计稿（反向）[citation:6] |
| `query_all_unique_props` | 本地 MCP | 审计颜色/字体/间距[citation:6] |
| `replace_props` | 本地 MCP | 批量替换属性[citation:6] |

### 5.2 推荐工作流（分四步）

**第 1 步：先让 AI 看设计令牌，生成 `design-tokens.css`**

在 Pixso 选中根节点或变量组 → 复制链接 → 在 IDE 对话框输入：

```
读取这个 Pixso 设计稿的变量：
https://pixso.cn/app/design/xxx?item-id=1:2

请用 get_variable_sets 和 get_variables 提取全部设计令牌，
输出为 Astro 项目可用的 src/styles/design-tokens.css，
格式为 :root { --token-name: value; }，
按 color/sakura、color/hud、font、radius、shadow 分组注释。
```

AI 会调用 MCP 拿到结构化变量数据，输出类似：

```css
:root {
  /* color/sakura */
  --sakura-200: #FFB7C5;
  --sakura-500: #FF6FA5;

  /* color/hud */
  --hud-cyan: #00E5FF;
  --hud-magenta: #FF2E97;

  /* font */
  --font-mono: 'JetBrains Mono', monospace;
  --font-display: 'Noto Sans JP', sans-serif;

  /* radius (双轨) */
  --radius-md3: 12px;
  --radius-hud: 2px;
}
```

> ⚠️ **坑 8：AI 输出硬编码颜色而非 var()**
> 如果设计稿里图层没绑定变量，MCP 只能拿到裸色值，AI 就会写出 `color: #00E5FF` 而不是 `color: var(--hud-cyan)`。
> **解决**：回到阶段三第 3 步，确保所有图层绑定了变量；或在提示词里强制要求"所有颜色必须用 var(--token)，不要硬编码"。

**第 2 步：逐组件生成 Astro 代码**

不要一次性让 AI 生成整页（容易超上下文、准确率低）[citation:16][citation:21]。按组件逐个来：

```
选中 Pixso 里的"文章卡片"组件，复制链接。
用 design_to_code 为这个节点生成 Astro + Tailwind CSS 代码，
要求：
1. 使用 Tailwind v4 工具类 + CSS 变量，不要硬编码颜色
2. 保留 MD3 圆角（var(--radius-md3)）作为卡片容器
3. 叠加 HUD 四角括号（2px 直角，var(--hud-cyan)）
4. 悬停时卡片抬升 + 边框发光（box-shadow: var(--glow-cyan)）
5. 输出 interface Props 类型声明
6. 对不确定的设计细节加 // TODO 注释
```

Pixso MCP 的 `design_to_code` 会输出 HTML/React/Vue 等框架代码[citation:2][citation:6]。由于它原生不直接出 Astro，让 AI 做"React → Astro"的转写，或要求直接出 HTML 后手动包 `<Component />`。

> ⚠️ **坑 9：MCP 输出的是 React/HTML，不是 Astro**
> `design_to_code` 支持 HTML、React、Vue、ArkUI、Flutter[citation:6]，Astro 不在官方列表。
> **解决**：让 AI 分两步——先出 React + Tailwind，再转写为 `.astro` 文件（把 `className` → `class`、去掉 `import`、改成 Astro 组件语法）。或者直接要 HTML，再包裹成 Astro。

**第 3 步：生成页面级代码（组合组件）**

```
选中 Pixso 里的"博客首页"整个 Frame，复制链接。
用 design_to_code 生成页面骨架代码，
要求：
1. 使用 Astro 的 <Base /> 布局
2. 引用第 2 步生成的各个组件
3. 保持响应式断点（sm/md/lg）
4. 图片用 Astro 的 <Image /> 组件
```

**第 4 步：让 AI 用 `get_screenshot` 做视觉对齐**

```
对比生成的页面截图和 Pixso 设计稿截图（用 get_screenshot 获取），
列出所有视觉差异（间距、字号、颜色、对齐），
并直接修正代码。
```

Pixso MCP 的 `get_screenshot` 能直接给 AI 看设计稿长什么样[citation:6]，这是它相比"纯文字描述"最大的优势——**截图 + 结构化数据双通道**，还原度从 ~70% 拉到 ~90%[citation:21]。

### 5.3 提示词模板（直接复制使用）

**提取设计令牌**：
```
读取 {pixso-url} 的设计变量，调用 get_variable_sets 和 get_variables，
输出 src/styles/design-tokens.css，按 color/font/spacing/radius/shadow 分组，
每个变量一行注释说明用途。
```

**组件级生成**：
```
对 {pixso-url} 选中的 {组件名} 节点调用 design_to_code，
输出 Astro + Tailwind v4 代码，保存到 src/components/{name}.astro。
要求：
- 所有颜色引用 CSS 变量，禁止硬编码
- 交互状态（hover/active/focus）完整
- 移动端有 @media 适配
- 类型声明完整
```

**页面级组装**：
```
对 {pixso-url} 的 {页面名} Frame 调用 design_to_code，
输出 src/pages/{page}.astro，使用 Base 布局，
引入已生成的组件，保持响应式。
```

**视觉回归检查**：
```
用 get_screenshot 获取 {pixso-url} 的截图，
与我本地的 src/pages/{page}.astro 渲染结果对比，
列出所有像素级差异并修正。
```

### 5.4 验证生成代码质量

- [ ] 所有颜色为 `var(--token)`，无裸 hex/rgb
- [ ] 间距用 Tailwind 工具类或 `var(--space-N)`
- [ ] 字体引用 `var(--font-mono)` / `var(--font-display)`
- [ ] 圆角用 `var(--radius-md3)` 或 `var(--radius-hud)`
- [ ] 每个 `.astro` 有 `interface Props`
- [ ] 交互脚本标注 `is:inline` 或 `client:*`
- [ ] 响应式断点齐全
- [ ] 图片有 `alt` 属性
- [ ] 无硬编码值（全局搜 `#` 和 `rgb(` 确认）

---

## 6. 阶段五：双向闭环与团队协作

### 6.1 设计 → 代码（正向）

按阶段四的流程循环：
```
Pixso 改设计 → MCP 出码 → AI 优化 → 落地 Astro → 运行验证
```

### 6.2 代码 → 设计（反向）

当代码侧做了修改（比如手调了间距），用 `code_to_design` 反向写回 Pixso[citation:6]：
```
把 src/components/PostCard.astro 的当前代码通过 code_to_design
写回到 Pixso 文件 {file_key} 的"文章卡片"节点下，
保持与现有设计系统一致。
```

这样设计师和开发始终**双向同步**，不会出现"设计稿和代码对不上"的经典扯皮[citation:3]。

### 6.3 一致性自动检查

```
用 query_all_unique_props 审计当前 Pixso 文件里所有颜色、字体、间距，
找出未使用变量的硬编码值，列出并建议绑定到哪个变量。
```

```
用 check_layout 检查 {页面Frame} 的布局结构，
找出潜在问题（重叠、溢出、对齐偏差）并给出修复建议。
```

### 6.4 团队协作流程（推荐）[citation:3]

```
PM 需求 → 设计师在 Pixso 改稿（建令牌、语义命名）
       → 开发者通过 MCP 拉取代码（AI 自动生成）
       → 开发者在 Astro 侧微调后，code_to_design 回写
       → 设计师确认，闭环
```

---

## 7. 完整避坑清单（按阶段归类）

### 导入阶段
| # | 坑 | 后果 | 解决 |
|---|---|---|---|
| 1 | 图层命名混乱 | AI 生成 class 名无意义 | 批量语义化重命名 |
| 2 | 私有字体丢失 | 字体回退错乱 | 替换为本机已安装字体 |

### 设计改造阶段
| # | 坑 | 后果 | 解决 |
|---|---|---|---|
| 3 | 变量未绑定图层 | 输出硬编码颜色 | `set_fill_style` 批量绑定 |
| 4 | HUD 装饰层挡交互 | 生成代码点击失效 | 装饰层置底或设不挡点击 |
| 5 | Auto Layout 未用 | 响应式推断失败 | 关键容器用 Auto Layout |

### MCP 配置阶段
| # | 坑 | 后果 | 解决 |
|---|---|---|---|
| 6 | Pixso 客户端关闭 | MCP 服务断 | 开发期常驻后台 |
| 7 | IDE 版本过低 | MCP 协议不支持 | 升级到支持版本 |
| 8 | 端口 3667 占用 | 服务起不来 | 改端口并同步配置 |

### 代码生成阶段
| # | 坑 | 后果 | 解决 |
|---|---|---|---|
| 9 | 输出 React 非 Astro | 不能直接用 | 让 AI 转写为 .astro |
| 10 | 硬编码颜色 | 后续改主题崩溃 | 提示词强制 var() |
| 11 | 一次生成整页 | 超上下文、准确率低 | 分组件逐个生成[citation:16][citation:21] |
| 12 | 图标（多路径 SVG）还原差 | 图标变形 | 单独导出 SVG 手动替换[citation:16] |
| 13 | 图片资源成占位符 | 图片丢失 | 提示词加"图片通过 localhost 引用"[citation:16] |

### 运行验证阶段
| # | 坑 | 后果 | 解决 |
|---|---|---|---|
| 14 | `prefers-reduced-motion` 未尊重 | 动效过敏用户不适 | 全局媒体查询禁用动画 |
| 15 | HUD 装饰 `pointer-events` 未关 | 遮挡点击 | 装饰层统一 `pointer-events: none` |
| 16 | Canvas/3D 未懒加载 | 首屏性能差 | `client:visible` / `client:only` |

---

## 8. 推荐的目录结构（MCP 生成后落地）

```
mizuki-starship/
├── src/
│   ├── styles/
│   │   ├── design-tokens.css      ← MCP 从 Pixso 变量生成
│   │   ├── global.css
│   │   ├── hud-overlay.css
│   │   └── view-transitions.css
│   ├── components/
│   │   ├── hud/                   ← MCP 逐组件生成
│   │   │   ├── HudShell.astro
│   │   │   └── StarField.astro
│   │   ├── blog/
│   │   │   └── PostCard.astro
│   │   ├── bookshelf/
│   │   │   └── BookshelfBanner.astro
│   │   ├── ai/
│   │   │   └── StarShipAI.astro
│   │   └── sidebar/
│   │       └── Sidebar.astro
│   ├── layouts/
│   │   └── Base.astro
│   └── config.ts
├── public/
│   ├── covers/                    ← MCP get_export_image 导出
│   └── books/
├── docs/                          ← 之前的 8 阶段文档
│   └── ...
└── pixso/                         ← Pixso 工程备份
    └── mizuki-hud.pixso
```

---

## 9. 最终端到端检查清单

### Pixso 侧
- [ ] Mizuki 设计稿成功导入，图层结构完整
- [ ] 所有图层语义化命名
- [ ] 颜色/字体/间距全部用变量，分 sakura / hud 两组
- [ ] 每个组件有 `default` 和 `hud` 变体
- [ ] HUD 装饰元素独立图层、不挡交互
- [ ] Auto Layout 用于响应式容器

### MCP 侧
- [ ] Pixso 桌面端运行中
- [ ] 本地 MCP 服务已开启（端口 3667）
- [ ] IDE 配置完成并连通（圆点绿色）
- [ ] `design_to_code` 工具可调用

### AI 出码侧
- [ ] 设计令牌 → `design-tokens.css` 完整
- [ ] 每个组件单独生成并验证
- [ ] 无硬编码颜色/间距
- [ ] 全部 `.astro` 有 Props 类型
- [ ] 页面级组装正确引用组件

### Astro 运行侧
- [ ] `pnpm dev` 启动无报错
- [ ] 视觉还原度 ≥ 85%（截图对比）
- [ ] 响应式断点正常
- [ ] Lighthouse Performance > 90
- [ ] `prefers-reduced-motion` 生效
- [ ] HUD 装饰不遮挡交互

---

## 10. 一句话总结

**Pixso 负责"画"，MCP 负责"读"，AI 负责"写"，Astro 负责"跑"**——四者串起来，就是一条从 Mizuki 设计稿到可运行科幻 HUD 博客的完整自动化链路。核心成功因素是**设计稿的结构化程度**（语义命名 + 变量绑定），这决定了 AI 出码的上限[citation:3][citation:11]。

---

## 参考资源

- Pixso MCP 官方文档：https://pixso.cn/developer/
- Pixso MCP 落地指南：https://pixso.cn/designskills/pixso-mcp-guide/
- Cursor 配置 Pixso MCP：https://pixso.cn/developer/en/mcp/local-mcp.html
- 设计稿还原对比实测（Pixso vs Figma MCP）：见各技术博客实测[citation:16]
- Astro 官方文档：https://docs.astro.build
- MCP 协议规范：https://modelcontextprotocol.io

---

> 💡 **给 AI 编程助手的最终指令模板**（复制到对话框即可启动整条链路）：
>
> ```
> 请按以下顺序执行：
> 1. 用 get_variable_sets 和 get_variables 读取 {pixso-url} 的设计令牌，
>    输出 src/styles/design-tokens.css
> 2. 对 {pixso-url} 的"导航栏"节点调用 design_to_code，
>    输出 src/components/hud/HudNav.astro（Astro + Tailwind v4）
> 3. 对"文章卡片"节点重复步骤 2
> 4. 用 get_screenshot 对比设计稿与我的渲染结果，列出差异并修正
> 5. 所有颜色必须 var(--token)，禁止硬编码
> ```
