# Qiao Personal Site · Notion CMS V3

可直接部署到 Vercel 的 Next.js 个人网站。公开页面只读取 `Published=true` 的内容；编辑密码验证成功后，可在网站内新增、修改并保存到 Notion。Notion Token 只在 Route Handler（服务端）使用，不会打包进浏览器。

## Notion 数据库

已预填 URL 中的 database/container ID：`b68ae49015744ad49043f202c85a90d2`。URL 的 `v=6b867...` 是 view ID，不用于 API。

本项目固定使用 Notion API `2025-09-03`。该版本把 database（容器）与 data source（表）分开：查询和创建页面必须使用 data source ID。你有两种配置方式：

1. 推荐：在 Notion 数据库菜单中打开 **Manage data sources → Copy data source ID**，将其填入 `NOTION_DATA_SOURCE_ID`。
2. 省事方式：留空 `NOTION_DATA_SOURCE_ID`。服务端首次请求会调用 `GET /v1/databases/{NOTION_DATABASE_ID}`，若容器内恰好只有一个 data source，就自动使用它；如果有多个，会明确报错并要求配置。

首次以编辑密码登录时，网站会调用 `/api/setup`，自动补齐缺失字段：`Name` (Title)、`Type` (Select)、`Category` (Select)、`Summary` (Rich text)、`Content` (Rich text)、`Published` (Checkbox)、`Sort` (Number)。Integration 必须对数据库有读取、插入和更新内容权限。

## 本地运行

```bash
cp .env.example .env.local
npm install
npm run dev
```

在 `.env.local` 填入真实值，但不要提交该文件，也不要把 Token 粘贴到聊天、前端代码或任何 `NEXT_PUBLIC_*` 环境变量。

## Vercel 部署

1. 将项目导入 Vercel（Framework Preset: Next.js）。
2. 在 Project Settings → Environment Variables 中为 Production/Preview 配置：
   - `NOTION_TOKEN`：SmartCat_connection 的 Internal Integration Secret（必填，secret）
   - `NOTION_DATABASE_ID`：`b68ae49015744ad49043f202c85a90d2`（必填）
   - `NOTION_DATA_SOURCE_ID`：推荐填写；单 data source 时可留空
   - `EDITOR_PASSWORD`：网站编辑模式密码（必填，使用强密码）
   - `SESSION_SECRET`：至少 32 字符随机值（必填，可用 `openssl rand -base64 48`）
3. 重新部署。打开网站，点「编辑」，登录后会完成 schema 初始化。

## 安全说明

- Token 仅由服务端 `lib/notion.ts` 读取。
- 编辑会话使用 HttpOnly、SameSite=Strict、生产环境 Secure 的签名 Cookie。
- 所有写请求要求已登录并校验同源 Origin。
- 公开 API 不返回草稿；登录编辑模式后才返回全部内容。
- `Content` 使用 Notion rich_text property，单条文本按 API 限制截断到 2,000 字符。需要长文时，建议下一版改为 page blocks。

## 验证

```bash
npm run typecheck
npm run build
```
