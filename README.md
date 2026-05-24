# FLYUN STUDIO · 飞云工作室

FLYUN 定义下一代交互智能 · 交互空间 / VR · AR / 猎头人才

一个纯静态站点（无构建步骤）+ 一个浏览器端 CMS（`assets/flyun-cms.js`）+ Supabase 云后端。
所有页面都加载同一份 `flyun-cms.js`，由它统一处理：中英双语、深色/浅色主题、内容覆盖、博客/案例/Letter/招聘的全流程发布、首页关键图片替换、以及与 Supabase 的双向同步。

## 目录结构

```
.
├── index.html        主站
├── blog.html         博客 · Journal（公开访客可见）
├── cases.html        案例档案
├── letter.html       FLYUN Letter 双月刊
├── job.html          招聘
├── lab.html          实验室
├── F.html / X.html / M.html / Z.html  猎头工作站
├── admin.html        私人后台（默认密码 flyun2026）
├── assets/
│   └── flyun-cms.js  CMS 核心：i18n + 主题 + Supabase 云同步
├── supabase-schema.sql  数据库初始化脚本
└── image/
```

## 一次性 · 数据库初始化

1. 打开 Supabase 项目的 SQL 编辑器
   <https://app.supabase.com/project/neppacfsixrjzpkvcgxy/sql>
2. 把 [`supabase-schema.sql`](supabase-schema.sql) 整个粘进去，点 **Run**。
   会创建 7 张表（posts / cases / letters / jobs / site_content / site_images / site_settings），并启用 RLS：
   - 公开匿名读：访客直接读到「published / open」数据
   - 已登录用户写：管理员才可写入
3. 在 **Authentication → Users → Add user** 新建一个邮箱密码用户（这是工作室的「主理人」帐号）。

## 日常使用

### 公开访客（任何人）

- 打开 `blog.html` / `cases.html` / `letter.html` / `job.html` 等页面，会自动从 Supabase 拉取已发布的内容。
- 右上角可切换 **EN / 中** 与 **☼ / ☾**（浅色 / 深色），偏好持久化保存在浏览器。

### 工作室主理人

1. 隐式入口进入 `admin.html`：
   - 任意页面输入 `flyun`（连续 5 个字母）
   - 或按 `Ctrl + Alt + A`
   - 或在地址后加 `#studio`
2. 输入访问口令（默认 `flyun2026`，进入后可在「系统」里改）。
3. 在「**系统 · 云同步**」里用 Supabase 用户邮箱登录。
   登录后：
   - 顶部状态条变为 `SYNC · CLOUD`
   - 之后所有写入（保存博客 / 案例 / Letter / 招聘 / 文案 / 图片）会自动同步到云端
   - 公开访客打开任意页面就能看到

### 工作台分区

| 区块 | 作用 |
|---|---|
| 概览 | 内容数量、云端连接状态 |
| 首页文案 | 中英双语编辑首页所有文案（`data-i18n` 键） |
| 首页图片 | 替换 Hero / 主创头像 / 6 个 SHOWCASE 案例封面 |
| 博客 · Journal | 双语博客，状态：草稿 / 已发布 |
| 案例 · Cases | 案例档案 CRUD，自动出现在 cases.html 顶部 |
| Letter · 双月刊 | FLYUN Letter 期刊 |
| 招聘 · Jobs | 招聘岗位（开放 / 已截止 / 草稿） |
| 图片库 | 通用图片仓库（URL / 上传转 Base64） |
| 系统 · 云同步 | Supabase 登录 / 推送 / 拉取 / JSON 备份 |

## 关键设计

- **零构建**：所有页面都是单文件 HTML，CDN 加载字体与 Supabase JS（按需）。
- **离线可用**：所有数据先写本地 `localStorage`，再异步推到云。断网仍可读。
- **publishable key 在前端可见**：受 RLS 保护；写操作必须经过 Supabase Auth。
- **i18n + 主题 + 图片 全靠 data-* 属性**：
  - `data-i18n="key"` / `data-i18n-mode="html"`
  - `data-i18n-attr="placeholder:key"`
  - `data-cms-img="home.case.1"` 任何元素都能被后台替换图
  - `data-lang-mount` / `data-lang-toggle` / `data-theme-toggle` 自动注入按钮

## 本地开发

不需要任何工具链，把仓库克隆下来用静态服务器打开即可：

```sh
python3 -m http.server 8080
# 然后浏览 http://localhost:8080/index.html
```
