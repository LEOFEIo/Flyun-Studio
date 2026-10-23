# 飞云 FEIYUN · AI 人才智能

飞云是一套面向稀缺 AI 人才发现、证据验证、职位匹配与招聘协作的全栈网站。项目同时提供 Next.js 正式版本和 GitHub Pages 静态演示入口。

## 主要能力

- 自然语言人才搜索、历史任务复用、候选人对比与收藏名单 CSV 导出
- 人才研究 Mission Control：任务新增、状态推进、筛选、本地持久化与报告导出
- 职位探索器：全文搜索、方向/工作方式筛选、排序与职位收藏
- 招聘计划、人才档案、职位与申请流程
- 候选人工作台、招聘方后台和管理控制台
- 中英文切换、浅色/深色主题和响应式布局
- Supabase 公共 Data API 连接，离线或未建表时自动使用演示数据
- 可选 PostgreSQL 服务端连接，用于私密档案、申请和后台持久化

## 设计系统

正式 Next.js 网站采用 iOS 风格：浅灰画布、白色圆角卡片、系统字体、蓝色主操作和半透明导航。提供浅色/深色模式、手机分段导航、可用键盘操作的原生邀约弹窗。视觉规范见 [`DESIGN.md`](DESIGN.md)。

## 面试与候选人邀约

- `/recruiter` 可搜索候选人、筛选招聘阶段、创建面试并自动发送邮件。
- 候选人通过专属链接接受或婉拒；接受后可添加到日历，申请阶段同步更新。
- 邀请持久化、重复提交去重、邮件失败原因与重试、链接复制均已实现。
- 未连接数据库时明确展示演示数据，发送保持关闭。

真实发信需要 PostgreSQL、管理员配置、至少 32 字符的 `AUTH_SECRET`、公开网站地址和 Resend 邮件配置，并执行一次面试表初始化。具体步骤见 [`INTERVIEWS.md`](INTERVIEWS.md)。邮件服务接受请求与收件箱送达分别展示和核实；本地无生产凭据时不会声称已验证真实投递。

## 页面入口

| 功能 | Next.js | 静态演示 |
| --- | --- | --- |
| 首页 | `/` | `index.html` |
| 登录 | `/signin` | `login.html` |
| 注册 | `/register` | — |
| 职位 | `/jobs` | 首页职位区 |
| 候选人中心 | `/candidate` | `candidate.html` |
| 招聘方后台 | `/recruiter` | `recruiter.html` |
| 管理控制台 | `/admin` | 静态招聘方演示 |
| Supabase 状态 | `/api/supabase/status` | 页面加载时自动检测 |

## Supabase

项目已配置以下公开连接变量：

```env
NEXT_PUBLIC_SUPABASE_URL=https://neppacfsixrjzpkvcgxy.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YSgMffoDWwjYnjBrYYKTLQ_08Y5BLrz
```

Publishable key 本身可以出现在浏览器代码中，但它只能与 Row Level Security（RLS）一起使用。仓库不会包含 secret 或 service-role key。

在 Supabase SQL Editor 中执行一次 [`supabase-schema.sql`](supabase-schema.sql)，即可让公开职位和已验证人才通过 Data API 提供给网站。未执行或云端暂时不可用时，页面会安全回退到内置演示数据。

当前 publishable 连接只开放：

- 匿名读取 `status = active` 的职位
- 匿名读取 `verified = true` 的人才档案
- Supabase Auth 中 `app_metadata.role = admin` 的账号管理这两类数据

电话、薪资、申请和个人私密资料不会开放匿名写入。若要让这些数据持久化，请在部署平台配置仅服务端可见的 `DATABASE_URL`，或继续完成 Supabase Auth 用户级 RLS 迁移。

## 环境变量

复制 `.env.example` 为 `.env.local`，并设置：

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
DATABASE_URL=
AUTH_SECRET=
ADMIN_USERNAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

- `AUTH_SECRET` 在生产环境必填，建议使用足够长的随机值。
- `ADMIN_*` 在生产环境不会使用源码默认密码；未配置时管理员登录保持关闭。
- `DATABASE_URL` 只能使用服务端 PostgreSQL 连接串，不能填写 publishable key。
- GitHub OAuth 未配置时仍可通过公开 GitHub 用户名同步公开资料。

## 本地运行

要求 Node.js 22.13 或更高版本：

```bash
npm install
npm run dev
```

生产检查：

```bash
npm run check
```

数据库结构初始化不再在每次构建时自动执行。如使用服务端 `DATABASE_URL`，请在确认目标数据库后手动运行：

```bash
npm run db:setup
```

## 部署

完整功能建议导入 Vercel 并选择 Next.js。GitHub Pages 只能运行根目录的 HTML/CSS/JavaScript 静态演示，无法运行 `/api/*`、SSR 或安全的服务端登录。

项目品牌、界面和演示数据均为“飞云 FEIYUN”原创内容。

