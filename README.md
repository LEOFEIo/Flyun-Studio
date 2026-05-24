# FLYUN STUDIO · 飞云工作室

> 定义下一代交互智能 — 交互空间 / VR · AR / 猎头人才。

一站式静态站点 + 内置「云端 CMS」(Supabase) ——
博客对全网访客可见，主理人通过隐藏后台 (`admin.html`) 实时编辑文案、首页板块图片与博客。

---

## 站点结构

| 文件 | 用途 |
| --- | --- |
| `index.html` | 主站首页 |
| `cases.html` | 案例档案 |
| `lab.html` | 实验室 (孵化中概念) |
| `letter.html` | Letter 双月刊 |
| `blog.html` | 博客 / Journal — 公开可见，从 Supabase 实时拉取 |
| `F.html` / `M.html` / `X.html` / `Z.html` / `job.html` | 飞云猎头业务子产品 (独立 SaaS 风格) |
| `admin.html` | 私密后台 — 隐藏入口（见下） |

### 公共资源

| 文件 | 用途 |
| --- | --- |
| `assets/flyun-supabase.js` | Supabase 客户端（posts / content / images / settings / auth） |
| `assets/flyun-cms.js` | 多语言 + 内容覆盖 + 图片绑定 + Supabase 引导 |
| `assets/flyun-theme.js` | 深色 / 浅色主题切换（CSS 变量 + 偏好持久化） |
| `db/schema.sql` | Supabase 数据库初始化脚本（含 RLS 策略 + Storage bucket） |

---

## 一次性配置 Supabase

> 本仓库已预置 Supabase 项目地址与可发布的 anon key（写在 `assets/flyun-supabase.js`）。
> 如需更换为自己的项目，修改文件顶部的 `SUPABASE_URL` / `SUPABASE_KEY` 两个常量即可。

1. 打开 [Supabase 控制台](https://supabase.com/dashboard) → 进入项目。
2. 左侧 **SQL Editor** → New query → 粘贴 [`db/schema.sql`](./db/schema.sql) 全文 → **Run**。
   一次性创建 `posts` / `content_overrides` / `images` / `site_settings` 四张表，
   配置 RLS（公开读 / 登录写），并创建 `flyun-public` Storage bucket。
3. **Authentication → Providers** → 打开 **Email** provider。
4. **Authentication → Users → Add user** 创建主理人账号
   （或者直接在 `admin.html` 登录页点「注册账号」，再去邮箱点验证链接）。

完成。`https://your-domain/blog.html` 打开即对所有访客可见。

---

## 进入后台

`admin.html` 在导航里没有任何入口。主理人可用以下任一方式进入：

| 方式 | 触发 |
| --- | --- |
| 键盘组合 | `Ctrl/⌘ + Alt + A` |
| 触发短语 | 在任意页面（不在输入框时）连续按 `f-l-y-u-n` |
| URL 锚点 | 在任意页地址末尾加 `#studio` |

进入后两种登录模式：

- **云端登录 / CLOUD** — 用 Supabase 邮箱+密码登录，所有保存同步到数据库，全网访客可见。
- **本机口令 / LOCAL** — 默认 `flyun2026`，仅本地预览，不会让访客看到改动。
  适合先草拟，再切换到云端账号统一发布。

### 后台能做什么

| 板块 | 功能 |
| --- | --- |
| 概览 | 文案 / 文章 / 图片统计 + 一键 *从云端拉取* / *推送上云* |
| 首页文案 | 修改主页所有 i18n 文本（中英分栏，支持 HTML） |
| 首页板块 | 替换主创头像与 6 张案例封面（点击上传 / 粘贴 URL） |
| 图片资源 | 通用图床 — 任意 key，支持 URL / Base64 / 上传到 Supabase Storage |
| 博客 / Journal | 双语 Markdown 写作（标题 / 正文 / 摘要），发布即对全网生效 |
| 站点设置 | 默认主题、公告条、SEO tagline、联系邮箱 |
| 系统 | 备份 (导出 JSON) / 恢复 / 切换账号 / 清空本机缓存 |

---

## 主题切换

每页 nav 右侧自带「☼ / ☾」按钮，点一下切换深色 / 浅色。
偏好保存在 `localStorage:flyun:theme`，跨页面、跨标签页同步。
默认跟随访客系统设置，主理人也可在「站点设置 → 默认主题」里强制锁定。

---

## 数据流

```
访客 → blog.html / index.html
         ↓ (read-only, anon key)
       Supabase  ←  admin.html  →  本地缓存 (localStorage)
                     (auth user)
```

- 任何页面加载时，`flyun-cms.js` 会先读 localStorage（瞬间显示上次的快照），
  再异步从 Supabase 拉取最新版本并刷新 DOM —— 第二次访问的访客几乎零等待。
- 后台保存默认双写：先写 localStorage（用于本机预览），登录云端后再 upsert 到 Supabase。

---

## 本地预览

纯静态站点，任意 HTTP 服务器都能跑。最简单：

```bash
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

或者直接双击 `index.html`（部分浏览器对 ES module CDN 有 CORS 要求，
如不行就用上面的 http server）。
